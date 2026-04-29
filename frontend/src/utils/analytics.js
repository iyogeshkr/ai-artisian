import { trackEvent } from "@/services/analyticsService";

/**
 * Sends a fire-and-forget page analytics ping through apiClient.
 * @param {string} route
 * @param {string} [artisanId]
 */
export function pingAnalytics(route, artisanId) {
  trackEvent({
    artisanId,
    event: "page_view",
    metadata: {
      route,
      sentAt: new Date().toISOString(),
    },
  });
}
