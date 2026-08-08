import { CAPABILITY, CAPABILITY_WEIGHTS } from "./capabilityTypes";

export const PROVIDER_CAPABILITIES = {
  gemini: [
    CAPABILITY.VISION,
    CAPABILITY.IMAGE_UNDERSTANDING,
    CAPABILITY.GENERATION,
    CAPABILITY.EDITING,
    CAPABILITY.JSON_MODE,
    CAPABILITY.LONG_CONTEXT,
    CAPABILITY.REASONING,
    CAPABILITY.STREAMING,
  ],
  groq: [
    CAPABILITY.GENERATION,
    CAPABILITY.EDITING,
    CAPABILITY.JSON_MODE,
    CAPABILITY.REASONING,
    CAPABILITY.STREAMING,
  ],
  openrouter: [
    CAPABILITY.VISION,
    CAPABILITY.IMAGE_UNDERSTANDING,
    CAPABILITY.GENERATION,
    CAPABILITY.EDITING,
    CAPABILITY.JSON_MODE,
    CAPABILITY.LONG_CONTEXT,
    CAPABILITY.REASONING,
    CAPABILITY.STREAMING,
    CAPABILITY.FUNCTION_CALLING,
  ],
  openai: [
    CAPABILITY.VISION,
    CAPABILITY.IMAGE_UNDERSTANDING,
    CAPABILITY.GENERATION,
    CAPABILITY.EDITING,
    CAPABILITY.JSON_MODE,
    CAPABILITY.LONG_CONTEXT,
    CAPABILITY.REASONING,
    CAPABILITY.STREAMING,
    CAPABILITY.FUNCTION_CALLING,
  ],
};

export const PROVIDER_PERFORMANCE = {
  gemini: { speed: 3, quality: 4, reliability: 4 },
  groq: { speed: 5, quality: 3, reliability: 4 },
  openrouter: { speed: 3, quality: 4, reliability: 3 },
  openai: { speed: 3, quality: 5, reliability: 4 },
};

export function getProviderCapabilities(providerName) {
  return PROVIDER_CAPABILITIES[providerName] || [];
}

export function hasCapability(providerName, capability) {
  const caps = PROVIDER_CAPABILITIES[providerName] || [];
  return caps.includes(capability);
}

export function getMissingCapabilities(providerName, requiredCapabilities) {
  const providerCaps = PROVIDER_CAPABILITIES[providerName] || [];
  return requiredCapabilities.filter((cap) => !providerCaps.includes(cap));
}

export function calculateCapabilityScore(providerName, requiredCapabilities) {
  const providerCaps = PROVIDER_CAPABILITIES[providerName] || [];
  let score = 0;
  let maxScore = 0;

  for (const cap of requiredCapabilities) {
    const weight = CAPABILITY_WEIGHTS[cap] || 1;
    maxScore += weight;
    if (providerCaps.includes(cap)) {
      score += weight;
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export function calculateOverallScore(providerName, requiredCapabilities) {
  const capScore = calculateCapabilityScore(providerName, requiredCapabilities);
  const perf = PROVIDER_PERFORMANCE[providerName] || { speed: 3, quality: 3, reliability: 3 };
  const perfScore = Math.round(((perf.speed + perf.quality + perf.reliability) / 15) * 100);
  return Math.round((capScore * 0.7 + perfScore * 0.3));
}

export function rankProviders(requiredCapabilities) {
  const providers = Object.keys(PROVIDER_CAPABILITIES);
  const ranked = providers.map((name) => ({
    provider: name,
    score: calculateOverallScore(name, requiredCapabilities),
    missingCapabilities: getMissingCapabilities(name, requiredCapabilities),
    capabilities: PROVIDER_CAPABILITIES[name],
  }));
  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}
