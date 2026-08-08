export const HealthStatus = Object.freeze({
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
  UNKNOWN: "unknown",
});

export const HealthEvent = Object.freeze({
  SUCCESS: "success",
  FAILURE: "failure",
  RATE_LIMIT: "rate_limit",
  TIMEOUT: "timeout",
});

export const ScoringWeights = Object.freeze({
  SUCCESS: 10,
  FAILURE: -15,
  RATE_LIMIT: -20,
  TIMEOUT: -10,
  LATENCY_PENALTY: -5,
  REPAIR_PENALTY: -3,
  VALIDATION_FAILURE_PENALTY: -2,
});

export const Thresholds = Object.freeze({
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  HEALTHY_MIN: 70,
  DEGRADED_MIN: 40,
  LATENCY_THRESHOLD_MS: 10000,
  HIGH_FAILURE_RATE: 0.3,
  MIN_SAMPLES_FOR_SCORE: 5,
});

export const DEFAULT_HEALTH_SCORE = Object.freeze({
  [HealthStatus.HEALTHY]: 80,
  [HealthStatus.DEGRADED]: 50,
  [HealthStatus.UNHEALTHY]: 20,
  [HealthStatus.UNKNOWN]: 50,
});

export const REQUIRED_HEALTH_FIELDS = Object.freeze([
  "modelId",
  "successCount",
  "failureCount",
  "rateLimitCount",
  "timeoutCount",
  "averageLatency",
  "averageRepairCount",
  "averageValidationFailures",
  "lastSuccess",
  "lastFailure",
  "healthScore",
  "availability",
]);
