export function buildPhaseDiagnostics(phase, data, startTime) {
  return {
    phase,
    success: data.success !== false,
    duration: performance.now() - startTime,
    data,
  };
}

export function explainStrategySelection(strategyResult) {
  if (!strategyResult) return "No strategy resolved";
  const parts = [];
  parts.push(`Selected strategy: ${strategyResult.strategy}`);
  parts.push(`Complexity: ${strategyResult.complexity}`);
  parts.push(`Execution type: ${strategyResult.executionType}`);
  if (strategyResult.diagnostics?.reason) {
    parts.push(`Reason: ${strategyResult.diagnostics.reason}`);
  }
  return parts.join(". ");
}

export function explainCapabilitySelection(capabilityId, resolution) {
  if (!resolution) return `No resolution for capability "${capabilityId}"`;
  const parts = [];
  parts.push(`Capability: ${capabilityId}`);
  parts.push(`Primary model: ${resolution.primary || "none"}`);
  parts.push(`Fallbacks: ${resolution.fallbacks?.length || 0}`);
  parts.push(`Confidence: ${resolution.confidence}`);
  if (resolution.reason) {
    parts.push(`Reason: ${resolution.reason}`);
  }
  return parts.join(". ");
}

export function explainModelSelection(resolution, healthData) {
  if (!resolution?.primary) return "No model selected";
  const parts = [];
  parts.push(`Selected model: ${resolution.primary}`);
  if (healthData) {
    parts.push(`Health score: ${healthData.healthScore}`);
    parts.push(`Health status: ${healthData.status}`);
  }
  return parts.join(". ");
}

export function explainFallbackusage(fallbackResult, capabilityResult) {
  if (!fallbackResult) return "No execution performed";
  const parts = [];
  const resolved = capabilityResult?.resolution?.resolution;
  const intendedPrimary = resolved?.primary;
  const actualProvider = fallbackResult.provider;

  if (intendedPrimary && actualProvider) {
    const intendedProvider = intendedPrimary.split("/")[0];
    if (intendedProvider !== actualProvider) {
      parts.push(`Fallback used: intended ${intendedPrimary} but executed via ${actualProvider}`);
    } else {
      parts.push(`Primary model executed: ${intendedPrimary}`);
    }
  }

  if (fallbackResult.success) {
    parts.push("Execution succeeded");
  } else {
    parts.push(`Execution failed: ${fallbackResult.error?.message || "unknown"}`);
  }

  return parts.join(". ");
}

export function explainRepairOutcome(pipelineResult) {
  if (!pipelineResult) return "No repair performed";
  const parts = [];
  if (pipelineResult.repaired) {
    parts.push(`Repair applied: ${pipelineResult.repairLevel} level, ${pipelineResult.repairedFields?.length || 0} fields`);
  } else {
    parts.push("No repair needed");
  }
  parts.push(`Validation: ${pipelineResult.valid ? "passed" : "failed"}`);
  return parts.join(". ");
}

export function buildExecutionSummary(context) {
  const {
    strategyResult,
    capabilityResult,
    healthData,
    fallbackResult,
    pipelineResult,
    validation,
    executionTime,
    telemetryRef,
  } = context;

  const resolved = capabilityResult?.resolution?.resolution;

  return {
    strategy: strategyResult?.strategy || null,
    capability: resolved?.capability || null,
    selectedModel: resolved?.primary || null,
    selectedProvider: fallbackResult?.provider || null,
    healthScore: healthData?.healthScore ?? null,
    fallbackUsed: determineIfFallbackUsed(resolved, fallbackResult),
    repairApplied: pipelineResult?.repaired || false,
    validationPassed: validation?.success ?? null,
    executionTime,
    telemetryReference: telemetryRef || null,
    diagnostics: {
      strategy: explainStrategySelection(strategyResult),
      capability: explainCapabilitySelection(resolved?.capability, resolved),
      model: explainModelSelection(resolved, healthData),
      fallback: explainFallbackusage(fallbackResult, capabilityResult),
      repair: explainRepairOutcome(pipelineResult),
    },
  };
}

function determineIfFallbackUsed(resolved, fallbackResult) {
  if (!resolved?.primary || !fallbackResult?.provider) return false;
  const intendedProvider = resolved.primary.split("/")[0];
  return intendedProvider !== fallbackResult.provider;
}

export default {
  buildPhaseDiagnostics,
  explainStrategySelection,
  explainCapabilitySelection,
  explainModelSelection,
  explainFallbackusage,
  explainRepairOutcome,
  buildExecutionSummary,
};
