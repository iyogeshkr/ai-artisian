import {
  badRequest,
  corsHeaders,
  buildDesignPromptVariants,
  generateDesignVariants,
  json,
  validateDesignRequest,
} from "../_shared/ai-artisan.ts";

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

  const validated = validateDesignRequest(body as Record<string, unknown>);
  if (typeof validated === "string") {
    return badRequest(validated);
  }

  try {
    return json(await generateDesignVariants(buildDesignPromptVariants(validated)));
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Design generation failed.",
      },
      { status: error?.status || 502 },
    );
  }
});
