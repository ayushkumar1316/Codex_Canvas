const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export const openAIProvider = {
  async execute({ systemPrompt, context, userPrompt, schema }) {
    const content = [
      {
        type: "input_text",
        text: JSON.stringify({
          context,
          userPrompt,
        }),
      },
    ];

    const refImage = context?.referenceImage;
    if (refImage?.preview) {
      content.push({
        type: "input_image",
        image_url: refImage.preview,
      });
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL || "gpt-5",
        instructions: systemPrompt,
        input: [
          {
            role: "user",
            content,
          },
        ],
        text: {
          format: schema,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new Error(`API error ${response.status}: ${errorBody}`);
    }

    if (!result.output_text) {
      throw new Error("No output_text in API response");
    }

    return JSON.parse(result.output_text);
  },
};

export default openAIProvider;
