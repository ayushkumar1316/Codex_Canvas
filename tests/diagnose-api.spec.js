import { test, expect } from "@playwright/test";

test("diagnose: AI pipeline end-to-end", async ({ page }) => {
  const consoleLogs = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[Pipeline]") || text.includes("[Gemini]") || text.includes("[Provider") || text.includes("[Validator") || text.includes("[EDIT-TRACE") || text.includes("Error") || text.includes("error") || text.includes("Falling back") || text.includes("fail")) {
      consoleLogs.push(text);
    }
  });

  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const envCheck = await page.evaluate(() => {
    var env = import.meta.env;
    var gk = env.VITE_GEMINI_API_KEY;
    var gqk = env.VITE_GROQ_API_KEY;
    var ork = env.VITE_OPENROUTER_API_KEY;
    var oaik = env.VITE_OPENAI_API_KEY;
    return {
      provider: env.VITE_AI_PROVIDER || "not set",
      gemini: gk ? ("present " + gk.length + " chars, starts: " + gk.slice(0, 6)) : "MISSING",
      groq: gqk ? ("present " + gqk.length + " chars, starts: " + gqk.slice(0, 6)) : "MISSING",
      openrouter: ork ? ("present " + ork.length + " chars, starts: " + ork.slice(0, 6)) : "MISSING",
      openai: oaik ? ("present " + oaik.length + " chars, starts: " + oaik.slice(0, 6)) : "MISSING",
    };
  });
  console.log("=== ENV CHECK ===", JSON.stringify(envCheck, null, 2));

  var geminiTest = await page.evaluate(async () => {
    try {
      var key = import.meta.env.VITE_GEMINI_API_KEY;
      if (!key) return { success: false, error: "No API key" };
      var res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + key,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Say hello in one word" }] }] }),
          signal: AbortSignal.timeout(15000),
        }
      );
      var data = await res.json();
      return { success: res.ok, status: res.status, error: data.error ? data.error.message : null, text: data.candidates && data.candidates[0] && data.candidates[0].content ? data.candidates[0].content.parts[0].text : null };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log("=== GEMINI API TEST ===", JSON.stringify(geminiTest, null, 2));

  var groqTest = await page.evaluate(async () => {
    try {
      var key = import.meta.env.VITE_GROQ_API_KEY;
      if (!key) return { success: false, error: "No API key" };
      var res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: "Say hello in one word" }], max_tokens: 10 }),
        signal: AbortSignal.timeout(15000),
      });
      var data = await res.json();
      return { success: res.ok, status: res.status, error: data.error ? data.error.message : null, text: data.choices && data.choices[0] ? data.choices[0].message.content : null };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log("=== GROQ API TEST ===", JSON.stringify(groqTest, null, 2));

  var openrouterTest = await page.evaluate(async () => {
    try {
      var key = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!key) return { success: false, error: "No API key" };
      var res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify({ model: "nvidia/nemotron-3-ultra-550b-a55b:free", messages: [{ role: "user", content: "Say hello in one word" }], max_tokens: 10 }),
        signal: AbortSignal.timeout(15000),
      });
      var data = await res.json();
      return { success: res.ok, status: res.status, error: data.error ? data.error.message : null, text: data.choices && data.choices[0] ? data.choices[0].message.content : null };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log("=== OPENROUTER API TEST ===", JSON.stringify(openrouterTest, null, 2));

  if (consoleLogs.length > 0) {
    console.log("=== CONSOLE LOGS ===");
    consoleLogs.forEach((l) => console.log(l));
  }
  if (pageErrors.length > 0) {
    console.log("=== PAGE ERRORS ===");
    pageErrors.forEach((e) => console.log(e));
  }

  expect(true).toBe(true);
});
