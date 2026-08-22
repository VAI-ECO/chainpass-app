import { supabase } from "@/integrations/supabase/client";

export const ENROLMENT_SESSION_KEY = "enrolment_session_id";
export const ENROLMENT_TOKEN_KEY = "enrolment_token";

export const QUERY_FORBIDDEN = new Set([
  "token",
  "enrolment_token",
  "enrollment_token",
  "platform",
  "platform_id",
]);

export function restHostFromEnv(): string {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

export function getEnrolmentSessionId(): string | null {
  return sessionStorage.getItem(ENROLMENT_SESSION_KEY);
}

export function setEnrolmentSessionId(id: string): void {
  sessionStorage.setItem(ENROLMENT_SESSION_KEY, id);
}

export type EnrolFnResult = Record<string, unknown>;

export async function invokeEnrol(
  name: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<EnrolFnResult> {
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    ...(headers ? { headers } : {}),
  });
  if (error) {
    const ctx = error as { context?: Response };
    if (ctx.context && typeof ctx.context.json === "function") {
      try {
        const payload = (await ctx.context.json()) as { error?: string };
        if (payload?.error) throw new Error(String(payload.error));
      } catch (inner) {
        if (inner instanceof Error && inner.message !== error.message) throw inner;
      }
    }
    throw new Error(error.message);
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return (data ?? {}) as EnrolFnResult;
}
