const ALLOWED_CRAFT_TYPES = new Set([
  "pottery",
  "weaving",
  "embroidery",
  "woodwork",
  "metalwork",
  "textiles",
  "painting",
  "jewelry",
]);

const ALLOWED_STYLES = new Set(["traditional", "fusion", "modern", "minimal"]);
const ALLOWED_COLOR_PALETTES = new Set([
  "earthy",
  "vibrant",
  "pastel",
  "monochrome",
  "gold",
  "natural",
]);

/**
 * Validates POST /generate-design input.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response}
 */
export function validateGenerateDesignRequest(req, res, next) {
  const craftType =
    typeof req.body?.craftType === "string" ? req.body.craftType.trim().toLowerCase() : "";
  const colorPalette =
    typeof req.body?.colorPalette === "string" ? req.body.colorPalette.trim().toLowerCase() : "";
  const style = typeof req.body?.style === "string" ? req.body.style.trim().toLowerCase() : "";
  const description =
    typeof req.body?.description === "string" ? req.body.description.trim() : "";

  if (!craftType || !ALLOWED_CRAFT_TYPES.has(craftType)) {
    return res.status(400).json({ error: "Please choose a valid craft type." });
  }

  if (!colorPalette || !ALLOWED_COLOR_PALETTES.has(colorPalette)) {
    return res.status(400).json({ error: "Please choose a valid color palette." });
  }

  if (!style || !ALLOWED_STYLES.has(style)) {
    return res.status(400).json({ error: "Please choose a valid style." });
  }

  if (description.length > 200) {
    return res.status(400).json({ error: "Description must stay under 200 characters." });
  }

  req.validatedBody = {
    colorPalette,
    craftType,
    description,
    style,
  };

  return next();
}
