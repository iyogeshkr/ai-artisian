import { generateDesignVariants, generateImage } from "../services/huggingfaceImageService.js";
import { logger } from "firebase-functions";
import { buildDesignPromptVariants } from "../utils/promptBuilder.js";
import { logInfo, logWarn } from "../utils/logger.js";

/**
 * Handles legacy single-image generation.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function generateImageController(req, res, next) {
  try {
    const result = await generateImage(req.validatedBody);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles three-variant design generation.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function generateDesignController(req, res, next) {
  try {
    const prompts = buildDesignPromptVariants(req.validatedBody);
    const result = await generateDesignVariants(prompts);
    logger.info("Design generated", { userId: req.user.id });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles fire-and-forget event tracking.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function trackEventController(req, res) {
  try {
    logInfo("Artisan event tracked", {
      artisanId: req.validatedBody.artisanId,
      event: req.validatedBody.event,
      metadata: req.validatedBody.metadata,
    });
  } catch (error) {
    logWarn("Failed to log artisan event", { message: error.message });
  }

  return res.status(200).json({ ok: true, trackedAt: new Date().toISOString() });
}
