import app from "./app.js";
import { logInfo } from "./utils/logger.js";
import { getClerkSecretKey } from "./config/env.js";

// Validate Clerk secret presence early to fail fast if misconfigured.
getClerkSecretKey();

const port = Number(process.env.PORT || 8000);

app.listen(port, () => {
  logInfo("AI Artisan API listening", { port, url: `http://127.0.0.1:${port}` });
});
