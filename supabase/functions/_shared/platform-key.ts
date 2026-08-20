import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type PlatformRow = {
  id: string;
  display_name: string;
  service_level: number | null;
  status: string | null;
  api_key_hash: string | null;
};

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Resolve platform from the raw API key. Key is never logged.
 * Looks up platforms.api_key_hash = sha256(key).
 */
export async function resolvePlatformByApiKey(
  supabase: SupabaseClient,
  apiKey: string
): Promise<PlatformRow> {
  if (!apiKey) {
    throw new Error("platform API key is required");
  }

  const api_key_hash = await sha256Hex(apiKey);

  const { data, error } = await supabase
    .from("platforms")
    .select("id, display_name, service_level, status, api_key_hash")
    .eq("api_key_hash", api_key_hash)
    .maybeSingle();

  if (error) {
    throw new Error(`platform lookup failed: ${error.message}`);
  }
  if (!data) {
    throw new Error("invalid platform API key");
  }
  if (data.status === "suspended" || data.status === "disabled") {
    throw new Error(`platform is ${data.status}`);
  }
  if (data.service_level == null) {
    throw new Error("platform has no service_level configured");
  }

  return data as PlatformRow;
}

/** Extract Bearer token or X-Api-Key from the request. */
export function extractApiKey(req: Request): string | null {
  const x = req.headers.get("x-api-key");
  if (x?.trim()) return x.trim();

  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}
