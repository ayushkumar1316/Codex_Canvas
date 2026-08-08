import { analyzeCanvas, analyzeRootChildren } from "./canvasAnalyzer";
import { resolveCanvasFromAnalysis, resolveEmptyCanvas } from "./canvasStateResolver";
import { CANVAS_STATE, RECOMMENDED_ACTION } from "./canvasRules";

function buildDiagnostics(result, analysis, resolveTime) {
  return {
    canvasState: result.canvasState,
    completenessScore: result.completenessScore,
    componentCount: result.componentCount,
    detectedSections: result.sectionTypes,
    treeDepth: result.treeDepth,
    hasWebsiteStructure: result.hasWebsiteStructure,
    recommendedAction: result.recommendedAction,
    requiresConfirmation: result.requiresConfirmation,
    missingSections: result.missingSections,
    resolveTime: `${resolveTime.toFixed(2)}ms`,
  };
}

function buildReason(result) {
  const parts = [];

  if (result.canvasState === CANVAS_STATE.EMPTY) {
    parts.push("Canvas is empty with no visible content");
  } else if (result.canvasState === CANVAS_STATE.PARTIAL) {
    parts.push(`Canvas has ${result.componentCount} components with ${result.sectionTypes.length} section type(s)`);
  } else if (result.canvasState === CANVAS_STATE.COMPLETE) {
    parts.push(`Canvas is complete with score ${result.completenessScore}%`);
  }

  if (result.recommendedAction === RECOMMENDED_ACTION.REPLACE_EXISTING) {
    parts.push("User requested generation on complete canvas — confirmation required");
  } else if (result.recommendedAction === RECOMMENDED_ACTION.CONTINUE_BUILDING) {
    parts.push("Partial canvas detected — continue building recommended");
  } else if (result.recommendedAction === RECOMMENDED_ACTION.EDIT_EXISTING) {
    parts.push("Complete canvas detected — edit mode recommended");
  } else if (result.recommendedAction === RECOMMENDED_ACTION.ASK_USER) {
    parts.push("Ambiguous state — user input required");
  }

  return parts.join(". ") || "Canvas analyzed successfully";
}

export function analyzeCanvasIntelligence(tree, intent, canvasStateProp) {
  const start = performance.now();

  let result;
  let analysis;

  if (canvasStateProp === "EMPTY" || (!tree || (tree.children && tree.children.length === 0))) {
    result = resolveEmptyCanvas();
    analysis = { componentCount: 0, sectionTypes: [], uniqueSectionTypes: [], componentTypes: {}, treeDepth: 0, completenessScore: 0, hasWebsiteStructure: false, visibleSections: 0 };
  } else {
    analysis = analyzeCanvas(tree);
    result = resolveCanvasFromAnalysis(analysis, intent);
  }

  const resolveTime = performance.now() - start;
  const diagnostics = buildDiagnostics(result, analysis, resolveTime);
  const reason = buildReason(result);
  const rootChildren = analyzeRootChildren(tree);

  return {
    ...result,
    diagnostics,
    reason,
    rootChildren,
    analysis: {
      componentTypes: analysis.componentTypes || {},
      visibleSections: analysis.visibleSections || 0,
    },
  };
}
