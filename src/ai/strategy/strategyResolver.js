import { STRATEGY, EXECUTION_TYPE, COMPLEXITY, PROVIDER_MODE, INTENT_TO_STRATEGY, STRATEGY_COMPLEXITY, STRATEGY_EXECUTION, STRATEGY_STEPS } from "./strategyTypes";
import { checkCapabilityMatch, getRecommendedProvider } from "./strategyRules";

function resolveStrategyFromIntent(intentMetadata) {
  const intent = intentMetadata?.intent || "generate";
  return INTENT_TO_STRATEGY[intent] || STRATEGY.FULL_GENERATION;
}

function resolveComplexity(strategy, intentMetadata) {
  const base = STRATEGY_COMPLEXITY[strategy] || COMPLEXITY.MEDIUM;
  const intentComplexity = intentMetadata?.estimatedComplexity;
  if (intentComplexity === "complex") return COMPLEXITY.COMPLEX;
  if (intentComplexity === "simple") return COMPLEXITY.SIMPLE;
  return base;
}

function resolveExecutionType(complexity, strategy) {
  if (complexity === COMPLEXITY.COMPLEX) return EXECUTION_TYPE.HEAVY;
  if (complexity === COMPLEXITY.SIMPLE) return EXECUTION_TYPE.FAST;
  return STRATEGY_EXECUTION[strategy] || EXECUTION_TYPE.NORMAL;
}

function resolveProviderMode(providerSelection) {
  if (providerSelection && providerSelection !== "auto") return PROVIDER_MODE.MANUAL;
  return PROVIDER_MODE.AUTO;
}

function resolveNeedsConfirmation(strategy, canvasState) {
  if (strategy === STRATEGY.FULL_GENERATION && canvasState !== "EMPTY") return true;
  if (strategy === STRATEGY.DELETE_COMPONENT) return true;
  return false;
}

function resolveRequiresProviderSwitch(providerName, strategy, providerMode) {
  if (providerMode === PROVIDER_MODE.MANUAL) return false;
  const { match } = checkCapabilityMatch(providerName, strategy);
  return !match;
}

function buildMetadata(intentMetadata, strategy, complexity, providerName, providerMode) {
  return {
    intent: intentMetadata?.intent || "unknown",
    confidence: intentMetadata?.confidence || 0,
    operations: intentMetadata?.operations || 0,
    requiresVision: intentMetadata?.requiresVision || false,
    requiresExistingCanvas: intentMetadata?.requiresExistingCanvas || false,
    hasReferenceImage: !!intentMetadata?.hasReferenceImage,
    hasVoiceInput: !!intentMetadata?.hasVoiceInput,
    selectedComponent: intentMetadata?.selectedComponent || null,
    canvasState: intentMetadata?.canvasState || "unknown",
    strategy,
    complexity,
    provider: providerName,
    providerMode,
  };
}

export function resolveStrategy(intentMetadata, options = {}) {
  const {
    providerSelection = "auto",
    providerCapabilities = {},
    canvasState = "EMPTY",
    hasReferenceImage = false,
    hasVoiceInput = false,
  } = options;

  const strategy = resolveStrategyFromIntent(intentMetadata);
  const complexity = resolveComplexity(strategy, intentMetadata);
  const executionType = resolveExecutionType(complexity, strategy);
  const providerMode = resolveProviderMode(providerSelection);
  const estimatedSteps = STRATEGY_STEPS[strategy] || 2;

  const userSelection = providerMode === PROVIDER_MODE.MANUAL ? providerSelection : null;
  const recommendedProvider = getRecommendedProvider(strategy, complexity, providerCapabilities, userSelection);

  const requiresProviderSwitch = resolveRequiresProviderSwitch(recommendedProvider, strategy, providerMode);
  const requiresConfirmation = resolveNeedsConfirmation(strategy, canvasState);

  const metadata = buildMetadata(
    { ...intentMetadata, hasReferenceImage, hasVoiceInput, canvasState },
    strategy,
    complexity,
    recommendedProvider,
    providerMode
  );

  return {
    strategy,
    providerMode,
    recommendedProvider,
    requiresProviderSwitch,
    requiresConfirmation,
    executionType,
    complexity,
    estimatedSteps,
    metadata,
  };
}
