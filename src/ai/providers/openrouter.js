const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function truncatePrompt(prompt, maxChars = 10000) {
  if (prompt.length <= maxChars) return prompt;
  return prompt.slice(0, maxChars) + "\n\n[Truncated to fit token budget]";
}

export const openRouterProvider = {
  async execute({ systemPrompt, context, userPrompt, model: resolvedModel }) {
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

    const modelId = resolvedModel || import.meta.env.VITE_OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Codex Canvas",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "system",
            content: truncatePrompt(systemPrompt),
          },
          {
            role: "user",
            content,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2048,
      }),
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

    return JSON.parse(cleaned);
  },
};

export default openRouterProvider;
