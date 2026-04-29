/**
 * Validates POST /track-event input.
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
export function validateTrackEventRequest(req, _res, next) {
  const event = typeof req.body?.event === "string" ? req.body.event.trim() : "unknown_event";
  const artisanId =
    typeof req.body?.artisanId === "string" ? req.body.artisanId.trim() : "anonymous";
  const metadata =
    req.body?.metadata && typeof req.body.metadata === "object" && !Array.isArray(req.body.metadata)
      ? req.body.metadata
      : {};

  req.validatedBody = {
    artisanId,
    event,
    metadata,
  };

  return next();
}
