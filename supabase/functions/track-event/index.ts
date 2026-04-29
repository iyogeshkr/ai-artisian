import { badRequest, corsHeaders, json } from "../_shared/ai-artisan.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, { status: 405 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Request body must be valid JSON.");
  }

  const event = typeof body.event === "string" ? body.event.trim() : "unknown_event";
  const artisanId = typeof body.artisanId === "string" ? body.artisanId.trim() : "anonymous";
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {};

  console.log("Artisan event tracked", {
    artisanId,
    event,
    metadata,
  });

  return json({ ok: true, trackedAt: new Date().toISOString() });
});