import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const EVENTS_PER_PLATFORM_PER_RUN = 10;
const DELIVERY_TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 10;

interface CredentialEvent {
  id: number;
  event_id: string;
  emission_id: string;
  platform_id: string;
  vai: string;
  type: string;
  payload: any;
  attempts: number;
  delivered_at: string | null;
  created_at: string;
}

interface Platform {
  id: string;
  webhook_url: string;
  webhook_secret: string;
}

serve(async (req) => {
  console.log("[deliver-events] Starting delivery run");

  // Authenticate caller by service key, same scheme as verify-vai-facial
  const serviceKeyHeader = req.headers.get("x-service-key");
  if (!serviceKeyHeader) {
    return new Response(
      JSON.stringify({ error: "Missing x-service-key header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const keyHash = await hashServiceKey(serviceKeyHeader);
    const { data: caller, error: callerError } = await supabase
      .from("platforms")
      .select("id")
      .eq("api_key_hash", keyHash)
      .single();

    if (callerError || !caller) {
      console.error("[deliver-events] Invalid service key");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Query undelivered events for platforms with active webhooks
    const { data: events, error: eventsError } = await supabase
      .from("credential_events")
      .select(`
        id,
        event_id,
        emission_id,
        platform_id,
        vai,
        type,
        payload,
        attempts,
        delivered_at,
        created_at
      `)
      .is("delivered_at", null)
      .order("created_at", { ascending: true });

    if (eventsError) {
      console.error("[deliver-events] Failed to query events:", eventsError);
      throw eventsError;
    }

    if (!events || events.length === 0) {
      console.log("[deliver-events] No undelivered events found");
      return new Response(
        JSON.stringify({ message: "No undelivered events" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get platform details for all platforms with pending events
    const platformIds = [...new Set(events.map((e) => e.platform_id))];
    const { data: platforms, error: platformsError } = await supabase
      .from("platforms")
      .select("id, webhook_url, webhook_secret, webhook_state")
      .in("id", platformIds);

    if (platformsError) {
      console.error("[deliver-events] Failed to query platforms:", platformsError);
      throw platformsError;
    }

    // Filter to only active platforms with configured webhooks
    const activePlatforms = new Map<string, Platform>();
    platforms?.forEach((p) => {
      if (p.webhook_state === "active" && p.webhook_url) {
        activePlatforms.set(p.id, {
          id: p.id,
          webhook_url: p.webhook_url,
          webhook_secret: p.webhook_secret || "",
        });
      }
    });

    // Group events by platform and limit per platform
    const eventsByPlatform = new Map<string, CredentialEvent[]>();
    for (const event of events) {
      // Skip events for platforms that aren't active
      if (!activePlatforms.has(event.platform_id)) {
        continue;
      }

      if (!eventsByPlatform.has(event.platform_id)) {
        eventsByPlatform.set(event.platform_id, []);
      }

      const platformEvents = eventsByPlatform.get(event.platform_id)!;
      if (platformEvents.length < EVENTS_PER_PLATFORM_PER_RUN) {
        platformEvents.push(event);
      }
    }

    console.log(
      `[deliver-events] Processing ${eventsByPlatform.size} platform(s) with undelivered events`
    );

    // Deliver events
    let successCount = 0;
    let failureCount = 0;
    let disabledCount = 0;

    for (const [platformId, platformEvents] of eventsByPlatform) {
      const platform = activePlatforms.get(platformId)!;

      console.log(
        `[deliver-events] Delivering ${platformEvents.length} event(s) to platform ${platformId}`
      );

      for (const event of platformEvents) {
        const result = await deliverEvent(supabase, event, platform);

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (result.disabled) {
            disabledCount++;
          }
        }
      }
    }

    const summary = {
      message: "Delivery run complete",
      events_delivered: successCount,
      events_failed: failureCount,
      webhooks_disabled: disabledCount,
    };

    console.log("[deliver-events]", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[deliver-events] Fatal error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Delivers a single event to a platform's webhook endpoint
 */
async function deliverEvent(
  supabase: any,
  event: CredentialEvent,
  platform: Platform
): Promise<{ success: boolean; disabled: boolean }> {
  try {
    const payloadString = JSON.stringify(event.payload);

    // Sign payload using SHA-256(payload + secret)
    // Mirrors receive-vairify-webhook algorithm
    const signature = await signPayload(payloadString, platform.webhook_secret);

    // POST to webhook URL with 5 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(platform.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-chainpass-signature": signature,
        },
        body: payloadString,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Any 2xx status is success
    if (response.ok) {
      await supabase
        .from("credential_events")
        .update({ delivered_at: new Date().toISOString() })
        .eq("id", event.id);

      console.log(
        `[deliver-events] ✓ Event ${event.event_id} delivered to ${platform.id}`
      );

      return { success: true, disabled: false };
    } else {
      // Non-2xx response is a failure
      console.warn(
        `[deliver-events] ✗ Event ${event.event_id} failed: HTTP ${response.status}`
      );
      return await handleFailure(supabase, event, platform);
    }
  } catch (error) {
    // Network error, timeout, or other exception
    console.warn(
      `[deliver-events] ✗ Event ${event.event_id} failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return await handleFailure(supabase, event, platform);
  }
}

/**
 * Handles delivery failure - increments attempts, disables after 10th failure
 */
async function handleFailure(
  supabase: any,
  event: CredentialEvent,
  platform: Platform
): Promise<{ success: boolean; disabled: boolean }> {
  const newAttempts = event.attempts + 1;

  // Increment attempts counter
  await supabase
    .from("credential_events")
    .update({ attempts: newAttempts })
    .eq("id", event.id);

  // After 10th failure, disable the webhook
  if (newAttempts >= MAX_ATTEMPTS) {
    await supabase
      .from("platforms")
      .update({ webhook_state: "disabled" })
      .eq("id", platform.id);

    console.error(
      `[deliver-events] 🚨 Platform ${platform.id} webhook DISABLED after ${MAX_ATTEMPTS} failed attempts`
    );

    return { success: false, disabled: true };
  }

  return { success: false, disabled: false };
}

/**
 * Hash a service key using SHA-256
 * Same algorithm as verify-vai-facial/index.ts
 */
async function hashServiceKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Signs a payload using SHA-256(payload + secret)
 * Mirrors the algorithm in receive-vairify-webhook/index.ts
 */
async function signPayload(
  payloadString: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadString + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return signature;
}
