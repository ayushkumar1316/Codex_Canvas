import { executeStrategy } from "../strategy";
import { getCapabilityForStrategy } from "../strategy/strategyRules";
import { resolveCapability } from "../resolver";
import { getHealth, recordSuccess, recordFailure } from "../resolver/healthEngine";
import { executeWithResolution, executeWithFallback } from "../providerManager";
import { runRepairPipeline } from "../repair/repairPipeline";
import { validateResponse } from "../validator";
import { ORCHESTRATOR_STATUS, ORCHESTRATOR_PHASE } from "./orchestratorTypes";
import { validateExecutionInput, validateExecutionResult } from "./orchestratorValidator";
import { buildPhaseDiagnostics, buildExecutionSummary } from "./orchestratorDiagnostics";

function collectPhases() {
  return [];
}

function addPhase(phases, phase, data, startTime) {
  phases.push(buildPhaseDiagnostics(phase, data, startTime));
}

function resolveStrategyPhase(input, phases) {
  const start = performance.now();
  const strategyResult = executeStrategy(
    {
      intent: input.intent || "generate",
      confidence: input.intentConfidence || 0.9,
      operations: input.operations || 0,
      requiresVision: !!input.referenceImage,
      estimatedComplexity: input.complexity || "medium",
    },
    {
      providerSelection: input.aiProvider || "auto",
      canvasState: input.canvasState || "EMPTY",
      hasReferenceImage: !!input.referenceImage,
      hasVoiceInput: !!input.hasVoice,
    }
  );
  addPhase(phases, ORCHESTRATOR_PHASE.STRATEGY, strategyResult, start);
  return strategyResult;
}

function resolveCapabilityPhase(strategyResult, input, phases) {
  const start = performance.now();
  const capabilityId = getCapabilityForStrategy(strategyResult.strategy);
  const constraints = {
    requireVision: !!input.referenceImage,
    requireStructuredOutput: true,
    requireFreeModel: false,
    minimumCoding: true,
    minimumReasoning: strategyResult.complexity === "complex",
  };
  const capabilityResult = resolveCapability({ capability: capabilityId, ...constraints });
  addPhase(phases, ORCHESTRATOR_PHASE.CAPABILITY, { capabilityId, ...capabilityResult }, start);
  return { capabilityId, capabilityResult };
}

function resolveHealthPhase(resolution, phases) {
  const start = performance.now();
  const modelId = resolution?.primary;
  const healthData = modelId ? getHealth(modelId) : { status: "unknown", healthScore: 70 };
  addPhase(phases, ORCHESTRATOR_PHASE.RESOLUTION, { modelId, health: healthData }, start);
  return healthData;
}

async function executeProviderPhase(resolution, capabilityResult, input, constitution, systemPrompt, context, effectivePrompt, schema, phases) {
  const start = performance.now();
  let fallbackResult;
  const resolved = capabilityResult?.resolution?.resolution;

  if (resolved?.primary) {
    fallbackResult = await executeWithResolution(resolved, {
      systemPrompt: constitution || systemPrompt,
      context,
      userPrompt: effectivePrompt,
      schema,
    });
  } else {
    fallbackResult = await executeWithFallback({
      systemPrompt: constitution || systemPrompt,
      context,
      userPrompt: effectivePrompt,
      schema,
    });
  }

  const modelId = resolved?.primary;
  if (modelId) {
    if (fallbackResult.success) {
      recordSuccess(modelId, fallbackResult.responseTime || 0);
    } else {
      recordFailure(modelId);
    }
  }

  addPhase(phases, ORCHESTRATOR_PHASE.PROVIDER, {
    provider: fallbackResult.provider,
    success: fallbackResult.success,
    error: fallbackResult.error,
  }, start);
  return fallbackResult;
}

function runRepairPhase(fallbackResult, providerName, repairContext, phases) {
  const start = performance.now();
  if (!fallbackResult.success) {
    addPhase(phases, ORCHESTRATOR_PHASE.REPAIR, { skipped: true, reason: "provider_failed" }, start);
    return null;
  }
  const pipelineResult = runRepairPipeline(fallbackResult.response, providerName, repairContext);
  addPhase(phases, ORCHESTRATOR_PHASE.REPAIR, {
    repaired: pipelineResult.repaired,
    valid: pipelineResult.valid,
    repairLevel: pipelineResult.repairLevel,
  }, start);
  return pipelineResult;
}

