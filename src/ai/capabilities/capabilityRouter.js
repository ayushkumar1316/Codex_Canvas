import { resolveCapability } from "./capabilityResolver";
import { CAPABILITY_DESCRIPTIONS } from "./capabilityTypes";

function buildDiagnostics(result, resolveTime) {
  return {
    capabilityScore: result.capabilityScore,
    requiredCapability: result.requiredCapability,
    missingCapabilities: result.missingCapabilities,
    selectedProvider: result.selectedProvider,
    recommendedProvider: result.recommendedProvider,
    providerMode: result.providerMode,
    requiresProviderSwitch: result.requiresProviderSwitch,
    reason: result.reason,
    confidence: result.confidence,
    resolveTime: `${resolveTime.toFixed(2)}ms`,
  };
}

export function routeCapability(options = {}) {
  const start = performance.now();

  const result = resolveCapability(options);

  const resolveTime = performance.now() - start;

  const diagnostics = buildDiagnostics(result, resolveTime);

  return {
    ...result,
    diagnostics,
  };
}

export function getCapabilityInfo(capability) {
  return CAPABILITY_DESCRIPTIONS[capability] || null;
}

export function getRequiredCapabilitiesForStrategy(strategy) {
  const map = {
    FULL_GENERATION: ["generation", "json_mode"],
    EDIT_EXISTING: ["editing", "json_mode"],
    INSERT_SECTION: ["editing", "json_mode"],
    DELETE_COMPONENT: ["editing", "json_mode"],
    STYLE_UPDATE: ["editing", "json_mode"],
    LAYOUT_UPDATE: ["editing", "json_mode"],
    CONTENT_UPDATE: ["editing", "json_mode"],
    IMAGE_GENERATION: ["vision", "image_understanding"],
    VOICE_COMMAND: ["voice"],
  };
  return map[strategy] || ["generation"];
}
