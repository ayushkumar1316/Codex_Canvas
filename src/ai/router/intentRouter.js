import { routeIntent } from "./routingRules";

export function createIntentRoute(optimizedResult, options = {}) {
  const { optimizedPrompt, metadata: optimizerMeta } = optimizedResult;

  const routingOptions = {
    hasImage: options.hasImage || optimizerMeta?.hasImage || false,
    hasVoice: options.hasVoice || optimizerMeta?.hasVoice || false,
    hasSelectedComponent: !!options.selectedComponentId,
    source: options.hasVoice ? "voice" : "text",
  };

  const route = routeIntent(optimizedPrompt, routingOptions);

  return {
    ...route,
    promptType: optimizedResult.promptType,
    optimizerConfidence: optimizedResult.confidence,
    wordCount: optimizerMeta?.wordCount || 0,
  };
}

export function buildContextWithIntent(baseContext, route) {
  return {
    ...baseContext,
    intent: {
      type: route.intent,
      confidence: route.confidence,
      operations: route.operations,
      source: route.source,
      requiresVision: route.requiresVision,
      requiresExistingCanvas: route.requiresExistingCanvas,
      estimatedComplexity: route.estimatedComplexity,
    },
  };
}

export function getRoutingSummary(route) {
  return {
    intent: route.intent,
    confidence: route.confidence,
    operations: route.operations.length,
    vision: route.requiresVision,
    canvas: route.requiresExistingCanvas,
    complexity: route.estimatedComplexity,
  };
}

export { routeIntent, getIntentScores } from "./routingRules";
export { INTENT_PATTERNS, INTENT_PRIORITY, OPERATION_MAP, FUTURE_INTENTS } from "./intentPatterns";
