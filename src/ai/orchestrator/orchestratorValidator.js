import { ORCHESTRATOR_STATUS, ORCHESTRATOR_PHASE } from "./orchestratorTypes";

const VALID_STATUSES = new Set(Object.values(ORCHESTRATOR_STATUS));
const VALID_PHASES = new Set(Object.values(ORCHESTRATOR_PHASE));

export function validateExecutionInput(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: [{ field: "input", message: "Input must be an object" }] };
  }

  if (!input.prompt || typeof input.prompt !== "string" || input.prompt.trim() === "") {
    errors.push({ field: "prompt", message: "prompt is required and must be a non-empty string" });
  }

  return { valid: errors.length === 0, errors };
}

export function validateExecutionResult(result) {
  const errors = [];

  if (!result || typeof result !== "object") {
    return { valid: false, errors: [{ field: "result", message: "Result must be an object" }] };
  }

  if (!VALID_STATUSES.has(result.status)) {
    errors.push({ field: "status", message: `Invalid status: "${result.status}"` });
  }

  if (result.strategy === undefined || result.strategy === null) {
    errors.push({ field: "strategy", message: "strategy is required" });
  }

  if (result.capability === undefined || result.capability === null) {
    errors.push({ field: "capability", message: "capability is required" });
  }

  if (typeof result.executionTime !== "number") {
    errors.push({ field: "executionTime", message: "executionTime must be a number" });
  }

  if (!result.diagnostics || typeof result.diagnostics !== "object") {
    errors.push({ field: "diagnostics", message: "diagnostics must be an object" });
  }

  if (result.completedPhases && !Array.isArray(result.completedPhases)) {
    errors.push({ field: "completedPhases", message: "completedPhases must be an array" });
  }

  for (const phase of (result.completedPhases || [])) {
    if (!VALID_PHASES.has(phase)) {
      errors.push({ field: "completedPhases", message: `Invalid phase: "${phase}"` });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validatePhasesCompleted(result, expectedPhases) {
  const completed = new Set(result.completedPhases || []);
  const missing = expectedPhases.filter((p) => !completed.has(p));
  return {
    complete: missing.length === 0,
    missing,
  };
}
