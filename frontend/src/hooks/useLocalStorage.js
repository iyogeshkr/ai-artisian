import { useEffect, useState } from "react";

function readValue(key, defaultValue) {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Persists state in localStorage with private-mode-safe guards.
 * // TODO: Migrate to Firestore in v2
 * @param {string} key
 * @param {*} defaultValue
 * @returns {[*, Function]}
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => readValue(key, defaultValue));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue];
}
