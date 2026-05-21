import { logWarn } from "@/utils/logger";

const DEFAULT_RETRY_DELAYS = [600, 1200];

export function isRetryableError(error) {
  const status = error?.status || error?.statusCode;
  return !status || status === 408 || status === 425 || status === 429 || status >= 500;
}

function wait(delayMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

export async function withRetry(operation, options = {}) {
  const {
    delays = DEFAULT_RETRY_DELAYS,
    isRetryable = isRetryableError,
    label = "operation",
    onRetry,
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= delays.length || !isRetryable(error)) {
        throw error;
      }

      const delayMs = delays[attempt];
      logWarn("Retrying failed operation", {
        attempt: attempt + 1,
        delayMs,
        label,
        message: error.message,
        status: error.status,
      });
      onRetry?.({ attempt: attempt + 1, delayMs, error });
      await wait(delayMs);
    }
  }

  throw lastError;
}
