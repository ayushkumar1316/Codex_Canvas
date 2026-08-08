import { orchestrate } from "./orchestrator";
import { validateExecutionInput, validateExecutionResult, validatePhasesCompleted } from "./orchestratorValidator";
import {
  buildPhaseDiagnostics,
  explainStrategySelection,
  explainCapabilitySelection,
  explainModelSelection,
  explainFallbackusage,
  explainRepairOutcome,
  buildExecutionSummary,
} from "./orchestratorDiagnostics";
import { ORCHESTRATOR_STATUS, ORCHESTRATOR_PHASE, ORCHESTRATOR_ERROR } from "./orchestratorTypes";

export { orchestrate };
export { validateExecutionInput, validateExecutionResult, validatePhasesCompleted };
export {
  buildPhaseDiagnostics,
  explainStrategySelection,
  explainCapabilitySelection,
  explainModelSelection,
  explainFallbackusage,
  explainRepairOutcome,
  buildExecutionSummary,
};
export { ORCHESTRATOR_STATUS, ORCHESTRATOR_PHASE, ORCHESTRATOR_ERROR };

export function orchestrateWithDefaults(input, overrides = {}) {
  return orchestrate(input, overrides);
}

export function explainResult(result) {
  if (!result) return "No result provided";
  const parts = [];
  parts.push(`Status: ${result.status}`);
  parts.push(`Strategy: ${result.strategy}`);
  parts.push(`Capability: ${result.capability}`);
  parts.push(`Model: ${result.selectedModel}`);
  parts.push(`Provider: ${result.selectedProvider}`);
  parts.push(`Health: ${result.healthScore}`);
  parts.push(`Fallback: ${result.fallbackUsed ? "yes" : "no"}`);
  parts.push(`Repair: ${result.repairApplied ? "yes" : "no"}`);
  parts.push(`Validation: ${result.validationPassed ? "passed" : "failed"}`);
  parts.push(`Time: ${result.executionTime?.toFixed(0)}ms`);
  return parts.join("\n");
}
