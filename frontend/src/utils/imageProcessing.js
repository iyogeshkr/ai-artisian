function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = source;
  });
}

export async function compressImageDataUrl(dataUrl, options = {}) {
  const {
    maxHeight = 800,
    maxWidth = 800,
    mimeType = "image/jpeg",
    quality = 0.82,
  } = options;
  const image = await loadImage(dataUrl);
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL(mimeType, quality);
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File could not be read."));
    reader.readAsDataURL(file);
  });
}

export async function compressImageFile(file, options) {
  const dataUrl = await fileToDataUrl(file);
  return compressImageDataUrl(dataUrl, options);
}
