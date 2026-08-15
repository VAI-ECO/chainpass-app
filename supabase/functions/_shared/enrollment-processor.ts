import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { emitEvent } from "./emit-event.ts";

const VAI_ALPHABET = "ABCDEFGHJKLMNPQRTUVWXY23456789"; // A-Z, 2-9, excluding I, O, S, Z
const MAX_VAI_ATTEMPTS = 10;

interface EnrollmentInput {
  sessionId: string;
  complycubeClientId: string;
  livePhotoBlob: ArrayBuffer;
  documentExpiry: string;
  faceVector: number[];
  faceModel: string;
  faceModelVersion: string;
  enrollmentScore: number;
}

interface EnrollmentResult {
  vai: string;
  enrollment_score: number;
}

/**
 * Generate a unique 7-character V.A.I.
 * Alphabet: A-Z and 2-9, excluding I, O, S, Z
 */
async function generateVAI(supabase: SupabaseClient): Promise<string> {
  for (let attempt = 0; attempt < MAX_VAI_ATTEMPTS; attempt++) {
    // Generate random 7-character string
    const vai = Array.from({ length: 7 }, () => {
      const randomIndex = Math.floor(Math.random() * VAI_ALPHABET.length);
      return VAI_ALPHABET[randomIndex];
    }).join("");

    // Check for collision
    const { data, error } = await supabase
      .from("credentials")
      .select("vai")
      .eq("vai", vai)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check V.A.I. uniqueness: ${error.message}`);
    }

    if (!data) {
      console.log(`[V.A.I.] Generated: ${vai}`);
      return vai;
    }

    console.log(`[V.A.I.] Collision detected: ${vai}, retrying...`);
  }

  throw new Error(`Failed to generate unique V.A.I. after ${MAX_VAI_ATTEMPTS} attempts`);
}

/**
 * Store baseline photo in baseline-photos bucket
 *
 * IMPORTANT: Application-level encryption of baseline photos is NOT implemented.
 * This is an open decision requiring a key management approach that does not
 * store the key beside the data. Current implementation relies on:
 * - Supabase storage server-side encryption at rest
 * - Private bucket with no public access policy
 * - Random opaque filenames with no relationship to V.A.I.
 */
async function storeBaselinePhoto(
  supabase: SupabaseClient,
  photoBlob: ArrayBuffer
): Promise<string> {
  // Generate random opaque filename with no relationship to V.A.I.
  // The database row points to the file; the file must point to nothing.
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const filename = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');

  const { error: uploadError } = await supabase.storage
    .from("baseline-photos")
    .upload(filename, photoBlob, {
      contentType: "image/jpeg",
      upsert: false, // Should never collide with random 128-bit filename
    });

  if (uploadError) {
    throw new Error(`Failed to store baseline photo: ${uploadError.message}`);
  }

  console.log(`[Storage] Baseline photo stored: ${filename}`);
  return filename;
}

/**
 * Process enrollment: generate V.A.I., store baseline, create credential
 *
 * THE SEALED ROOM: ComplyCube already verified this person IS the person.
 * Whatever enrollment score we get IS their personal 100%. We NEVER reject on low score.
 * A low score just means a bad photograph. Store it and move on.
 *
 * @param supabase - Supabase client
 * @param input - Enrollment input (ComplyCube results + face service results)
 * @returns VAI and enrollment score
 */
export async function processEnrollment(
  supabase: SupabaseClient,
  input: EnrollmentInput
): Promise<EnrollmentResult> {
  console.log(`[Enrollment] Processing for session ${input.sessionId}`);
  console.log(`[Sealed Room] Enrollment score: ${input.enrollmentScore} (no threshold, never reject)`);

  // Step 1: Generate V.A.I.
  const vai = await generateVAI(supabase);

  // Step 2: Store baseline photo
  const photoRef = await storeBaselinePhoto(supabase, input.livePhotoBlob);

  // Step 3: Get credential dates using set_credential_dates function
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const { data: dates, error: datesError } = await supabase
    .rpc("set_credential_dates", {
      p_issued: today,
      p_document_expiry: input.documentExpiry,
    });

  if (datesError || !dates || dates.length === 0) {
    throw new Error(`Failed to calculate credential dates: ${datesError?.message || "No result"}`);
  }

  const { next_renewal, next_complycube } = dates[0];
  console.log(`[Dates] Renewal: ${next_renewal}, ComplyCube: ${next_complycube}`);

  // Step 4: Insert credentials
  const { error: credentialsError } = await supabase
    .from("credentials")
    .insert({
      vai: vai,
      state: "active",
      complycube_client_id: input.complycubeClientId,
      document_expiry: input.documentExpiry,
      next_renewal_date: next_renewal,
      next_complycube_date: next_complycube,
      screening_state: "pending",
    });

  if (credentialsError) {
    throw new Error(`Failed to insert credentials: ${credentialsError.message}`);
  }

  console.log(`[Credentials] Inserted: ${vai}`);

  // Step 5: Insert baselines (append-only, never update/delete)
  const { error: baselinesError } = await supabase
    .from("baselines")
    .insert({
      vai: vai,
      vector: JSON.stringify(input.faceVector), // pgvector expects array as JSON string
      model: input.faceModel,
      model_version: input.faceModelVersion,
      enrollment_score: input.enrollmentScore,
      photo_ref: photoRef,
      source: "complycube",
    });

  if (baselinesError) {
    throw new Error(`Failed to insert baseline: ${baselinesError.message}`);
  }

  console.log(`[Baselines] Inserted: vector=${input.faceVector.length} floats, score=${input.enrollmentScore}`);

  // Step 6: Update session to complete
  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      state: "complete",
      vai: vai,
    })
    .eq("id", input.sessionId);

  if (updateError) {
    throw new Error(`Failed to update session: ${updateError.message}`);
  }

  console.log(`[Session] Updated to complete with V.A.I.: ${vai}`);

  // Step 6b: Link credential to the session's platform (same as enroll-in-house)
  const { data: sessionRow, error: sessionLookupError } = await supabase
    .from("sessions")
    .select("platform_id")
    .eq("id", input.sessionId)
    .single();

  if (sessionLookupError || !sessionRow) {
    throw new Error(`Failed to load session platform: ${sessionLookupError?.message || "No session found"}`);
  }

  const { error: platformLinkError } = await supabase
    .from("credential_platforms")
    .insert({
      vai: vai,
      platform_id: sessionRow.platform_id,
    });

  if (platformLinkError) {
    throw new Error(`Failed to insert credential_platforms: ${platformLinkError.message}`);
  }

  console.log(`[Platform Link] Inserted: vai=${vai}, platform=${sessionRow.platform_id}`);

  // Step 7: Emit credential.issued event
  await emitEvent(supabase, vai, "credential.issued", {
    issued_date: today,
  });

  console.log(`[Enrollment] Complete: V.A.I. ${vai}`);

  return {
    vai,
    enrollment_score: input.enrollmentScore,
  };
}
