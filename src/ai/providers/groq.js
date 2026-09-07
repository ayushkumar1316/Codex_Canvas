const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const FETCH_TIMEOUT_MS = 90_000;

function truncatePrompt(prompt, maxChars = 12000) {
  if (prompt.length <= maxChars) return prompt;
  return prompt.slice(0, maxChars) + "\n\n[Truncated for Groq payload limit]";
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

    const response = await fetch(GROQ_API_URL, {
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

    console.log("[Groq] Raw response length:", responseBody.length);
    console.log("[Groq] Cleaned response (first 500):", cleaned.substring(0, 500));

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[Groq] JSON parse error:", parseErr.message);
      console.error("[Groq] Raw string that failed:", cleaned.substring(0, 300));
      throw new Error(`Failed to parse AI response as JSON: ${parseErr.message}`, { cause: parseErr });
    }

    const opCount = parsed?.operations?.length ?? (Array.isArray(parsed) ? parsed.length : 0);
    console.log("[Groq] Parsed operations count:", opCount, "version:", parsed?.version, "type:", parsed?.type);
    if (opCount > 0) {
      console.log("[Groq] First operation:", JSON.stringify(parsed.operations?.[0] ?? parsed[0], null, 2));
    }

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
              console.log("[Groq Stream] Stream complete");
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
            } catch (e) {
              console.error("[Groq Stream] Failed to parse SSE event:", e);
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
