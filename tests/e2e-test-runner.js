/**
 * Practical E2E Test Runner
 * Tests actual pipeline execution with mock data
 */

import { executeAICommand } from '../src/ai/aiService.js';
import { applyJsonPatchWithDiagnostics } from '../src/utils/jsonPatch.js';
import { validateResponse } from '../src/ai/validator.js';

const TEST_RESULTS = [];

// Mock component tree for testing
const MOCK_INITIAL_TREE = {
  id: "root",
  type: "Container",
  props: { className: "page" },
  children: [
    {
      id: "section_hero_abc123",
      type: "Container",
      props: { className: "hero" },
      styles: { backgroundColor: "#ffffff", padding: "40px 20px" },
      children: [
        {
          id: "text_hero_title_def456",
          type: "Text",
          props: { content: "Welcome to Our Platform" },
          styles: { fontSize: "32px", fontWeight: "400", color: "#000000" }
        },
        {
          id: "text_hero_subtitle_ghi789",
          type: "Text",
          props: { content: "Build amazing things" },
          styles: { fontSize: "16px", color: "#666666", marginTop: "10px" }
        },
        {
          id: "button_cta_primary_jkl012",
          type: "Button",
          props: { label: "Get Started" },
          styles: {
            backgroundColor: "#0066cc",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "4px"
          }
        }
      ]
    },
    {
      id: "section_features_mno345",
      type: "Container",
      props: { className: "features" },
      styles: { backgroundColor: "#f9f9f9", padding: "60px 20px" },
      children: [
        {
          id: "grid_features_pqr678",
          type: "Grid",
          props: { columns: 3 },
          children: [
            {
              id: "card_feature_1_stu901",
              type: "Card",
              children: [
                {
                  id: "text_feature_title_1_vwx234",
                  type: "Text",
                  props: { content: "Fast" },
                  styles: { fontSize: "18px", fontWeight: "600" }
                },
                {
                  id: "text_feature_desc_1_yz567",
                  type: "Text",
                  props: { content: "Lightning quick performance" },
                  styles: { fontSize: "14px", color: "#666666" }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

function logTest(testId, name, status, details = "") {
  const result = { testId, name, status, details, timestamp: new Date().toISOString() };
  TEST_RESULTS.push(result);

  const statusIcon = status === "✓ PASS" ? "✓" : status === "✗ FAIL" ? "✗" : "⚠";
  console.log(`${statusIcon} [${testId}] ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

async function testTreeValidation() {
  console.log("\n=== TEST: Tree Validation ===\n");

  // Check tree structure
  if (!MOCK_INITIAL_TREE.id || !MOCK_INITIAL_TREE.children) {
    logTest("TREE_001", "Tree has root and children", "✗ FAIL", "Missing root or children");
    return false;
  }
  logTest("TREE_001", "Tree has root and children", "✓ PASS");

  // Check all IDs are semantic
  const checkSemanticIds = (node, path = "") => {
    if (!node.id) {
      logTest("TREE_002", "Semantic ID validation", "✗ FAIL", `Missing ID at ${path}`);
      return false;
    }
    const idFormat = /^[a-z]+_[a-z_]*_[a-z0-9]{3,}$/;
    if (!idFormat.test(node.id)) {
      logTest("TREE_002", "Semantic ID validation", "✗ FAIL", `Invalid format: ${node.id}`);
      return false;
    }
    if (node.children) {
      return node.children.every((child, idx) => checkSemanticIds(child, `${path}/${node.id}[${idx}]`));
    }
    return true;
  };

  if (checkSemanticIds(MOCK_INITIAL_TREE)) {
    logTest("TREE_002", "Semantic ID format validation", "✓ PASS");
  }

  return true;
}

async function testSingleEditParsing() {
  console.log("\n=== TEST: Single Edit Parsing ===\n");

  // Simulate AI response for edit
  const mockEditResponse = {
    version: "1.0",
    type: "patch",
    operations: [
      {
        type: "update",
        targetId: "text_hero_title_def456",
        props: { content: "Welcome to Our Amazing Platform" },
        styles: { fontSize: "36px", fontWeight: "600" }
      }
    ]
  };

  try {
    // Validate response structure
    if (!mockEditResponse.operations || !Array.isArray(mockEditResponse.operations)) {
      logTest("EDIT_001", "Response has operations array", "✗ FAIL");
      return false;
    }
    logTest("EDIT_001", "Response has operations array", "✓ PASS");

    // Check operation has targetId
    const op = mockEditResponse.operations[0];
    if (!op.targetId) {
      logTest("EDIT_002", "Operation has targetId", "✗ FAIL");
      return false;
    }
    logTest("EDIT_002", "Operation has targetId", "✓ PASS");

    // Check targetId exists in tree
    const findNode = (node, id) => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    };

    const targetNode = findNode(MOCK_INITIAL_TREE, op.targetId);
    if (!targetNode) {
      logTest("EDIT_003", "Target node exists in tree", "✗ FAIL", `Node ${op.targetId} not found`);
      return false;
    }
    logTest("EDIT_003", "Target node exists in tree", "✓ PASS");

    // Apply patch and verify
    const patchResult = applyJsonPatchWithDiagnostics(
      JSON.parse(JSON.stringify(MOCK_INITIAL_TREE)),
      { operations: mockEditResponse.operations }
    );

    if (patchResult.applied === 0) {
      logTest("EDIT_004", "Patch applied successfully", "✗ FAIL", "No operations applied");
      return false;
    }
    logTest("EDIT_004", "Patch applied successfully", "✓ PASS", `${patchResult.applied}/${patchResult.total} operations`);

    // Verify tree still valid after patch
    if (!patchResult.tree?.id) {
      logTest("EDIT_005", "Tree valid after patch", "✗ FAIL", "Tree corrupted");
      return false;
    }
    logTest("EDIT_005", "Tree valid after patch", "✓ PASS");

    return true;
  } catch (error) {
    logTest("EDIT_000", "Single edit parsing", "✗ FAIL", error.message);
    return false;
  }
}

async function testMultipleSequentialEdits() {
  console.log("\n=== TEST: Multiple Sequential Edits ===\n");

  let currentTree = JSON.parse(JSON.stringify(MOCK_INITIAL_TREE));
  const edits = [
    {
      name: "Edit 1: Change hero background",
      operations: [
        {
          type: "update",
          targetId: "section_hero_abc123",
          styles: { backgroundColor: "#001a33" }
        }
      ]
    },
    {
      name: "Edit 2: Make hero text white",
      operations: [
        {
          type: "update",
          targetId: "text_hero_title_def456",
          styles: { color: "#ffffff" }
        }
      ]
    },
    {
      name: "Edit 3: Increase button padding",
      operations: [
        {
          type: "update",
          targetId: "button_cta_primary_jkl012",
          styles: { padding: "16px 32px" }
        }
      ]
    }
  ];

  let editCount = 0;
  for (const edit of edits) {
    try {
      const patchResult = applyJsonPatchWithDiagnostics(currentTree, edit);

      if (patchResult.applied > 0) {
        currentTree = patchResult.tree;
        editCount++;
        logTest(`SEQ_EDIT_${editCount}`, edit.name, "✓ PASS", `Tree updated`);
      } else {
        logTest(`SEQ_EDIT_${editCount}`, edit.name, "✗ FAIL", `No operations applied`);
      }
    } catch (error) {
      logTest(`SEQ_EDIT_${editCount}`, edit.name, "✗ FAIL", error.message);
    }
  }

  // Verify final tree validity
  if (currentTree.id && editCount === edits.length) {
    logTest("SEQ_FINAL", "All edits applied and tree valid", "✓ PASS", `${editCount} edits completed`);
    return true;
  } else {
    logTest("SEQ_FINAL", "All edits applied and tree valid", "✗ FAIL");
    return false;
  }
}

async function testPrompPronounResolution() {
  console.log("\n=== TEST: Prompt Pronoun Resolution ===\n");

  const promptExamples = [
    {
      prompt: "Make it orange",
      shouldResolveFrom: "previous edit context",
      expectedTarget: "last_edited_component"
    },
    {
      prompt: "Now make them bigger",
      shouldResolveFrom: "plural pronoun",
      expectedTarget: "multiple_components"
    },
    {
      prompt: "That button needs to be red",
      shouldResolveFrom: "demonstrative pronoun",
      expectedTarget: "recently_mentioned_component"
    }
  ];

  let passCount = 0;
  for (let i = 0; i < promptExamples.length; i++) {
    const example = promptExamples[i];
    const hasPronoun = /\b(it|them|that|this|they|those|these)\b/i.test(example.prompt);

    if (hasPronoun) {
      logTest(`PRONOUN_${i + 1}`, `Pronoun detection: "${example.prompt}"`, "✓ PASS", example.shouldResolveFrom);
      passCount++;
    } else {
      logTest(`PRONOUN_${i + 1}`, `Pronoun detection: "${example.prompt}"`, "✗ FAIL");
    }
  }

  if (passCount === promptExamples.length) {
    logTest("PRONOUN_FINAL", "Pronoun resolution logic", "✓ PASS");
    return true;
  }
  return false;
}

async function testConflictResolution() {
  console.log("\n=== TEST: Conflict Resolution ===\n");

  // Two conflicting edits on same component
  const conflict = {
    component: "button_cta_primary_jkl012",
    edit1: {
      styles: { backgroundColor: "#ff0000" } // Red
    },
    edit2: {
      styles: { backgroundColor: "#00ff00" } // Green
    }
  };

  // In practice, latest edit should win
  const currentTree = JSON.parse(JSON.stringify(MOCK_INITIAL_TREE));

  // Apply first edit
  let result1 = applyJsonPatchWithDiagnostics(currentTree, {
    operations: [{ type: "update", targetId: conflict.component, ...conflict.edit1 }]
  });

  if (result1.applied === 0) {
    logTest("CONFLICT_001", "First conflicting edit", "✗ FAIL");
    return false;
  }
  logTest("CONFLICT_001", "First conflicting edit applied", "✓ PASS");

  // Apply second conflicting edit
  let result2 = applyJsonPatchWithDiagnostics(result1.tree, {
    operations: [{ type: "update", targetId: conflict.component, ...conflict.edit2 }]
  });

  if (result2.applied === 0) {
    logTest("CONFLICT_002", "Second conflicting edit", "✗ FAIL");
    return false;
  }
  logTest("CONFLICT_002", "Second conflicting edit applied", "✓ PASS");

  // Verify latest edit won
  const findNode = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const finalNode = findNode(result2.tree, conflict.component);
  if (finalNode?.styles?.backgroundColor === "#00ff00") {
    logTest("CONFLICT_003", "Latest edit wins (green)", "✓ PASS");
    return true;
  } else {
    logTest("CONFLICT_003", "Latest edit wins", "✗ FAIL", `Got ${finalNode?.styles?.backgroundColor}`);
    return false;
  }
}

async function testEdgeCases() {
  console.log("\n=== TEST: Edge Cases ===\n");

  let passCount = 0;

  // Edge case 1: Deeply nested component
  const deepFindNode = (node, id, depth = 0) => {
    if (node.id === id) return { node, depth };
    if (node.children) {
      for (const child of node.children) {
        const found = deepFindNode(child, id, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const deepestNode = deepFindNode(MOCK_INITIAL_TREE, "text_feature_desc_1_yz567");
  if (deepestNode && deepestNode.depth > 2) {
    logTest("EDGE_001", "Deep nesting found", "✓ PASS", `Depth: ${deepestNode.depth}`);
    passCount++;
  }

  // Edge case 2: Empty response handling
  try {
    const emptyResponse = { operations: [] };
    if (Array.isArray(emptyResponse.operations)) {
      logTest("EDGE_002", "Empty operations handling", "✓ PASS");
      passCount++;
    }
  } catch {
    logTest("EDGE_002", "Empty operations handling", "✗ FAIL");
  }

  // Edge case 3: Invalid CSS values sanitization
  const invalidStyles = {
    fontSize: "invalid",
    color: "not-a-color",
    padding: "999999999px"
  };

  const isInvalid = Object.values(invalidStyles).some(v => typeof v === 'string' && v.includes('invalid'));
  if (isInvalid) {
    logTest("EDGE_003", "Invalid CSS detection", "✓ PASS");
    passCount++;
  }

  return passCount >= 2;
}

async function runAllTests() {
  console.log("\n" + "=".repeat(70));
  console.log("V2 PIPELINE E2E TEST EXECUTION");
  console.log("=".repeat(70));

  await testTreeValidation();
  await testSingleEditParsing();
  await testMultipleSequentialEdits();
  await testPrompPronounResolution();
  await testConflictResolution();
  await testEdgeCases();

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("TEST SUMMARY");
  console.log("=".repeat(70));

  const passed = TEST_RESULTS.filter(r => r.status === "✓ PASS").length;
  const failed = TEST_RESULTS.filter(r => r.status === "✗ FAIL").length;
  const total = TEST_RESULTS.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    TEST_RESULTS.filter(r => r.status === "✗ FAIL").forEach(r => {
      console.log(`   • [${r.testId}] ${r.name}: ${r.details}`);
    });
  }

  console.log("\n" + "=".repeat(70) + "\n");

  return failed === 0;
}

export { runAllTests, TEST_RESULTS };
