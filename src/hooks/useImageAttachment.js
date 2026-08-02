import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function validateFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported file type. Use PNG, JPG, or WEBP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

function generatePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to generate preview"));
    reader.readAsDataURL(file);
  });
}

export default function useImageAttachment() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      const preview = await generatePreview(file);
      setImage({
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      return true;
    } catch {
      setError("Failed to generate preview");
      return false;
    }
  }, []);

  const handleFileSelect = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (file) {
        await processFile(file);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        await processFile(file);
      }
    },
    [processFile]
  );

  const handlePaste = useCallback(
    async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            await processFile(file);
            break;
          }
        }
      }
    },
    [processFile]
  );

  const removeImage = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    image,
    error,
    inputRef,
    hasImage: !!image,
    handleFileSelect,
    handleDrop,
    handlePaste,
    removeImage,
    reset,
    openFilePicker,
  };
}
