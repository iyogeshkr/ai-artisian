import { supabase } from "@/config/supabase";

const PRODUCT_IMAGE_BUCKET = "product-images";

function dataUrlToBlob(dataUrl) {
  const [meta, payload] = dataUrl.split(",");
  const mimeType = meta?.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const bytes = Uint8Array.from(atob(payload || ""), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

function getExtension(mimeType = "") {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

export async function uploadProductImage({ artisanId, dataUrl }) {
  if (!dataUrl?.startsWith("data:image/")) {
    return dataUrl || "";
  }

  const blob = dataUrlToBlob(dataUrl);
  const extension = getExtension(blob.type);
  const fileName =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${artisanId}/${fileName}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, blob, {
      cacheControl: "31536000",
      contentType: blob.type,
      upsert: false,
    });

  if (error) {
    const uploadError = new Error(error.message || "Product image upload failed.");
    uploadError.status = error.statusCode || error.status;
    uploadError.payload = error;
    throw uploadError;
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Product image uploaded, but no public URL was returned.");
  }

  return data.publicUrl;
}
