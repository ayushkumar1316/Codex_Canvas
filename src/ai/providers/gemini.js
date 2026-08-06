import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-3.5-flash-lite";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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
  async execute({ systemPrompt, context, userPrompt }) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    });

    const userContent = JSON.stringify({ context, userPrompt });

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(userContent);
        const response = result.response;
        const text = response.text();

        if (!text) {
          throw new Error("No content in Gemini response");
        }

        const cleaned = stripMarkdownFences(text);

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          throw new Error(
            `Failed to parse Gemini response as JSON. Response starts with: ${cleaned.substring(0, 100)}...`
          );
        }

        return parsed;
      } catch (error) {
        lastError = error;
        const isRetryable =
          error.message?.includes("503") ||
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
