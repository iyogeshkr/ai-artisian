import dns from "node:dns";
import { getHuggingFaceApiKey, getImageGenerationDefaults } from "../config/env.js";
import { logWarn } from "../utils/logger.js";

dns.setDefaultResultOrder("ipv4first");

function sleep(delayMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function parseErrorPayload(response) {
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

async function requestImageGeneration({ accept = "image/webp,image/png", prompt, seed }) {
  const defaults = getImageGenerationDefaults();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), defaults.timeoutMs);
  const apiKey = getHuggingFaceApiKey();

  try {
    const response = await fetch(defaults.endpoint, {
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

    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Image generation timed out while waiting for Hugging Face.");
      timeoutError.status = 504;
      throw timeoutError;
    }

    logWarn("Hugging Face request failed before receiving a response", {
      cause: error.message,
      provider: "huggingface",
    });
    const networkError = new Error(
      "Could not reach Hugging Face Inference API. Check internet access, token validity, and endpoint configuration.",
    );
    networkError.status = 502;
    networkError.meta = {
      cause: error.message,
      provider: "huggingface",
    };
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseImageResponse(response) {
  const contentType = response.headers.get("content-type") || "image/png";

  if (!contentType.startsWith("image/")) {
    return null;
  }

  return contentType;
}

/**
 * Generates a single image with the configured HF model.
 * @param {{ prompt: string, seed?: number }} input
 * @returns {Promise<{ createdAt: string, imageBase64: string, mimeType: string, model: string, provider: string, prompt?: string, seed?: number }>}
 */
export async function generateImage({ prompt, seed }) {
  const defaults = getImageGenerationDefaults();

  for (let attempt = 0; attempt <= defaults.maxRetries; attempt += 1) {
    const response = await requestImageGeneration({ prompt, seed });
    const contentType = parseImageResponse(response);

    if (response.ok && contentType) {
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      return {
        createdAt: new Date().toISOString(),
        imageBase64: imageBuffer.toString("base64"),
        mimeType: contentType,
        model: defaults.model,
        prompt,
        provider: "huggingface",
        seed,
      };
    }

    const errorPayload = await parseErrorPayload(response);

    if (response.status === 503 && attempt < defaults.maxRetries) {
      const estimatedTime =
        typeof errorPayload?.estimated_time === "number"
          ? errorPayload.estimated_time * 1000
          : defaults.retryDelayMs;

      await sleep(Math.max(defaults.retryDelayMs, estimatedTime));
      continue;
    }

    if (response.status === 503) {
      const loadingError = new Error(
        "The FLUX model is still loading on Hugging Face. Please try again in a moment.",
      );
      loadingError.status = 503;
      loadingError.meta = {
        provider: "huggingface",
      };
      throw loadingError;
    }

    if (response.status === 401 || response.status === 403) {
      const authError = new Error(
        "Hugging Face authentication failed. Replace HF_API_KEY with a valid Hugging Face access token.",
      );
      authError.status = response.status;
      authError.meta = {
        provider: "huggingface",
        response: errorPayload || null,
      };
      throw authError;
    }

    const message =
      errorPayload?.error ||
      errorPayload ||
      "Hugging Face image generation failed.";
    const requestError = new Error(
      typeof message === "string" ? message : "Hugging Face image generation failed.",
    );
    requestError.status = response.status || 502;
    requestError.meta = {
      provider: "huggingface",
      response: errorPayload || null,
    };
    throw requestError;
  }

  const fallbackError = new Error("Image generation failed after multiple retries.");
  fallbackError.status = 502;
  throw fallbackError;
}

/**
 * Generates multiple images in parallel and keeps partial successes.
 * @param {string[]} prompts
 * @returns {Promise<{ designs: Array<{ imageBase64: string, mimeType: string, prompt: string, seed: number }>, generatedAt: string, hasPartialFailure?: boolean, errors?: string[] }>}
 */
export async function generateDesignVariants(prompts) {
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

  if (designs.length === 0) {
    const errors = settledResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message || "Design generation failed.");
    const error = new Error(errors[0] || "All design generations failed.");
    error.status = 502;
    error.meta = { errors, provider: "huggingface" };
    throw error;
  }

  const errors = settledResults
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason?.message || "Design generation failed.");

  return {
    designs,
    errors: errors.length > 0 ? errors : undefined,
    generatedAt: new Date().toISOString(),
    hasPartialFailure: errors.length > 0 || undefined,
  };
}
