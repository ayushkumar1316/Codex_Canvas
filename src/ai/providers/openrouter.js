const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const openRouterProvider = {
  async execute({ systemPrompt, context, userPrompt }) {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Codex Canvas",
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENROUTER_MODEL || "openai/gpt-5",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              context,
              userPrompt,
            }),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result?.error?.message || result?.error || `API error ${response.status}`;
      throw new Error(errorMessage);
    }

    const content = result?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in API response");
    }

    return JSON.parse(content);
  },
};

export default openRouterProvider;
