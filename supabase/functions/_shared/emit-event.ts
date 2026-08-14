import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type EventType =
  | "credential.issued"
  | "credential.renewed"
  | "credential.expiring"
  | "credential.expired"
  | "credential.awaiting"
  | "credential.locked"
  | "credential.suspended"
  | "credential.banned"
  | "document.expired"
  | "rebaseline.complete"
  | "unlock.complete"
  | "session.ready";

/**
 * Emits a credential event to all platforms that have seen this VAI.
 *
 * Creates one row per platform in credential_events with a shared emission_id.
 * This allows tracking that multiple platforms received the same state change.
 *
 * Events are queued for ALL platforms (including disabled webhooks) so they
 * can replay when re-enabled.
 *
 * @param supabase - Supabase client (uses caller's transaction)
 * @param vai - The VAI this event concerns
 * @param type - Event type
 * @param payload - Additional event data (must not contain PII)
 */
export async function emitEvent(
  supabase: SupabaseClient,
  vai: string,
  type: EventType,
  payload: Record<string, any> = {}
): Promise<void> {
  // Generate shared emission ID for this state change
  const emission_id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // Build event payload (safe fields only)
  const eventPayload = {
    vai,
    type,
    timestamp,
    ...payload,
  };

  // Query ALL platforms that have seen this VAI
  // Do NOT filter by webhook_state - disabled platforms must receive queued events
  const { data: platforms, error: platformsError } = await supabase
    .from("credential_platforms")
    .select("platform_id")
    .eq("vai", vai);

  if (platformsError) {
    console.error(`[emit-event] Failed to query platforms for VAI ${vai}:`, platformsError);
    throw platformsError;
  }

  if (!platforms || platforms.length === 0) {
    console.warn(`[emit-event] No platforms found for VAI ${vai}, event not queued`);
    return;
  }

  // Insert one row per platform with unique event_id but shared emission_id
  const events = platforms.map((p) => ({
    event_id: crypto.randomUUID(),
    emission_id,
    platform_id: p.platform_id,
    vai,
    type,
    payload: eventPayload,
    attempts: 0,
    delivered_at: null,
  }));

  const { error: insertError } = await supabase
    .from("credential_events")
    .insert(events);

  if (insertError) {
    console.error(`[emit-event] Failed to insert events for VAI ${vai}:`, insertError);
    throw insertError;
  }

  console.log(
    `[emit-event] Queued ${events.length} event(s) for VAI ${vai}, type ${type}, emission ${emission_id}`
  );
}
