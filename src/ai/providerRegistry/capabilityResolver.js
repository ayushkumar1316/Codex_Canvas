import {
  PROVIDERS,
  PROVIDER_LIST,
  getProvider,
  supportsCapability,
  getProviderByCapability,
} from "./providerRegistry";

const INTENT_CAPABILITY_MAP = {
  generate: ["generation", "reasoning"],
  edit: ["editing", "jsonMode"],
  insert: ["generation"],
  delete: ["editing"],
  style: ["generation", "editing"],
  layout: ["generation", "editing"],
  content: ["editing"],
  image: ["vision"],
  voice: ["voice"],
  unknown: [],
};

function scoreProviderForIntent(providerId, intent) {
  const provider = getProvider(providerId);
  if (!provider) return 0;

  const requiredCaps = INTENT_CAPABILITY_MAP[intent] || [];

  let score = 0;

  let capScore = 0;
  for (const cap of requiredCaps) {
    if (supportsCapability(providerId, cap)) {
      capScore += 1;
    }
  }
  if (requiredCaps.length > 0) {
    score += (capScore / requiredCaps.length) * 50;
  } else {
    score += 25;
  }

  const speedScores = { fastest: 30, fast: 24, medium: 16, slow: 8 };
  score += speedScores[provider.performance.speed] || 16;

  const contextSize = provider.performance.contextWindow;
  if (contextSize >= 500_000) score += 10;
  else if (contextSize >= 128_000) score += 7;
  else if (contextSize >= 32_000) score += 4;
  else score += 2;

  if (provider.performance.recommendedFor.includes(intent)) {
    score += 10;
  }

  return score;
}

export function getRecommendedProvider(intent, options = {}) {
  const excludeIds = options.exclude || [];
  const requireCaps = options.requireCapabilities || [];

  let bestProvider = null;
  let bestScore = -1;

  for (const id of PROVIDER_LIST) {
    if (excludeIds.includes(id)) continue;

    if (!options.skipCapabilityCheck) {
      const missing = requireCaps.filter((cap) => !supportsCapability(id, cap));
      if (missing.length > 0) continue;
    }

    const score = scoreProviderForIntent(id, intent);
    if (score > bestScore) {
      bestScore = score;
      bestProvider = id;
    }
  }

  return bestProvider;
}

export function getProviderScore(providerId, intent) {
  return scoreProviderForIntent(providerId, intent);
}

export function rankProvidersForIntent(intent, options = {}) {
  const excludeIds = options.exclude || [];

  const ranked = PROVIDER_LIST
    .filter((id) => !excludeIds.includes(id))
    .map((id) => ({
      id,
      score: scoreProviderForIntent(id, intent),
      provider: getProvider(id),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked;
}

export function getProvidersWithCapability(capability) {
  return getProviderByCapability(capability);
}

export function getBestProviderForCapability(capability) {
  const providers = getProviderByCapability(capability);
  if (providers.length === 0) return null;

  let best = providers[0];
  let bestLatency = PROVIDERS[best]?.performance.estimatedLatency || Infinity;

  for (const id of providers) {
    const latency = PROVIDERS[id]?.performance.estimatedLatency || Infinity;
    if (latency < bestLatency) {
      bestLatency = latency;
      best = id;
    }
  }

  return best;
}

export function meetsRequirements(providerId, requirements) {
  const provider = getProvider(providerId);
  if (!provider) return false;

  if (requirements.capabilities) {
    for (const cap of requirements.capabilities) {
      if (!supportsCapability(providerId, cap)) return false;
    }
  }

  if (requirements.minContextWindow) {
    if (provider.performance.contextWindow < requirements.minContextWindow) return false;
  }

  if (requirements.maxLatency) {
    if (provider.performance.estimatedLatency > requirements.maxLatency) return false;
  }

  return true;
}

export function getCompatibleProviders(requirements) {
  return PROVIDER_LIST.filter((id) => meetsRequirements(id, requirements));
}
