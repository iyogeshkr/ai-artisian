import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const functionsRoot = path.resolve(currentDirPath, "..", "..");

loadEnv({ path: path.join(functionsRoot, ".env") });
loadEnv({ override: true, path: path.join(functionsRoot, ".secret.local") });

export const FUNCTION_REGION = process.env.FUNCTION_REGION || "us-central1";

const VALID_IMAGE_SIZES = new Set(["1024x1024", "1024x1536", "1536x1024"]);

export function getAllowedOrigins() {
  const origins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const deploymentOrigins = [
    process.env.FRONTEND_ORIGIN,
    process.env.APP_ORIGIN,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://aiartisan.app",
    "https://aiartisan.vercel.app",
    "https://ai-artisan.vercel.app",
    "https://ai-artisan.web.app",
  ].filter(Boolean);

  return Array.from(
    new Set([
      ...origins,
      ...deploymentOrigins,
    ]),
  );
}

export function getClerkAuthenticateOptions() {
  const authorizedParties = getAllowedOrigins();
  const jwtKey = process.env.CLERK_JWT_KEY?.trim();

  return {
    ...(authorizedParties.length > 0 ? { authorizedParties } : {}),
    ...(jwtKey ? { jwtKey } : {}),
  };
}

export function getClerkSecretKey() {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is missing. Configure Railway or functions/.env.");
  }

  return secretKey;
}

export function getSupabaseAdminConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  return { serviceRoleKey, url };
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

  throw new Error(
    "HF_API_KEY is missing or still using the placeholder value. Configure Railway with HUGGING_FACE_API_KEY or HF_API_KEY.",
  );
}
