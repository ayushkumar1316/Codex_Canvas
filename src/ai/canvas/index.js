import { analyzeCanvasIntelligence } from "./canvasIntelligence";
import { analyzeCanvas, analyzeRootChildren } from "./canvasAnalyzer";
import { resolveCanvasFromAnalysis, resolveEmptyCanvas } from "./canvasStateResolver";
import { CANVAS_STATE, RECOMMENDED_ACTION } from "./canvasRules";

export function analyzeCanvasPublic(tree, intent, canvasState) {
  return analyzeCanvasIntelligence(tree, intent, canvasState);
}

export { analyzeCanvasIntelligence, analyzeCanvas, analyzeRootChildren };
export { resolveCanvasFromAnalysis, resolveEmptyCanvas };
export { CANVAS_STATE, RECOMMENDED_ACTION };
