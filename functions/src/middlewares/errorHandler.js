export function notFoundHandler(_req, res) {
  return res.status(404).json({ error: "Route not found." });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || error.statusCode || 500;
  const message =
    error?.error?.message ||
    error?.message ||
    "Unexpected server error.";

  return res.status(status).json({
    error: message,
    meta: error.meta || undefined,
  });
}
