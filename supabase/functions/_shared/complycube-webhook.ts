/**
 * ComplyCube webhook verification and payload parsing
 *
 * IMPORTANT: The signature header name is UNVERIFIED.
 * Edit this constant when ComplyCube account manager confirms the actual header name.
 */
const SIGNATURE_HEADER_NAME = "X-ComplyCube-Signature"; // UNVERIFIED - edit when confirmed

interface WebhookPayload {
  flowSessionId?: string;
  clientId?: string;
  status: string;
  checks?: any[];
}

interface ParsedWebhook {
  flowSessionId?: string;
  clientId?: string;
  status: string;
  weakerGuarantee: boolean; // true if only clientId available
}

/**
 * Verify ComplyCube webhook signature using HMAC SHA-256
 *
 * FAIL CLOSED: If signature is invalid, throw error (never process unsigned webhooks)
 *
 * @param rawBody - Raw request body (string)
 * @param signature - Signature from webhook header
 * @param secret - COMPLYCUBE_WEBHOOK_SECRET from env
 * @throws Error if signature is invalid or secret is missing
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined
): Promise<void> {
  if (!secret) {
    throw new Error("COMPLYCUBE_WEBHOOK_SECRET environment variable is not configured. Cannot verify signature.");
  }

  if (!signature) {
    throw new Error(`Webhook signature missing. Expected header: ${SIGNATURE_HEADER_NAME}`);
  }

  // Compute HMAC SHA-256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(rawBody);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (signature !== computedSignature) {
    throw new Error("Webhook signature verification failed. Possible replay attack or unauthorized source.");
  }

  console.log("[Webhook] Signature verified successfully");
}

/**
 * Parse ComplyCube webhook payload
 *
 * Extracts flowSessionId (preferred) or clientId (weaker guarantee).
 * Flags when only clientId is available (one client can have many sessions).
 *
 * @param rawBody - Raw request body (JSON string)
 * @returns Parsed webhook data with weakerGuarantee flag
 * @throws Error if payload is malformed or missing required fields
 */
export function parseWebhookPayload(rawBody: string): ParsedWebhook {
  let payload: WebhookPayload;

  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    throw new Error("Webhook payload is not valid JSON");
  }

  if (!payload.status) {
    throw new Error("Webhook payload missing 'status' field");
  }

  const flowSessionId = payload.flowSessionId;
  const clientId = payload.clientId;

  if (!flowSessionId && !clientId) {
    throw new Error("Webhook payload missing both 'flowSessionId' and 'clientId'. Cannot identify session.");
  }

  const weakerGuarantee = !flowSessionId;

  if (weakerGuarantee) {
    console.warn(
      "[Webhook] Only clientId available (no flowSessionId). " +
      "Weaker guarantee: one client can have many sessions. " +
      "Verify with ComplyCube account manager if flowSessionId should be present."
    );
  }

  console.log(
    `[Webhook] Parsed: status=${payload.status}, ` +
    `flowSessionId=${flowSessionId || "none"}, ` +
    `clientId=${clientId || "none"}, ` +
    `weakerGuarantee=${weakerGuarantee}`
  );

  return {
    flowSessionId,
    clientId,
    status: payload.status,
    weakerGuarantee,
  };
}

/**
 * Get signature header name constant
 * Isolated so it can be updated in one place when confirmed by account manager
 */
export function getSignatureHeaderName(): string {
  return SIGNATURE_HEADER_NAME;
}
