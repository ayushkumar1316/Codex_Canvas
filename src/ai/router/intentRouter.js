import { routeIntent } from "./routingRules";

// Pronoun patterns for detecting references to previously targeted components
const PRONOUN_PATTERNS = {
  singular: ["it", "that", "this", "the button", "the card", "the text", "the container"],
  plural: ["them", "those", "these", "they"],
  possessive: ["its", "their"],
};

/**
 * Detects if a prompt uses pronouns/references to previously targeted components
 * Returns the pronoun type if found, null otherwise
 */
export function detectPronounReference(prompt) {
  if (!prompt) return null;

  const lowerPrompt = prompt.toLowerCase();

  for (const pronoun of PRONOUN_PATTERNS.singular) {
    if (lowerPrompt.includes(pronoun)) {
      return { type: "singular", pronoun, isReference: true };
    }
  }

  for (const pronoun of PRONOUN_PATTERNS.plural) {
    if (lowerPrompt.includes(pronoun)) {
      return { type: "plural", pronoun, isReference: true };
    }
  }

  for (const pronoun of PRONOUN_PATTERNS.possessive) {
    if (lowerPrompt.includes(pronoun)) {
      return { type: "possessive", pronoun, isReference: true };
    }
  }

  return null;
}

/**
 * Resolves a pronoun reference to an actual component ID
 * using the lastTargetedNodeId from chat context
 */
export function resolvePronounToNode(pronoun, lastTargetedNodeId) {
  if (!lastTargetedNodeId || !pronoun) {
    return null;
  }

  return {
    resolvedNodeId: lastTargetedNodeId,
    pronoun: pronoun.pronoun,
    confidence: "high",
    message: `Resolved "${pronoun.pronoun}" to last targeted component (${lastTargetedNodeId})`,
  };
}

export function createIntentRoute(optimizedResult, options = {}) {
  const { optimizedPrompt, metadata: optimizerMeta } = optimizedResult;

  // Detect pronoun references in the prompt
  const pronounRef = detectPronounReference(optimizedPrompt);

  const routingOptions = {
    hasImage: options.hasImage || optimizerMeta?.hasImage || false,
    hasVoice: options.hasVoice || optimizerMeta?.hasVoice || false,
    hasSelectedComponent: !!options.selectedComponentId,
    source: options.hasVoice ? "voice" : "text",
    pronounReference: pronounRef,
    lastTargetedNodeId: options.lastTargetedNodeId || null,
  };

  const route = routeIntent(optimizedPrompt, routingOptions);

  // Attempt to resolve pronoun to actual component if present
  let resolvedNodeId = options.selectedComponentId;
  if (pronounRef && options.lastTargetedNodeId && !options.selectedComponentId) {
    const resolution = resolvePronounToNode(pronounRef, options.lastTargetedNodeId);
    if (resolution) {
      resolvedNodeId = resolution.resolvedNodeId;
    }
  }

  return {
    ...route,
    promptType: optimizedResult.promptType,
    optimizerConfidence: optimizedResult.confidence,
    wordCount: optimizerMeta?.wordCount || 0,
    pronounReference: pronounRef,
    resolvedNodeId,
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
      pronounReference: route.pronounReference,
      resolvedNodeId: route.resolvedNodeId,
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
    pronounReference: route.pronounReference?.pronoun || null,
  };
}

export { routeIntent, getIntentScores } from "./routingRules";
export { INTENT_PATTERNS, INTENT_PRIORITY, OPERATION_MAP, FUTURE_INTENTS } from "./intentPatterns";
