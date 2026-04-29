import { supabase } from "@/config/supabase";

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

function normalizeFunctionName(path) {
  return path.startsWith("/") ? path.slice(1) : path;
}

function parseRequestBody(body) {
  if (body == null) {
    return undefined;
  }

  if (typeof body !== "string") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
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

export async function apiRequest(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!/^https?:\/\//i.test(path)) {
    const { data, error } = await supabase.functions.invoke(normalizeFunctionName(path), {
      body: parseRequestBody(options.body),
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (error) {
      const errorMessage =
        error?.message || "Something went wrong while talking to the server.";
      const invokeError = new Error(errorMessage);
      invokeError.status = error?.status || 500;
      invokeError.payload = error;
      throw invokeError;
    }

    return data;
  }

  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
