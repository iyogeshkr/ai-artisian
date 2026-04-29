import app from "./app.js";
import { logInfo } from "./utils/logger.js";

const port = Number(process.env.PORT || 8000);

app.listen(port, () => {
  logInfo("AI Artisan API listening", { port, url: `http://127.0.0.1:${port}` });
});
