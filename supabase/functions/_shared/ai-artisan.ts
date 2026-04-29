const DEFAULT_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";
const DEFAULT_IMAGE_ENDPOINT =
  "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

const VALID_IMAGE_SIZES = new Set(["1024x1024", "1024x1536", "1536x1024"]);
const ALLOWED_CRAFT_TYPES = new Set([
  "pottery",
  "weaving",
  "embroidery",
  "woodwork",
  "metalwork",
  "textiles",
  "painting",
  "jewelry",
]);
const ALLOWED_STYLES = new Set(["traditional", "fusion", "modern", "minimal"]);
const ALLOWED_COLOR_PALETTES = new Set([
  "earthy",
  "vibrant",
  "pastel",
  "monochrome",
  "gold",
  "natural",
]);

const VARIANT_DIRECTIONS = [
  "product photography for ecommerce catalog, centered composition, premium background",
  "lifestyle showcase for urban buyers, soft natural light, aspirational mood",
  "close-up design study, rich textures, detailed artisan finishing, collector appeal",
];

const CRAFT_LABELS = {
  embroidery: "embroidery",
  jewelry: "jewelry",
  metalwork: "metalwork",
  painting: "painting",
  pottery: "pottery",
  textiles: "textiles",
  weaving: "weaving",
  woodwork: "woodwork",
};

const STYLE_LABELS = {
  fusion: "fusion of heritage and contemporary taste",
  minimal: "minimal and clean modern styling",
  modern: "modern premium styling",
  traditional: "traditional heritage styling",
};

const DEFAULT_STYLE_SUFFIX =
  "Indian artisan craft, handcrafted product photography, rich texture, premium lighting, premium ecommerce catalog shot, centered composition, highly detailed";

function prettify(value: string) {
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function prettifyPalette(colorPalette: string) {
  return colorPalette
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Content-Type": "application/json",
  };
}

export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders(),
      ...(init.headers || {}),
    },
  });
}

export function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

export function validateImageRequest(body: Record<string, unknown>) {
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const craftType = typeof body?.craftType === "string" ? body.craftType.trim().toLowerCase() : "";
  const colorPalette = typeof body?.colorPalette === "string" ? body.colorPalette.trim() : "";
  const style = typeof body?.style === "string" ? body.style.trim().toLowerCase() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!prompt) return "Prompt is required.";
  if (prompt.length < 8) return "Prompt must be at least 8 characters long.";
  if (prompt.length > 2000) return "Prompt is too long. Keep it under 2000 characters.";
  if (craftType && !ALLOWED_CRAFT_TYPES.has(craftType)) return "Craft type is not supported.";
  if (style && !ALLOWED_STYLES.has(style)) return "Style is not supported.";
  if (colorPalette.length > 120) return "Color palette must stay under 120 characters.";
  if (description.length > 400) return "Description is too long. Keep it under 400 characters.";

  return {
    colorPalette,
    craftType,
    description,
    prompt,
    style,
  };
}

export function validateDesignRequest(body: Record<string, unknown>) {
  const craftType = typeof body?.craftType === "string" ? body.craftType.trim().toLowerCase() : "";
  const colorPalette = typeof body?.colorPalette === "string" ? body.colorPalette.trim().toLowerCase() : "";
  const style = typeof body?.style === "string" ? body.style.trim().toLowerCase() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!craftType || !ALLOWED_CRAFT_TYPES.has(craftType)) return "Please choose a valid craft type.";
  if (!colorPalette || !ALLOWED_COLOR_PALETTES.has(colorPalette)) {
    return "Please choose a valid color palette.";
  }
  if (!style || !ALLOWED_STYLES.has(style)) return "Please choose a valid style.";
  if (description.length > 200) return "Description must stay under 200 characters.";

  return {
    colorPalette,
    craftType,
    description,
    style,
  };
}

export function buildImagePrompt({
  colorPalette = "",
  craftType = "",
  description = "",
  style = "fusion",
}: Record<string, string> = {}) {
  const promptParts = [
    craftType ? `${prettify(craftType)} artisan product concept` : "Indian artisan product concept",
    style ? `${prettify(style)} style` : "",
    colorPalette ? `using ${colorPalette} color palette` : "",
    description || "",
    "preserve heritage craft identity while making it market-ready for modern buyers",
    DEFAULT_STYLE_SUFFIX,
  ].filter(Boolean);

  return promptParts.join(", ");
}

export function buildDesignPromptVariants(input: Record<string, string>) {
  const palette = prettifyPalette(input.colorPalette || "");
  const craftLabel = CRAFT_LABELS[input.craftType] || input.craftType;
  const styleLabel = STYLE_LABELS[input.style] || input.style;
  const description = input.description ? `${input.description.trim()}, ` : "";

  return VARIANT_DIRECTIONS.map(
    (direction) =>
      `Indian artisan ${craftLabel} product design, ${styleLabel}, base colors ${palette}, ${description}preserve handcrafted identity, ready for modern buyers, ${direction}, high detail, studio quality, black-forest-labs FLUX.1-schnell`,
  );
}

