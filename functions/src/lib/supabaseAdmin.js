import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "../config/env.js";

let supabaseAdminClient;
const GENERATED_IMAGE_BUCKET = "product-images";

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const { serviceRoleKey, url } = getSupabaseAdminConfig();

    if (!serviceRoleKey || !url) {
      throw new Error(
        "Supabase admin client misconfigured. Ensure SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL are set in server environment."
      );
    }

    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseAdminClient;
}

function getExtension(mimeType = "") {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

function getGeneratedImagePath({ mimeType, seed, userId }) {
  const safeUserId = String(userId || "anonymous").replace(/[^a-zA-Z0-9_-]/g, "_");
  const extension = getExtension(mimeType);
  const uniqueId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${safeUserId}/generated/${uniqueId}-${seed || "auto"}.${extension}`;
}

export async function uploadGeneratedImage({ imageBase64, mimeType, seed, userId }) {
  if (!imageBase64) {
    throw new Error("Generated image payload is empty.");
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const imageBuffer = Buffer.from(imageBase64, "base64");
  const path = getGeneratedImagePath({ mimeType, seed, userId });
  const { error } = await supabaseAdmin.storage
    .from(GENERATED_IMAGE_BUCKET)
    .upload(path, imageBuffer, {
      cacheControl: "31536000",
      contentType: mimeType || "image/webp",
      upsert: false,
    });

  if (error) {
    const uploadError = new Error(error.message || "Generated image upload failed.");
    uploadError.status = error.statusCode || error.status || 502;
    uploadError.meta = { bucket: GENERATED_IMAGE_BUCKET, path };
    throw uploadError;
  }

  const { data } = supabaseAdmin.storage.from(GENERATED_IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Generated image uploaded, but no public URL was returned.");
  }

  return {
    bucket: GENERATED_IMAGE_BUCKET,
    path,
    publicUrl: data.publicUrl,
  };
}
