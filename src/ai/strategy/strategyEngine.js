import { resolveStrategy } from "./strategyResolver";
import { getRequiredCapability } from "./strategyRules";
import { STRATEGY, COMPLEXITY, EXECUTION_TYPE, PROVIDER_MODE } from "./strategyTypes";

function buildDiagnostics(result, resolveTime) {
  return {
    selectedStrategy: result.strategy,
    complexity: result.complexity,
    executionType: result.executionType,
    recommendedProvider: result.recommendedProvider,
    providerMode: result.providerMode,
    requiresProviderSwitch: result.requiresProviderSwitch,
    requiresConfirmation: result.requiresConfirmation,
    estimatedSteps: result.estimatedSteps,
    reason: buildReason(result),
    resolveTime: `${resolveTime.toFixed(2)}ms`,
  };
}

function buildReason(result) {
  const parts = [];

  if (result.metadata?.intent) {
    parts.push(`Intent "${result.metadata.intent}" maps to ${result.strategy}`);
  }

  if (result.complexity === COMPLEXITY.COMPLEX) {
    parts.push("Complex task requires heavy execution");
  } else if (result.complexity === COMPLEXITY.SIMPLE) {
    parts.push("Simple task enables fast execution");
  }

  if (result.providerMode === PROVIDER_MODE.MANUAL) {
    parts.push("Manual provider mode — respecting user selection");
  } else {
    parts.push(`Auto mode selected ${result.recommendedProvider} as optimal`);
  }

  if (result.requiresProviderSwitch) {
    const required = getRequiredCapability(result.strategy);
    parts.push(`Provider lacks required capability: ${required}`);
  }

  if (result.requiresConfirmation) {
    parts.push("Requires user confirmation before execution");
  }

  return parts.join(". ") || "Standard strategy resolution";
}

export function executeStrategy(intentMetadata, options = {}) {
  const start = performance.now();

  const result = resolveStrategy(intentMetadata, options);

  const resolveTime = performance.now() - start;

  const diagnostics = buildDiagnostics(result, resolveTime);

  return {
    ...result,
    diagnostics,
  };
}

export function getStrategyInfo(strategy) {
  const info = {
    [STRATEGY.FULL_GENERATION]: {
      name: "Full Generation",
      description: "Generate complete website from scratch",
      typicalSteps: 4,
      executionType: EXECUTION_TYPE.HEAVY,
    },
    [STRATEGY.EDIT_EXISTING]: {
      name: "Edit Existing",
      description: "Modify components on existing canvas",
      typicalSteps: 3,
      executionType: EXECUTION_TYPE.NORMAL,
    },
    [STRATEGY.INSERT_SECTION]: {
      name: "Insert Section",
      description: "Add new components to the page",
      typicalSteps: 2,
      executionType: EXECUTION_TYPE.NORMAL,
    },
    [STRATEGY.DELETE_COMPONENT]: {
      name: "Delete Component",
      description: "Remove components from the page",
      typicalSteps: 1,
      executionType: EXECUTION_TYPE.FAST,
    },
    [STRATEGY.STYLE_UPDATE]: {
      name: "Style Update",
      description: "Update visual styles only",
      typicalSteps: 1,
      executionType: EXECUTION_TYPE.FAST,
    },
    [STRATEGY.LAYOUT_UPDATE]: {
      name: "Layout Update",
      description: "Restructure page layout",
      typicalSteps: 2,
      executionType: EXECUTION_TYPE.NORMAL,
    },
    [STRATEGY.CONTENT_UPDATE]: {
      name: "Content Update",
      description: "Update text and content",
      typicalSteps: 1,
      executionType: EXECUTION_TYPE.FAST,
    },
    [STRATEGY.IMAGE_GENERATION]: {
      name: "Image Generation",
      description: "Generate or modify with image reference",
      typicalSteps: 3,
      executionType: EXECUTION_TYPE.HEAVY,
    },
    [STRATEGY.VOICE_COMMAND]: {
      name: "Voice Command",
      description: "Process voice input",
      typicalSteps: 2,
      executionType: EXECUTION_TYPE.NORMAL,
    },
  };
  return info[strategy] || null;
}
