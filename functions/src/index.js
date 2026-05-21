// Railway production uses backend/server.js, which delegates to src/server.js.
// This export keeps import-based tooling stable without creating a duplicate API.
export { default as app } from "./app.js";
