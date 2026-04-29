// NOT CURRENTLY WIRED — kept for future AIAssistant.jsx use
import { useState } from "react";
import { generateImage } from "@/services/imageService";
import { compressImageDataUrl } from "@/utils/imageProcessing";

function getFriendlyErrorMessage(generationError) {
  const sourceMessage =
    generationError?.message ||
    "Image generation failed. Please try again with a different prompt.";

  return `डिज़ाइन अभी नहीं बन सकी। कृपया दोबारा कोशिश करें। ${sourceMessage}`;
}

export function useImageGenerator() {
  const [image, setImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lastRequest, setLastRequest] = useState(null);

  const runGeneration = async (request) => {
    if (!request?.craftType || !request?.style || !request?.colorPalette?.trim()) {
      throw new Error("Please choose craft type, style, and a color palette.");
    }

    setIsGenerating(true);
    setError("");
    setLastRequest(request);

    try {
      const result = await generateImage(request);
      const compressedImageUrl = await compressImageDataUrl(result.imageUrl, {
        maxHeight: 800,
        maxWidth: 800,
      });
      const nextImage = {
        ...result,
        imageUrl: compressedImageUrl,
      };
      setImage(nextImage);
      return nextImage;
    } catch (generationError) {
      const message = getFriendlyErrorMessage(generationError);
      setError(message);
      const nextError = new Error(message);
      nextError.cause = generationError;
      throw nextError;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setImage(null);
    setError("");
    setLastRequest(null);
  };

  return {
    error,
    image,
    isGenerating,
    lastRequest,
    regenerateImage: () => runGeneration(lastRequest),
    resetGeneration,
    runGeneration,
  };
}
