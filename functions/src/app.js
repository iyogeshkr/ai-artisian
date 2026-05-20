import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import {
  FUNCTION_REGION,
  getAllowedOrigins,
  getImageGenerationDefaults,
} from "./config/env.js";

const app = express();
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "AI Artisan backend is running.",
    provider: "huggingface",
  });
});

app.get("/health", (_req, res) => {
  const defaults = getImageGenerationDefaults();

  res.status(200).json({
    imageDefaults: {
      endpoint: defaults.endpoint,
      model: defaults.model,
      size: defaults.size,
    },
    functionRegion: FUNCTION_REGION,
    nodeVersion: process.version,
    provider: "huggingface",
    service: "ai-artisan-functions",
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

app.use("/auth", authRoutes);
app.use("/", imageRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
