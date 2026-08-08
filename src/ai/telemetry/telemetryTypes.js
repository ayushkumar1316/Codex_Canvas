export const TelemetryEvent = Object.freeze({
  REQUEST: "request",
  SUCCESS: "success",
  FAILURE: "failure",
  REPAIR: "repair",
  VALIDATION: "validation",
});

export const SortOrder = Object.freeze({
  ASC: "asc",
  DESC: "desc",
});

export const DEFAULT_STORE_STATE = Object.freeze({
  requestCount: 0,
  successCount: 0,
  failureCount: 0,
  repairCount: 0,
  validationCount: 0,
  totalLatency: 0,
  latencyCount: 0,
  totalPromptSize: 0,
  promptCount: 0,
  totalResponseSize: 0,
  responseCount: 0,
  totalCompletionTime: 0,
  completionCount: 0,
});

export const USAGE_DIMENSIONS = Object.freeze(["model", "provider", "capability"]);
