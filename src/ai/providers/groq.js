const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const FETCH_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function truncatePrompt(prompt, maxChars = 12000) {
  if (prompt.length <= maxChars) return prompt;
  return prompt.slice(0, maxChars) + "\n\n[Truncated for Groq payload limit]";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const msg = error?.message || "";
  return msg.includes("429") || msg.includes("503") || msg.includes("timeout") || msg.includes("ECONNRESET");
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || attempt === retries) return response;
      if (response.status === 429 || response.status === 503) {
        if (attempt < retries) {
          await delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries && isRetryableError(error)) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const groqProvider = {
  async execute({ systemPrompt, context, userPrompt, schema, model: resolvedModel }) {
    const content = [
      {
        type: "text",
        text: JSON.stringify({
          context,
          userPrompt,
        }),
      },
    ];

    const refImage = context?.referenceImage;
    if (refImage?.preview) {
      content.push({
        type: "image_url",
        image_url: { url: refImage.preview },
      });
    }

    const body = {
      model: resolvedModel || import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: truncatePrompt(systemPrompt) },
        { role: "user", content },
      ],
      temperature: 0.1,
      max_tokens: 8192,
    };

    if (schema) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetchWithRetry(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result?.error?.message || result?.error || `API error ${response.status}`;
      throw new Error(errorMessage);
    }

    const responseBody = result?.choices?.[0]?.message?.content;
    if (!responseBody) {
      throw new Error("No content in API response");
    }

    let cleaned = responseBody.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    cleaned = cleaned.trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error(`Failed to parse AI response as JSON: ${parseErr.message}`, { cause: parseErr });
    }

    const opCount = parsed?.operations?.length ?? (Array.isArray(parsed) ? parsed.length : 0); // eslint-disable-line no-unused-vars
    return parsed;
  },

  /**
   * Stream variant for progressive rendering
   * Emits operations as they arrive from the stream
   */
  async executeStream({ systemPrompt, context, userPrompt, schema, model: resolvedModel, onOperation }) {
    const content = [
      {
        type: "text",
        text: JSON.stringify({
          context,
          userPrompt,
        }),
      },
    ];

    const refImage = context?.referenceImage;
    if (refImage?.preview) {
      content.push({
        type: "image_url",
        image_url: { url: refImage.preview },
      });
    }

    const body = {
      model: resolvedModel || import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: truncatePrompt(systemPrompt) },
        { role: "user", content },
      ],
      temperature: 0.1,
      max_tokens: 8192,
      stream: true,
    };

    if (schema) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || errorData?.error || `API error ${response.status}`;
      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1]; // Keep incomplete line

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();

          if (!line || line.startsWith(":")) continue; // Skip empty/comment lines

          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const event = JSON.parse(data);
              const content = event?.choices?.[0]?.delta?.content || "";

              if (content) {
                // Accumulate content and try to parse operations
                if (onOperation) {
                  onOperation({ chunk: content, type: "delta" });
                }
              }
            } catch {
              // silently ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

export default groqProvider;
