import { CAPABILITY, CONFIDENCE, PROVIDER_MODE, STRATEGY_REQUIRED_CAPABILITIES, CONDITIONAL_CAPABILITIES } from "./capabilityTypes";
import { getMissingCapabilities, calculateOverallScore, rankProviders } from "./capabilityRules";

function getRequiredCapabilities(strategy, options = {}) {
  const base = STRATEGY_REQUIRED_CAPABILITIES[strategy] || [CAPABILITY.GENERATION];
  const conditional = [];

  if (options.hasReferenceImage) {
    conditional.push(...(CONDITIONAL_CAPABILITIES.hasReferenceImage || []));
  }
  if (options.hasVoiceInput) {
    conditional.push(...(CONDITIONAL_CAPABILITIES.hasVoiceInput || []));
  }
  if (options.hasLongContext) {
    conditional.push(...(CONDITIONAL_CAPABILITIES.hasLongContext || []));
  }

  return [...new Set([...base, ...conditional])];
}

function resolveConfidence(score, missingCount) {
  if (score >= 80 && missingCount === 0) return CONFIDENCE.HIGH;
  if (score >= 50) return CONFIDENCE.MEDIUM;
  return CONFIDENCE.LOW;
}

function resolveAutoMode(requiredCapabilities) {
  const ranked = rankProviders(requiredCapabilities);
  const best = ranked[0];

  return {
    providerMode: PROVIDER_MODE.AUTO,
    selectedProvider: best.provider,
    recommendedProvider: best.provider,
    requiresProviderSwitch: false,
    requiredCapability: null,
    capabilityScore: best.score,
    missingCapabilities: best.missingCapabilities,
    reason: `Auto selected ${best.provider} with capability score ${best.score}%`,
    confidence: resolveConfidence(best.score, best.missingCapabilities.length),
    rankings: ranked,
  };
}

function resolveManualMode(selectedProvider, requiredCapabilities) {
  const missing = getMissingCapabilities(selectedProvider, requiredCapabilities);
  const overallScore = calculateOverallScore(selectedProvider, requiredCapabilities);

  if (missing.length === 0) {
    return {
      providerMode: PROVIDER_MODE.MANUAL,
      selectedProvider,
      recommendedProvider: selectedProvider,
      requiresProviderSwitch: false,
      requiredCapability: null,
      capabilityScore: overallScore,
      missingCapabilities: [],
      reason: `${selectedProvider} has all required capabilities`,
      confidence: resolveConfidence(overallScore, 0),
    };
  }

  const ranked = rankProviders(requiredCapabilities);
  const bestWithCap = ranked.find((r) => r.missingCapabilities.length === 0);
  const recommended = bestWithCap?.provider || ranked[0]?.provider || selectedProvider;

  return {
    providerMode: PROVIDER_MODE.MANUAL,
    selectedProvider,
    recommendedProvider: recommended,
    requiresProviderSwitch: true,
    requiredCapability: missing[0],
    capabilityScore: overallScore,
    missingCapabilities: missing,
    reason: `${selectedProvider} is missing ${missing.join(", ")}. ${recommended} supports all required capabilities.`,
    confidence: resolveConfidence(overallScore, missing.length),
  };
}

export function resolveCapability(options = {}) {
  const {
    strategy = "FULL_GENERATION",
    providerSelection = "auto",
    hasReferenceImage = false,
    hasVoiceInput = false,
    hasLongContext = false,
  } = options;

  const requiredCapabilities = getRequiredCapabilities(strategy, {
    hasReferenceImage,
    hasVoiceInput,
    hasLongContext,
  });

  const isAuto = !providerSelection || providerSelection === "auto";

  if (isAuto) {
    return resolveAutoMode(requiredCapabilities);
  }

  return resolveManualMode(providerSelection, requiredCapabilities);
}
