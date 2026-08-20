/**
 * §2.5 — Platform ID never in query params. URL is history, logs, screenshots.
 */

export function requestHasPlatformQuery(url: URL): boolean {
  for (const key of url.searchParams.keys()) {
    if (key.toLowerCase() === "platform" || key.toLowerCase() === "platform_id") {
      return true;
    }
  }
  return false;
}

/**
 * Refuse enrolment (and related) requests that carry platform in the query string.
 * Does not echo the platform value back — avoids writing it into response bodies/logs.
 */
export function refusePlatformQuery(req: Request): Response | null {
  const url = new URL(req.url);
  if (!requestHasPlatformQuery(url)) return null;
  return new Response(
    JSON.stringify({
      error: "platform_query_rejected",
      message:
        "Platform ID must ride in a signed enrolment token, never a query parameter (§2.5).",
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
