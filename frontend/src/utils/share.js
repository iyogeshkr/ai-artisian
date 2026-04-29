export async function shareProduct({ product, shareUrl, storefrontUrl }) {
  const shareText = `${product.name} - ₹${product.price}\n${product.description}\n${shareUrl || storefrontUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        text: shareText,
        title: product.name,
        url: shareUrl || storefrontUrl,
      });
      return true;
    } catch {
      return false;
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  return true;
}
