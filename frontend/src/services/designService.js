import { apiRequest } from "@/services/apiClient";

/**
 * Requests three AI design variants from the backend.
 * @param {{ craftType: string, colorPalette: string, style: string, description: string }} payload
 * @returns {Promise<{designs: object[], generatedAt: string, hasPartialFailure?: boolean, errors?: string[]}>}
 */
export function generateDesigns(payload) {
  return apiRequest("/generate-design", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}
