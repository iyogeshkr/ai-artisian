import { apiRequest } from "@/services/apiClient";

/**
 * Sends a non-blocking analytics event to Functions logging.
 * @param {{ event: string, artisanId?: string, metadata?: object }} payload
 * @returns {Promise<object | null>}
 */
export async function trackEvent(payload) {
  try {
    return await apiRequest("/track-event", {
      body: JSON.stringify(payload),
      method: "POST",
    });
  } catch {
    return null;
  }
}
