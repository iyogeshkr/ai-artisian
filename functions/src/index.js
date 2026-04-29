import { onRequest } from "firebase-functions/v2/https";
import app from "./app.js";
import { FUNCTION_REGION, huggingFaceApiKeySecret } from "./config/env.js";

export const api = onRequest(
  {
    cpu: 1,
    memory: "512MiB",
    minInstances: 0,
    region: FUNCTION_REGION,
    secrets: [huggingFaceApiKeySecret],
    timeoutSeconds: 120,
  },
  app,
);
