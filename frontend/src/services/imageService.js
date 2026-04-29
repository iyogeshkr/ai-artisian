// Calls /generate-image — not used in active UI flows
import { apiRequest } from "@/services/apiClient";
import { buildImagePrompt } from "@/utils/promptBuilder";

function toImageUrl(payload) {
  if (!payload.imageBase64) {
    throw new Error("The server did not return image data.");
  }

  return `data:${payload.mimeType || "image/png"};base64,${payload.imageBase64}`;
}

export async function generateImage(input) {
  const prompt = buildImagePrompt(input);
  const payload = await apiRequest("/generate-image", {
    method: "POST",
    body: JSON.stringify({
      colorPalette: input.colorPalette,
      craftType: input.craftType,
      description: input.description,
      prompt,
      style: input.style,
    }),
  });
  const imageUrl = toImageUrl(payload);

  return {
    createdAt: payload.createdAt || new Date().toISOString(),
    description: input.description?.trim() || `${input.style} ${input.craftType} concept`,
    downloadUrl: imageUrl,
    imageUrl,
    input,
    prompt,
    provider: payload.provider || "huggingface",
  };
}
