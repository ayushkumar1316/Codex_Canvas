import { STRATEGY, CAPABILITY, COMPLEXITY, REQUIRED_CAPABILITY } from "./strategyTypes";

const PRIORITY_PROVIDERS = ["gemini", "groq", "openrouter", "openai"];

const PROVIDER_CAPABILITIES = {
  gemini: [CAPABILITY.VISION, CAPABILITY.FAST, CAPABILITY.JSON, CAPABILITY.MULTI_MODEL],
  groq: [CAPABILITY.FASTEST, CAPABILITY.JSON],
  openrouter: [CAPABILITY.VISION, CAPABILITY.PREMIUM, CAPABILITY.MULTI_MODEL],
  openai: [CAPABILITY.VISION, CAPABILITY.PREMIUM, CAPABILITY.JSON],
};

const COMPLEXITY_PROVIDER_PREFERENCE = {
  [COMPLEXITY.SIMPLE]: ["groq", "gemini", "openrouter", "openai"],
  [COMPLEXITY.MEDIUM]: ["gemini", "openrouter", "groq", "openai"],
  [COMPLEXITY.COMPLEX]: ["gemini", "openrouter", "openai", "groq"],
};

const STRATEGY_PROVIDER_PREFERENCE = {
  [STRATEGY.FULL_GENERATION]: ["gemini", "openrouter", "openai", "groq"],
  [STRATEGY.EDIT_EXISTING]: ["gemini", "groq", "openrouter", "openai"],
  [STRATEGY.INSERT_SECTION]: ["groq", "gemini", "openrouter", "openai"],
  [STRATEGY.DELETE_COMPONENT]: ["groq", "gemini", "openrouter", "openai"],
  [STRATEGY.STYLE_UPDATE]: ["groq", "gemini", "openrouter", "openai"],
  [STRATEGY.LAYOUT_UPDATE]: ["gemini", "groq", "openrouter", "openai"],
  [STRATEGY.CONTENT_UPDATE]: ["groq", "gemini", "openrouter", "openai"],
  [STRATEGY.IMAGE_GENERATION]: ["gemini", "openrouter", "openai"],
  [STRATEGY.VOICE_COMMAND]: ["gemini", "openrouter", "openai"],
};

const STRATEGY_TO_CAPABILITY = {
  [STRATEGY.FULL_GENERATION]: "website_generation",
  [STRATEGY.EDIT_EXISTING]: "ui_editing",
  [STRATEGY.INSERT_SECTION]: "component_generation",
  [STRATEGY.DELETE_COMPONENT]: "ui_editing",
  [STRATEGY.STYLE_UPDATE]: "style_editing",
  [STRATEGY.LAYOUT_UPDATE]: "layout_generation",
  [STRATEGY.CONTENT_UPDATE]: "content_editing",
  [STRATEGY.IMAGE_GENERATION]: "image_understanding",
  [STRATEGY.VOICE_COMMAND]: "intent_classification",
};

export function getRequiredCapability(strategy) {
  return REQUIRED_CAPABILITY[strategy] || null;
}

export function hasCapability(providerName, capability) {
  const caps = PROVIDER_CAPABILITIES[providerName] || [];
  return caps.includes(capability);
}

export function getProviderCapabilitiesForStrategy(providerName) {
  return PROVIDER_CAPABILITIES[providerName] || [];
}

export function checkCapabilityMatch(providerName, strategy) {
  const required = getRequiredCapability(strategy);
  if (!required) return { match: true, missing: null };
  const match = hasCapability(providerName, required);
  return { match, missing: match ? null : required };
}

export function getRecommendedProvider(strategy, complexity, providerCapabilities, userSelection) {
  if (userSelection) {
    const capCheck = checkCapabilityMatch(userSelection, strategy);
    if (capCheck.match) return userSelection;
  }

  const strategyPrefs = STRATEGY_PROVIDER_PREFERENCE[strategy] || PRIORITY_PROVIDERS;
  const complexityPrefs = COMPLEXITY_PROVIDER_PREFERENCE[complexity] || PRIORITY_PROVIDERS;

  const scored = [];
  for (const provider of PRIORITY_PROVIDERS) {
    const stratIdx = strategyPrefs.indexOf(provider);
    const compIdx = complexityPrefs.indexOf(provider);
    const stratScore = stratIdx >= 0 ? PRIORITY_PROVIDERS.length - stratIdx : 0;
    const compScore = compIdx >= 0 ? PRIORITY_PROVIDERS.length - compIdx : 0;
    const capCheck = checkCapabilityMatch(provider, strategy);
    const capScore = capCheck.match ? 10 : -20;
    const totalScore = stratScore + compScore + capScore;
    scored.push({ provider, score: totalScore, hasCap: capCheck.match });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.provider || "gemini";
}

export function getStrategyDecisionFactors() {
  return {
    intent: "Type of operation (generate, edit, insert, delete, style, etc.)",
    canvasState: "Current state of the canvas (EMPTY, has components)",
    providerMode: "Auto or Manual provider selection",
    referenceImage: "Whether an image is attached",
    voiceInput: "Whether voice input is used",
    estimatedComplexity: "Simple, medium, or complex task",
    providerCapabilities: "What the selected provider can do",
    userSelection: "Manual provider override if set",
  };
}

export function getCapabilityForStrategy(strategy) {
  return STRATEGY_TO_CAPABILITY[strategy] || "website_generation";
}
