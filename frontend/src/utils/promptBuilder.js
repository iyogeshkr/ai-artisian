const DEFAULT_STYLE_SUFFIX =
  "Indian artisan craft, handcrafted product photography, rich texture, premium lighting, premium ecommerce catalog shot, centered composition, highly detailed";

function prettify(value) {
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

export function buildImagePrompt({
  colorPalette = "",
  craftType = "",
  description = "",
  style = "fusion",
} = {}) {
  const promptParts = [
    craftType ? `${prettify(craftType)} artisan product concept` : "Indian artisan product concept",
    style ? `${prettify(style)} style` : "",
    colorPalette ? `using ${colorPalette} color palette` : "",
    description || "",
    "preserve heritage craft identity while making it market-ready for modern buyers",
    DEFAULT_STYLE_SUFFIX,
  ].filter(Boolean);

  return promptParts.join(", ");
}
