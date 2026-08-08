import { CANVAS_STATE, RECOMMENDED_ACTION, COMPLETENESS_THRESHOLDS, MIN_COMPONENTS_FOR_PARTIAL, MIN_SECTIONS_FOR_COMPLETE, REQUIRED_SECTIONS_FOR_COMPLETE } from "./canvasRules";

function resolveCanvasState(analysis) {
  const { componentCount, completenessScore, uniqueSectionTypes, hasWebsiteStructure } = analysis;

  if (componentCount <= 1 && uniqueSectionTypes.length === 0) {
    return CANVAS_STATE.EMPTY;
  }

  if (completenessScore >= COMPLETENESS_THRESHOLDS[CANVAS_STATE.COMPLETE] && hasWebsiteStructure && uniqueSectionTypes.length >= MIN_SECTIONS_FOR_COMPLETE) {
    return CANVAS_STATE.COMPLETE;
  }

  if (componentCount > MIN_COMPONENTS_FOR_PARTIAL || uniqueSectionTypes.length > 0) {
    return CANVAS_STATE.PARTIAL;
  }

  return CANVAS_STATE.UNKNOWN;
}

function resolveRecommendedAction(canvasState, intent, completenessScore) {
  if (canvasState === CANVAS_STATE.EMPTY) {
    return RECOMMENDED_ACTION.GENERATE_NEW;
  }

  if (canvasState === CANVAS_STATE.COMPLETE && intent === "generate") {
    return RECOMMENDED_ACTION.REPLACE_EXISTING;
  }

  if (canvasState === CANVAS_STATE.COMPLETE) {
    return RECOMMENDED_ACTION.EDIT_EXISTING;
  }

  if (canvasState === CANVAS_STATE.PARTIAL) {
    return RECOMMENDED_ACTION.CONTINUE_BUILDING;
  }

  if (completenessScore < 10 && intent === "generate") {
    return RECOMMENDED_ACTION.GENERATE_NEW;
  }

  return RECOMMENDED_ACTION.ASK_USER;
}

function resolveRequiresConfirmation(canvasState, recommendedAction, intent) {
  if (recommendedAction === RECOMMENDED_ACTION.REPLACE_EXISTING) return true;
  if (canvasState === CANVAS_STATE.COMPLETE && intent === "generate") return true;
  if (recommendedAction === RECOMMENDED_ACTION.ASK_USER) return true;
  return false;
}

function buildMissingSections(analysis) {
  const present = new Set(analysis.uniqueSectionTypes);
  const missing = [];
  for (const section of REQUIRED_SECTIONS_FOR_COMPLETE) {
    if (!present.has(section)) {
      missing.push(section);
    }
  }
  return missing;
}

export function resolveCanvasFromAnalysis(analysis, intent) {
  const canvasState = resolveCanvasState(analysis);
  const recommendedAction = resolveRecommendedAction(canvasState, intent, analysis.completenessScore);
  const requiresConfirmation = resolveRequiresConfirmation(canvasState, recommendedAction, intent);
  const missingSections = buildMissingSections(analysis);

  return {
    canvasState,
    completenessScore: analysis.completenessScore,
    componentCount: analysis.componentCount,
    sectionTypes: analysis.uniqueSectionTypes,
    treeDepth: analysis.treeDepth,
    hasWebsiteStructure: analysis.hasWebsiteStructure,
    recommendedAction,
    requiresConfirmation,
    missingSections,
  };
}

export function resolveEmptyCanvas() {
  return {
    canvasState: CANVAS_STATE.EMPTY,
    completenessScore: 0,
    componentCount: 0,
    sectionTypes: [],
    treeDepth: 0,
    hasWebsiteStructure: false,
    recommendedAction: RECOMMENDED_ACTION.GENERATE_NEW,
    requiresConfirmation: false,
    missingSections: [...REQUIRED_SECTIONS_FOR_COMPLETE],
  };
}
