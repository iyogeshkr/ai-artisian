import { logError } from "../utils/logger.js";

export function notFoundHandler(_req, res) {
  return res.status(404).json({ error: "Route not found." });
}

export function errorHandler(error, req, res, _next) {
  const status = error.status || error.statusCode || 500;
  const message =
    error?.error?.message ||
    error?.message ||
    "Unexpected server error.";

  logError("API request failed", {
    message,
    method: req.method,
    path: req.originalUrl,
    status,
    meta: error.meta,
  });

  return res.status(status).json({
    error: message,
    meta: process.env.NODE_ENV === "production" ? undefined : error.meta || undefined,
  });
}
