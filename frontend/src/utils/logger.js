const MONITORING_URL = import.meta.env.VITE_RUNTIME_MONITORING_URL?.trim();

function serializeError(error) {
  if (!error) {
    return null;
  }

  return {
    message: error.message || String(error),
    name: error.name,
    stack: error.stack,
    status: error.status || error.statusCode,
    payload: error.payload,
    meta: error.meta,
  };
}

function buildPayload(level, message, meta = {}) {
  return {
    level,
    message,
    meta,
    page: typeof window !== "undefined" ? window.location.href : "",
    sentAt: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

function sendToMonitor(payload) {
  if (!MONITORING_URL || typeof navigator === "undefined") {
    return;
  }

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(MONITORING_URL, new Blob([body], { type: "application/json" }));
      return;
    }

    fetch(MONITORING_URL, {
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => {});
  } catch {
    // Monitoring must never break the user-facing flow.
  }
}

export function logInfo(message, meta = {}) {
  const payload = buildPayload("info", message, meta);
  console.info(`[ai-artisan] ${message}`, meta);
  sendToMonitor(payload);
}

export function logWarn(message, meta = {}) {
  const payload = buildPayload("warn", message, meta);
  console.warn(`[ai-artisan] ${message}`, meta);
  sendToMonitor(payload);
}

export function logError(message, error, meta = {}) {
  const payload = buildPayload("error", message, {
    ...meta,
    error: serializeError(error),
  });
  console.error(`[ai-artisan] ${message}`, error, meta);
  sendToMonitor(payload);
}