function getImageGenerationDefaults() {
  const size = Deno.env.get("HF_IMAGE_SIZE") || "1024x1024";

  return {
    endpoint:
      Deno.env.get("HF_INFERENCE_ENDPOINT") ||
      Deno.env.get("HF_IMAGE_ENDPOINT") ||
      DEFAULT_IMAGE_ENDPOINT,
    maxRetries: Number(Deno.env.get("HF_MAX_RETRIES") || Deno.env.get("HF_IMAGE_MAX_RETRIES") || 2),
    model: Deno.env.get("HF_IMAGE_MODEL") || DEFAULT_IMAGE_MODEL,
    retryDelayMs: Number(Deno.env.get("HF_RETRY_DELAY_MS") || Deno.env.get("HF_IMAGE_RETRY_DELAY_MS") || 5000),
    size: VALID_IMAGE_SIZES.has(size) ? size : "1024x1024",
    timeoutMs: Number(Deno.env.get("HF_TIMEOUT_MS") || Deno.env.get("HF_IMAGE_TIMEOUT_MS") || 30000),
  };
}

function getHuggingFaceApiKey() {
  const envKey = (Deno.env.get("HUGGING_FACE_API_KEY") || Deno.env.get("HF_API_KEY") || "").trim();
  if (envKey && !envKey.includes("your_hugging_face_api_key_here")) {
    return envKey;
  }

  throw new Error("HF_API_KEY is missing or still using the placeholder value.");
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

async function requestImageGeneration({ accept = "image/webp,image/png", prompt, seed }: { accept?: string; prompt: string; seed?: number }) {
  const defaults = getImageGenerationDefaults();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), defaults.timeoutMs);
  const apiKey = getHuggingFaceApiKey();

  try {
    return await fetch(defaults.endpoint, {
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          height: 1024,
          num_inference_steps: 4,
          seed,
          width: 1024,
        },
      }),
      headers: {
        Accept: accept,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseErrorPayload(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

export async function generateImage(input: { prompt: string; seed?: number }) {
  const defaults = getImageGenerationDefaults();

  for (let attempt = 0; attempt <= defaults.maxRetries; attempt += 1) {
    const response = await requestImageGeneration({ prompt: input.prompt, seed: input.seed });
    const contentType = response.headers.get("content-type") || "image/png";

    if (response.ok && contentType.startsWith("image/")) {
      return {
        createdAt: new Date().toISOString(),
        imageBase64: arrayBufferToBase64(await response.arrayBuffer()),
        mimeType: contentType,
        model: defaults.model,
        prompt: input.prompt,
        provider: "huggingface",
        seed: input.seed,
      };
    }

    const errorPayload = await parseErrorPayload(response);

    if (response.status === 503 && attempt < defaults.maxRetries) {
      const estimatedTime =
        typeof errorPayload === "object" && errorPayload !== null && typeof errorPayload.estimated_time === "number"
          ? errorPayload.estimated_time * 1000
          : defaults.retryDelayMs;

      await new Promise((resolve) => setTimeout(resolve, Math.max(defaults.retryDelayMs, estimatedTime)));
      continue;
    }

    if (response.status === 503) {
      const loadingError = new Error("The FLUX model is still loading on Hugging Face. Please try again in a moment.");
      loadingError.status = 503;
      throw loadingError;
    }

    const message =
      typeof errorPayload === "object" && errorPayload !== null && typeof errorPayload.error === "string"
        ? errorPayload.error
        : typeof errorPayload === "string"
          ? errorPayload
          : "Hugging Face image generation failed.";

    const requestError = new Error(message);
    requestError.status = response.status || 502;
    throw requestError;
  }

  throw new Error("Image generation failed after multiple retries.");
}

export async function generateDesignVariants(prompts: string[]) {
  const seeds = prompts.map(() => Math.floor(Math.random() * 1000000));
  const settledResults = await Promise.allSettled(
    prompts.map((prompt, index) => generateImage({ prompt, seed: seeds[index] })),
  );

  const designs = settledResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => ({
      imageBase64: result.value.imageBase64,
      mimeType: result.value.mimeType,
      prompt: result.value.prompt,
      seed: result.value.seed,
    }));

  const errors = settledResults
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason?.message || "Design generation failed.");

  if (designs.length === 0) {
    const error = new Error(errors[0] || "All design generations failed.");
    error.status = 502;
    throw error;
  }

  return {
    designs,
    errors: errors.length > 0 ? errors : undefined,
    generatedAt: new Date().toISOString(),
    hasPartialFailure: errors.length > 0 || undefined,
  };
}
