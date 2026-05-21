/**
 * Writes an informational log entry.
 * @param {string} message
 * @param {object} [meta]
 */
export function logInfo(message, meta = {}) {
  console.info(message, meta);
}

/**
 * Writes a warning log entry.
 * @param {string} message
 * @param {object} [meta]
 */
export function logWarn(message, meta = {}) {
  console.warn(message, meta);
}

/**
 * Writes an error log entry.
 * @param {string} message
 * @param {object} [meta]
 */
export function logError(message, meta = {}) {
  console.error(message, meta);
}
