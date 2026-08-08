const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

export default groqProvider;
