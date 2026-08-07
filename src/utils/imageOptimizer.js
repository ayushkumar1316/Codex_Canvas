const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.8;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for optimization"));
    img.src = src;
  });
}

function isPng(type) {
  return type === "image/png";
}

function shouldConvertToJpeg(type, width, height) {
  if (!isPng(type)) return false;
  const hasAlpha = width * height < 500000;
  return !hasAlpha;
}

export async function optimizeImage(imageRef) {
  if (!imageRef?.preview || !imageRef?.type) {
    return imageRef;
  }

  const originalSize = imageRef.size || 0;
  console.log("[ImageOptimizer] Input:", { type: imageRef.type, size: originalSize, name: imageRef.name });

  try {
    const img = await loadImage(imageRef.preview);
    const { naturalWidth: w, naturalHeight: h } = img;

    let targetW = w;
    let targetH = h;
    if (w > MAX_WIDTH) {
      targetH = Math.round(h * (MAX_WIDTH / w));
      targetW = MAX_WIDTH;
    }

    const convertToJpeg = shouldConvertToJpeg(imageRef.type, w, h);
    const mimeType = convertToJpeg ? "image/jpeg" : imageRef.type;

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL(mimeType, JPEG_QUALITY);
    const base64Length = dataUrl.length - `data:${mimeType};base64,`.length;
    const optimizedSize = Math.round(base64Length * 0.75);

    console.log("[ImageOptimizer] Output:", { mimeType, width: targetW, height: targetH, originalSize, optimizedSize, reduction: `${Math.round((1 - optimizedSize / originalSize) * 100)}%` });

    return {
      ...imageRef,
      type: mimeType,
      preview: dataUrl,
      size: optimizedSize,
    };
  } catch (err) {
    console.warn("[ImageOptimizer] Optimization failed, using original:", err.message);
    return imageRef;
  }
}
