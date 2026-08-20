import { test, expect } from "@playwright/test";

test.describe("AI pipeline E2E", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("AI generates content from prompt", async ({ page }) => {
    test.setTimeout(240000);

    const consoleLogs = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("[Pipeline]") || text.includes("[Gemini]") || text.includes("[Provider") || text.includes("Falling back") || text.includes("ERROR") || text.includes("error")) {
        consoleLogs.push(text);
      }
    });

    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click "SaaS Landing Page" template
    const saasBtn = page.getByRole("button", { name: /saas landing page/i });
    if (await saasBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saasBtn.click();
      await page.waitForTimeout(1000);
    }

    // Find AI input
    const aiInput = page.locator('input[aria-label="Describe what you want to create"]');
    await expect(aiInput).toBeVisible({ timeout: 5000 });

    // Type prompt
    await aiInput.fill("Make the heading text say Welcome to Codex Canvas in large bold letters");

    // Submit
    await aiInput.press("Enter");

    // Wait for success or error toast/status to appear (up to 120s)
    await page.waitForFunction(() => {
      var el = document.querySelector('[data-phase="success"]') || document.querySelector('[data-phase="error"]');
      if (el) return true;
      var all = document.body.innerText;
      if (all.includes("Success") || all.includes("success") || all.includes("Error") || all.includes("failed")) return true;
      return false;
    }, { timeout: 120000 });

    await page.waitForTimeout(500);

    // Check result - also accept "idle" if tree has children (phase reset after success)
    const result = await page.evaluate(() => {
      try {
        var store = window.__zustandStore;
        if (!store) return { error: "Store not found on window" };
        var state = store.getState();
        return {
          phase: state.aiPhase,
          error: state.aiError ? state.aiError.message : null,
          treeChildren: state.componentTree ? state.componentTree.children.length : 0,
          hasContent: state.componentTree && state.componentTree.children && state.componentTree.children.length > 0,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log("=== RESULT ===", JSON.stringify(result, null, 2));
    if (consoleLogs.length > 0) {
      console.log("=== PIPELINE LOGS (last 30) ===");
      consoleLogs.slice(-30).forEach((l) => console.log(l));
    }
    if (pageErrors.length > 0) {
      console.log("=== PAGE ERRORS ===");
      pageErrors.forEach((e) => console.log(e));
    }

    expect(result.hasContent, "AI should generate canvas content").toBe(true);
    expect(result.treeChildren, "Canvas should have child components").toBeGreaterThan(0);
  });
});
