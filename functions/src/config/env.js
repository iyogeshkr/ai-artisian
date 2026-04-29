import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineSecret } from "firebase-functions/params";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const functionsRoot = path.resolve(currentDirPath, "..", "..");

loadEnv({ path: path.join(functionsRoot, ".env") });
loadEnv({ override: true, path: path.join(functionsRoot, ".secret.local") });

export const huggingFaceApiKeySecret = defineSecret("HF_API_KEY");
export const FUNCTION_REGION = process.env.FUNCTION_REGION || "us-central1";

const VALID_IMAGE_SIZES = new Set(["1024x1024", "1024x1536", "1536x1024"]);

export function getAllowedOrigins() {
  const origins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(
    new Set([
      ...origins,
      "https://ai-artisan.web.app",
      "https://ai-artisan.firebaseapp.com",
    ]),
  );
}

export function getImageGenerationDefaults() {
  const size = process.env.HF_IMAGE_SIZE || "1024x1024";

  return {
    endpoint:
      process.env.HF_INFERENCE_ENDPOINT ||
      process.env.HF_IMAGE_ENDPOINT ||
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    maxRetries: Number(process.env.HF_MAX_RETRIES || process.env.HF_IMAGE_MAX_RETRIES || 2),
    model:
      process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell",
    retryDelayMs: Number(process.env.HF_RETRY_DELAY_MS || process.env.HF_IMAGE_RETRY_DELAY_MS || 5000),
    size: VALID_IMAGE_SIZES.has(size) ? size : "1024x1024",
    timeoutMs: Number(process.env.HF_TIMEOUT_MS || process.env.HF_IMAGE_TIMEOUT_MS || 30000),
  };
}

export function getHuggingFaceApiKey() {
  const envKey = process.env.HUGGING_FACE_API_KEY?.trim() || process.env.HF_API_KEY?.trim();
  if (envKey && !envKey.includes("your_hugging_face_api_key_here")) {
    return envKey;
  }

  const secretValue = huggingFaceApiKeySecret.value();
  if (
    secretValue?.trim() &&
    !secretValue.trim().includes("your_hugging_face_api_key_here")
  ) {
    return secretValue.trim();
  }

  throw new Error(
    "HF_API_KEY is missing or still using the placeholder value. Configure functions/.secret.local with a real Hugging Face access token or set the Firebase secret.",
  );
}
