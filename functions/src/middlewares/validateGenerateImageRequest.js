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

export function validateGenerateImageRequest(req, res, next) {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const craftType =
    typeof req.body?.craftType === "string" ? req.body.craftType.trim().toLowerCase() : "";
  const colorPalette =
    typeof req.body?.colorPalette === "string" ? req.body.colorPalette.trim() : "";
  const style = typeof req.body?.style === "string" ? req.body.style.trim().toLowerCase() : "";
  const description =
    typeof req.body?.description === "string" ? req.body.description.trim() : "";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  if (prompt.length < 8) {
    return res
      .status(400)
      .json({ error: "Prompt must be at least 8 characters long." });
  }

  if (prompt.length > 2000) {
    return res
      .status(400)
      .json({ error: "Prompt is too long. Keep it under 2000 characters." });
  }

  if (craftType && !ALLOWED_CRAFT_TYPES.has(craftType)) {
    return res.status(400).json({ error: "Craft type is not supported." });
  }

  if (style && !ALLOWED_STYLES.has(style)) {
    return res.status(400).json({ error: "Style is not supported." });
  }

  if (colorPalette.length > 120) {
    return res.status(400).json({ error: "Color palette must stay under 120 characters." });
  }

  if (description.length > 400) {
    return res
      .status(400)
      .json({ error: "Description is too long. Keep it under 400 characters." });
  }

  req.validatedBody = {
    colorPalette,
    craftType,
    description,
    prompt,
    style,
  };

  return next();
}
