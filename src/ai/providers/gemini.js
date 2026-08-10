import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.6-flash";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;
const FETCH_TIMEOUT_MS = 90_000;

function stripMarkdownFences(text) {
  let cleaned = text.trim();

  const fencePattern = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;
  const match = cleaned.match(fencePattern);
  if (match) {
    cleaned = match[1].trim();
  }

  return cleaned;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const geminiProvider = {
  async execute({ systemPrompt, context, userPrompt, model: resolvedModel }) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not set");
    }

    const modelName = resolvedModel || MODEL_NAME;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const contextPayload = { context, userPrompt };
    const userContent = [];

    userContent.push({ text: JSON.stringify(contextPayload) });

    const refImage = context?.referenceImage;
    if (refImage?.preview) {
      const dataUrl = refImage.preview;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      userContent.push({
        inlineData: {
          mimeType: refImage.type || "image/png",
          data: base64,
        },
      });
    }

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const requestPayload = userContent.length === 1 ? userContent[0] : userContent;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini request timed out")), FETCH_TIMEOUT_MS)
        );
        const result = await Promise.race([
          model.generateContent(requestPayload),
          timeoutPromise,
        ]);
        const response = result.response;
        const text = response.text();

        if (!text) {
          throw new Error("No content in Gemini response");
        }

        const cleaned = stripMarkdownFences(text);

        console.log("[Gemini] Raw response length:", text.length);
        console.log("[Gemini] Cleaned response (first 500):", cleaned.substring(0, 500));

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (parseErr) {
          console.error("[Gemini] JSON parse error:", parseErr.message);
          console.error("[Gemini] Raw string that failed:", cleaned.substring(0, 300));
          throw new Error(
            `Failed to parse Gemini response as JSON. Response starts with: ${cleaned.substring(0, 100)}...`
          );
        }

        const opCount = parsed?.operations?.length ?? (Array.isArray(parsed) ? parsed.length : 0);
        console.log("[Gemini] Parsed operations count:", opCount, "version:", parsed?.version, "type:", parsed?.type);
        if (opCount > 0) {
          console.log("[Gemini] First operation:", JSON.stringify(parsed.operations?.[0] ?? parsed[0], null, 2));
        }

        return parsed;
      } catch (error) {
        lastError = error;
        const isRetryable =
          error.message?.includes("429") ||
          error.message?.includes("503") ||
          error.message?.includes("RESOURCE_EXHAUSTED") ||
          error.message?.includes("UNAVAILABLE") ||
          error.message?.includes("high demand") ||
          error.message?.includes("retry");

        if (isRetryable && attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS * attempt);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  },
};

export default geminiProvider;
