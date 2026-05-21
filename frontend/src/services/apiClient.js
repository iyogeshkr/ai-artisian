import { logError, logInfo, logWarn } from "@/utils/logger";
import { withRetry } from "@/utils/retry";

let authTokenGetter = null;
const backendApiBaseUrl = (import.meta.env.VITE_BACKEND_API_URL?.trim() || "").replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 30000;

export function setApiAuthTokenGetter(getter) {
  authTokenGetter = typeof getter === "function" ? getter : null;
}

async function getAuthHeader() {
  if (!authTokenGetter) {
    return {};
  }

  const token = await authTokenGetter();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

async function parseJsonSafely(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function createRequestError(message, status, payload) {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw createRequestError("The request timed out. Please try again.", 504, {
        timeoutMs,
      });
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestOnce(path, options = {}) {
  const authHeader = await getAuthHeader();
  const startedAt = performance.now();

  if (!/^https?:\/\//i.test(path) && !backendApiBaseUrl) {
    throw new Error("VITE_BACKEND_API_URL is required for backend API requests.");
  }

  if (!/^https?:\/\//i.test(path)) {
    const response = await fetchWithTimeout(`${backendApiBaseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...(options.headers || {}),
      },
      ...options,
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      const errorMessage =
        payload?.error ||
        payload?.message ||
        "Something went wrong while talking to the server.";

      throw createRequestError(errorMessage, response.status, payload);
    }

    logInfo("API request completed", {
      durationMs: Math.round(performance.now() - startedAt),
      path,
      status: response.status,
    });
    return payload;
  }

  const response = await fetchWithTimeout(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const errorMessage =
      payload?.error ||
      payload?.message ||
      "Something went wrong while talking to the server.";

    throw createRequestError(errorMessage, response.status, payload);
  }

  logInfo("API request completed", {
    durationMs: Math.round(performance.now() - startedAt),
    path,
    status: response.status,
  });
  return payload;
}

export async function apiRequest(path, options = {}) {
  try {
    return await withRetry(() => requestOnce(path, options), {
      delays: options.retryDelays || [750, 1600],
      label: `api:${path}`,
      onRetry: ({ attempt, error }) => {
        logWarn("API request retry scheduled", {
          attempt,
          path,
          status: error.status,
        });
      },
    });
  } catch (error) {
    logError("API request failed", error, {
      method: options.method || "GET",
      path,
    });
    throw error;
  }
}
