const CRAFT_LABELS = {
  embroidery: "embroidery",
  jewelry: "jewelry",
  metalwork: "metalwork",
  painting: "painting",
  pottery: "pottery",
  textiles: "textiles",
  weaving: "weaving",
  woodwork: "woodwork",
};

const STYLE_LABELS = {
  fusion: "fusion of heritage and contemporary taste",
  minimal: "minimal and clean modern styling",
  modern: "modern premium styling",
  traditional: "traditional heritage styling",
};

const VARIANT_DIRECTIONS = [
  "product photography for ecommerce catalog, centered composition, premium background",
  "lifestyle showcase for urban buyers, soft natural light, aspirational mood",
  "close-up design study, rich textures, detailed artisan finishing, collector appeal",
];

function prettifyPalette(colorPalette) {
  return colorPalette
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * Builds prompt variants for the design generation endpoint.
 * @param {{ craftType: string, colorPalette: string, style: string, description: string }} input
 * @returns {string[]}
 */
export function buildDesignPromptVariants(input) {
  const palette = prettifyPalette(input.colorPalette);
  const craftLabel = CRAFT_LABELS[input.craftType] || input.craftType;
  const styleLabel = STYLE_LABELS[input.style] || input.style;
  const description = input.description ? `${input.description.trim()}, ` : "";

  return VARIANT_DIRECTIONS.map(
    (direction) =>
      `Indian artisan ${craftLabel} product design, ${styleLabel}, base colors ${palette}, ${description}preserve handcrafted identity, ready for modern buyers, ${direction}, high detail, studio quality, black-forest-labs FLUX.1-schnell`,
  );
}
