import { test, expect } from "@playwright/test";

test.describe("create_component_tree safety net", () => {
  test.use({ viewport: { width: 800, height: 600 } });

  test("repair converts create_component_tree to valid replaceNode", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async () => {
      const validator = await import("/src/ai/validator.js");
      const repair = await import("/src/ai/repair/repairEngine.js");

      const raw = {
        type: "create_component_tree",
        componentTree: {
          id: "root",
          type: "root",
          props: { className: "flex flex-col min-h-screen" },
          styles: { backgroundColor: "#ffffff" },
          children: [
            { id: "hero", type: "container", props: { text: "Hello" }, styles: { color: "#333333" }, children: [] },
          ],
        },
      };

      const repaired = repair.repairResponse({ operations: [raw] }, [], {});
      const out = repaired.response || repaired;
      const v = validator.validateResponse(out, {
        componentTree: { id: "root", type: "root", props: {}, styles: {}, children: [] },
      });
      const op = v.success ? v.patch.operations[0] : null;
      return {
        valid: v.success,
        type: op?.type,
        targetId: op?.targetId,
        nodeId: op?.node?.id,
        hasNode: !!(op && op.node),
        errors: (v.errors || []).map((e) => e.message).slice(0, 5),
      };
    });
    expect(result.valid, JSON.stringify(result)).toBe(true);
    expect(result.type).toBe("replaceNode");
    expect(result.targetId).toBe("root");
    expect(result.nodeId).toBe("root");
    expect(result.hasNode).toBe(true);
  });
});
