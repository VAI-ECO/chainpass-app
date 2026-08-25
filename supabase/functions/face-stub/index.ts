import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleFaceStubRequest } from "../_shared/face-service-stub.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const res = await handleFaceStubRequest(req);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
});
