import { logError } from "@/utils/logger";

let installed = false;

export function installRuntimeMonitoring() {
  if (installed || typeof window === "undefined") {
    return;
  }

  installed = true;

  window.addEventListener("error", (event) => {
    logError("Unhandled runtime error", event.error || new Error(event.message), {
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logError("Unhandled promise rejection", event.reason, {
      type: "unhandledrejection",
    });
  });
}
