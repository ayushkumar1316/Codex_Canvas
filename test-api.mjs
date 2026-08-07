import { config } from "dotenv";
config();

const providers = [
  {
    name: "Gemini",
    key: process.env.VITE_GEMINI_API_KEY,
    model: "gemini-3.5-flash-lite",
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.VITE_GEMINI_API_KEY}`,
    buildBody: () => ({
      contents: [{ parts: [{ text: "Reply with exactly: OK" }] }],
    }),
  },
  {
    name: "Groq",
    key: process.env.VITE_GROQ_API_KEY,
    model: process.env.VITE_GROQ_MODEL || "llama-3.2-90b-vision-preview",
    url: "https://api.groq.com/openai/v1/chat/completions",
    buildBody: () => ({
      model: process.env.VITE_GROQ_MODEL || "llama-3.2-90b-vision-preview",
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 10,
    }),
  },
  {
    name: "OpenAI",
    key: process.env.VITE_OPENAI_API_KEY,
    model: process.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
    url: "https://api.openai.com/v1/chat/completions",
    buildBody: () => ({
      model: process.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 10,
    }),
  },
  {
    name: "OpenRouter",
    key: process.env.VITE_OPENROUTER_API_KEY,
    model: process.env.VITE_OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
    url: "https://openrouter.ai/api/v1/chat/completions",
    buildBody: () => ({
      model: process.env.VITE_OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 10,
    }),
  },
];

async function testProvider(provider) {
  const label = `  ${provider.name}`.padEnd(14);
  const modelLabel = `(${provider.model})`.padEnd(38);

  if (!provider.key) {
    console.log(`${label} ${modelLabel} 🔴 API Key Missing`);
    return false;
  }

  const start = Date.now();
  try {
    const headers = { "Content-Type": "application/json" };
    if (provider.name === "OpenAI" || provider.name === "Groq") {
      headers["Authorization"] = `Bearer ${provider.key}`;
    } else if (provider.name === "OpenRouter") {
      headers["Authorization"] = `Bearer ${provider.key}`;
      headers["HTTP-Referer"] = "http://localhost:5173";
    }

    const res = await fetch(provider.url, {
      method: "POST",
      headers,
      body: JSON.stringify(provider.buildBody()),
      signal: AbortSignal.timeout(15000),
    });

    const elapsed = Date.now() - start;
    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || data?.message || `HTTP ${res.status}`;
      console.log(`${label} ${modelLabel} 🔴 Failed (${elapsed}ms) — ${errMsg}`);
      return false;
    }

    console.log(`${label} ${modelLabel} 🟢 OK (${elapsed}ms)`);
    return true;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`${label} ${modelLabel} 🔴 Error (${elapsed}ms) — ${err.message}`);
    return false;
  }
}

console.log("\n  Provider       Model                                    Status\n  " + "─".repeat(70));

const results = await Promise.all(providers.map(testProvider));

console.log("  " + "─".repeat(70));
const passed = results.filter(Boolean).length;
console.log(`  Result: ${passed}/${providers.length} providers working\n`);
