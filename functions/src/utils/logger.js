import { logger as firebaseLogger } from "firebase-functions";

/**
 * Writes an informational log entry.
 * @param {string} message
 * @param {object} [meta]
 */
export function logInfo(message, meta = {}) {
  firebaseLogger.info(message, meta);
}

/**
 * Writes a warning log entry.
 * @param {string} message
 * @param {object} [meta]
 */
export function logWarn(message, meta = {}) {
  firebaseLogger.warn(message, meta);
}

/**
 * Writes an error log entry.
 * @param {string} message
 * @param {object} [meta]
 */
export function logError(message, meta = {}) {
  firebaseLogger.error(message, meta);
}
