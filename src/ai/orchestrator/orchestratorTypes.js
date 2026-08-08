export const ORCHESTRATOR_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
  PARTIAL: "partial",
};

export const ORCHESTRATOR_PHASE = {
  STRATEGY: "strategy",
  CAPABILITY: "capability",
  RESOLUTION: "resolution",
  PROVIDER: "provider",
  REPAIR: "repair",
  VALIDATION: "validation",
  TELEMETRY: "telemetry",
};

export const ORCHESTRATOR_ERROR = {
  MISSING_STRATEGY: "missing_strategy",
  MISSING_CAPABILITY: "missing_capability",
  NO_ELIGIBLE_MODELS: "no_eligible_models",
  PROVIDER_FAILED: "provider_failed",
  REPAIR_FAILED: "repair_failed",
  VALIDATION_FAILED: "validation_failed",
  EXECUTION_TIMEOUT: "execution_timeout",
};
