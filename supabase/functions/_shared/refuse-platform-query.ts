/**
 * §2.5 / §15 item 14 — Platform ID and enrolment token never in query params.
 * A URL is browser history, a server log, and a screenshot.
 */

const FORBIDDEN_QUERY_KEYS = new Set([
  "platform",
  "platform_id",
  "token",
  "enrolment_token",
  "enrollment_token",
]);

export function requestHasPlatformQuery(url: URL): boolean {
  for (const key of url.searchParams.keys()) {
    if (FORBIDDEN_QUERY_KEYS.has(key.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Refuse enrolment (and related) requests that carry platform or token in the query string.
 * Does not echo the forbidden value back — avoids writing it into response bodies/logs.
 */
export function refusePlatformQuery(req: Request): Response | null {
  const url = new URL(req.url);
  if (!requestHasPlatformQuery(url)) return null;
  return new Response(
    JSON.stringify({
      error: "token_query_rejected",
      message:
        "Enrolment token and platform ID must ride in the request body or header, never a query parameter (§2.5).",
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
