import { generateDesignVariants, generateImage } from "../services/huggingfaceImageService.js";
import { uploadGeneratedImage } from "../lib/supabaseAdmin.js";
import { buildDesignPromptVariants } from "../utils/promptBuilder.js";
import { logInfo, logWarn } from "../utils/logger.js";

async function attachStorageUrlToDesign(design, userId) {
  const storage = await uploadGeneratedImage({
    imageBase64: design.imageBase64,
    mimeType: design.mimeType,
    seed: design.seed,
    userId,
  });

  return {
    ...design,
    imageUrl: storage.publicUrl,
    storage,
  };
}

/**
 * Handles legacy single-image generation.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function generateImageController(req, res, next) {
  try {
    const result = await generateImage(req.validatedBody);
    const storage = await uploadGeneratedImage({
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      seed: result.seed,
      userId: req.user.id,
    });
    return res.status(200).json({
      ...result,
      imageUrl: storage.publicUrl,
      storage,
    });
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
    const designs = await Promise.all(
      result.designs.map((design) => attachStorageUrlToDesign(design, req.user.id)),
    );
    logInfo("Design generated", { userId: req.user.id });
    return res.status(200).json({
      ...result,
      designs,
      storagePersisted: true,
    });
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
