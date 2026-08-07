import { config } from "dotenv";
config();

const keys = [
  "sk-1234efgh5678ijkl1234efgh5678ijkl1234efgh",
  "sk-5678mnopqrstuvwx5678mnopqrstuvwx5678mnop",
  "sk-abcdijkl1234uvwxabcdijkl1234uvwxabcdijkl",
  "sk-ijklmnopabcd5678ijklmnopabcd5678ijklmnop",
  "sk-1234efghqrstuvwx1234efghqrstuvwx1234efgh",
  "sk-5678ijklmnopabcd5678ijklmnopabcd5678ijkl",
  "sk-abcd1234efgh5678abcd1234efgh5678abcd1234",
  "sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop",
];

const modelsToTest = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
];

async function testKey(key, index) {
  const masked = key.slice(0, 7) + "..." + key.slice(-4);
  console.log(`\n  [${index + 1}/${keys.length}] Testing ${masked}`);

  const start = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    const elapsed = Date.now() - start;

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error?.message || `HTTP ${res.status}`;
      console.log(`    🔴 Invalid — ${msg} (${elapsed}ms)`);
      return { key: masked, valid: false, models: [] };
    }

    const data = await res.json();
    const allModels = data.data.map((m) => m.id);
    const supported = modelsToTest.filter((m) => allModels.includes(m));
    const hasGpt4o = allModels.some((m) => m.startsWith("gpt-4o"));
    const hasGpt4 = allModels.some((m) => m.startsWith("gpt-4"));
    const hasGpt35 = allModels.some((m) => m.startsWith("gpt-3.5"));

    console.log(`    🟢 Valid (${elapsed}ms)`);
    console.log(`    Total models available: ${allModels.length}`);
    if (supported.length > 0) {
      console.log(`    Supported test models: ${supported.join(", ")}`);
    }
    if (hasGpt4o) console.log(`    ✅ Supports GPT-4o family`);
    if (hasGpt4) console.log(`    ✅ Supports GPT-4 family`);
    if (hasGpt35) console.log(`    ✅ Supports GPT-3.5 family`);

    return { key: masked, valid: true, models: supported, allModels: allModels.length };
  } catch (err) {
    const elapsed = Date.now() - start;
    console.log(`    🔴 Error — ${err.message} (${elapsed}ms)`);
    return { key: masked, valid: false, models: [] };
  }
}

async function testChatCompletion(key) {
  const start = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const elapsed = Date.now() - start;
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data?.error?.message || `HTTP ${res.status}`, elapsed };
    }
    return { ok: true, text: data.choices?.[0]?.message?.content, elapsed };
  } catch (err) {
    return { ok: false, error: err.message, elapsed: Date.now() - start };
  }
}

console.log("\n  ═══════════════════════════════════════════════════════════════");
console.log("   OpenAI API Key Tester");
console.log("  ═══════════════════════════════════════════════════════════════");

const results = [];
for (let i = 0; i < keys.length; i++) {
  const r = await testKey(keys[i], i);
  results.push(r);
}

const validKeys = results.filter((r) => r.valid);

console.log("\n  ═══════════════════════════════════════════════════════════════");
console.log("   Summary");
console.log("  ═══════════════════════════════════════════════════════════════\n");

if (validKeys.length === 0) {
  console.log("  No valid keys found.\n");
} else {
  console.log(`  Valid keys: ${validKeys.length}/${keys.length}\n`);
  for (const vk of validKeys) {
    console.log(`  ✅ ${vk.key}`);
    console.log(`     Models: ${vk.models.length > 0 ? vk.models.join(", ") : "Check manually"}`);
    console.log(`     Total available: ${vk.allModels}\n`);
  }

  console.log("  Testing chat completion with first valid key...\n");
  const firstKey = keys[results.findIndex((r) => r.valid)];
  const chatResult = await testChatCompletion(firstKey);
  if (chatResult.ok) {
    console.log(`  ✅ Chat completion works — Response: "${chatResult.text}" (${chatResult.elapsed}ms)\n`);
  } else {
    console.log(`  ❌ Chat completion failed — ${chatResult.error} (${chatResult.elapsed}ms)\n`);
  }
}

console.log("  ═══════════════════════════════════════════════════════════════\n");