function runValidationPhase(pipelineResult, repairContext, phases) {
  const start = performance.now();
  if (!pipelineResult) {
    addPhase(phases, ORCHESTRATOR_PHASE.VALIDATION, { skipped: true, reason: "no_repair_result" }, start);
    return null;
  }
  const validation = validateResponse(pipelineResult.patchedResponse, {
    componentTree: repairContext.componentTree,
    registry: repairContext.registry,
    strategy: repairContext.strategy,
  });
  addPhase(phases, ORCHESTRATOR_PHASE.VALIDATION, {
    success: validation.success,
    errorCount: validation.errors?.length || 0,
  }, start);
  return validation;
}

export async function orchestrate(input, modules = {}) {
  const totalStart = performance.now();
  const phases = collectPhases();

  const inputValidation = validateExecutionInput(input);
  if (!inputValidation.valid) {
    return {
      status: ORCHESTRATOR_STATUS.FAILED,
      error: { type: "invalid_input", details: inputValidation.errors },
      executionTime: performance.now() - totalStart,
      completedPhases: [],
      diagnostics: {},
    };
  }

  const {
    systemPrompt = "",
    constitution = null,
    componentTree = {},
    registry = [],
    strategy: strategyOverride = null,
  } = modules;

  let strategyResult;
  try {
    strategyResult = resolveStrategyPhase(input, phases);
  } catch (err) {
    return buildFailureResult(err, ORCHESTRATOR_PHASE.STRATEGY, phases, totalStart);
  }

  let capabilityResult;
  try {
    ({ capabilityResult } = resolveCapabilityPhase(strategyResult, input, phases));
  } catch (err) {
    return buildFailureResult(err, ORCHESTRATOR_PHASE.CAPABILITY, phases, totalStart);
  }

  const resolved = capabilityResult?.resolution?.resolution;
  let healthData;
  try {
    healthData = resolveHealthPhase(resolved, phases);
  } catch {
    healthData = { status: "unknown", healthScore: 70 };
  }

  let fallbackResult;
  try {
    fallbackResult = await executeProviderPhase(
      resolved, capabilityResult, input, constitution, systemPrompt,
      {}, input.optimizedPrompt || input.prompt, modules.schema, phases
    );
  } catch (err) {
    return buildFailureResult(err, ORCHESTRATOR_PHASE.PROVIDER, phases, totalStart);
  }

  const repairContext = {
    componentTree,
    registry,
    strategy: strategyOverride || strategyResult.strategy,
  };

  let pipelineResult = null;
  try {
    pipelineResult = runRepairPhase(fallbackResult, fallbackResult.provider, repairContext, phases);
  } catch (err) {
    addPhase(phases, ORCHESTRATOR_PHASE.REPAIR, { success: false, error: err.message }, performance.now());
  }

  let validation = null;
  try {
    validation = runValidationPhase(pipelineResult, repairContext, phases);
  } catch (err) {
    addPhase(phases, ORCHESTRATOR_PHASE.VALIDATION, { success: false, error: err.message }, performance.now());
  }

  const telemetryRef = null;

  const executionTime = performance.now() - totalStart;
  const success = fallbackResult.success && pipelineResult?.valid !== false;

  const result = buildExecutionSummary({
    strategyResult,
    capabilityResult,
    resolved,
    healthData,
    fallbackResult,
    pipelineResult,
    validation,
    executionTime,
    telemetryRef,
  });

  const output = {
    status: success ? ORCHESTRATOR_STATUS.SUCCESS : ORCHESTRATOR_STATUS.PARTIAL,
    ...result,
    completedPhases: phases.map((p) => p.phase),
    phaseTimings: phases.map((p) => ({ phase: p.phase, duration: p.duration, success: p.success })),
    componentTree: pipelineResult?.patchedResponse?.componentTree || fallbackResult.response?.componentTree || null,
    rawResponse: fallbackResult.response || null,
  };

  const outputValidation = validateExecutionResult(output);
  if (!outputValidation.valid) {
    output.validationErrors = outputValidation.errors;
  }

  return output;
}

function buildFailureResult(err, phase, phases, totalStart) {
  addPhase(phases, phase, { success: false, error: err.message }, performance.now());
  return {
    status: ORCHESTRATOR_STATUS.FAILED,
    error: { type: "execution_error", phase, message: err.message },
    executionTime: performance.now() - totalStart,
    completedPhases: phases.map((p) => p.phase),
    phaseTimings: phases.map((p) => ({ phase: p.phase, duration: p.duration, success: p.success })),
    diagnostics: {},
  };
}

export default { orchestrate };
