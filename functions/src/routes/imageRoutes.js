import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  generateDesignController,
  generateImageController,
  trackEventController,
} from "../controllers/imageController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateGenerateDesignRequest } from "../middlewares/validateGenerateDesignRequest.js";
import { validateGenerateImageRequest } from "../middlewares/validateGenerateImageRequest.js";
import { validateTrackEventRequest } from "../middlewares/validateTrackEventRequest.js";

const router = Router();

const generateImageRateLimiter = rateLimit({
  limit: 20,
  legacyHeaders: false,
  message: {
    error: "Too many image generation requests. Please wait before trying again.",
  },
  standardHeaders: "draft-8",
  windowMs: 15 * 60 * 1000,
});

const generateDesignRateLimiter = rateLimit({
  limit: 5,
  legacyHeaders: false,
  message: {
    error: "Too many design requests. Please wait a minute and try again.",
  },
  standardHeaders: "draft-8",
  windowMs: 60 * 1000,
});

router.post(
  "/generate-image",
  generateImageRateLimiter,
  requireAuth,
  validateGenerateImageRequest,
  generateImageController,
);
router.post(
  "/generate-design",
  requireAuth,
  generateDesignRateLimiter,
  validateGenerateDesignRequest,
  generateDesignController,
);
router.post("/track-event", requireAuth, validateTrackEventRequest, trackEventController);

export default router;
