import { HealthStatus } from "./healthRules";

function createDefaultHealth(modelId) {
  return {
    modelId,
    successCount: 0,
    failureCount: 0,
    rateLimitCount: 0,
    timeoutCount: 0,
    totalLatency: 0,
    latencyCount: 0,
    averageLatency: 0,
    totalRepairCount: 0,
    repairCount: 0,
    averageRepairCount: 0,
    totalValidationFailures: 0,
    validationCount: 0,
    averageValidationFailures: 0,
    lastSuccess: null,
    lastFailure: null,
    healthScore: DEFAULT_SCORE,
    availability: HealthStatus.UNKNOWN,
  };
}

const DEFAULT_SCORE = 50;

export function getHealthRecord(store, modelId) {
  if (!store.has(modelId)) {
    store.set(modelId, createDefaultHealth(modelId));
  }
  return store.get(modelId);
}

export function createStore() {
  return new Map();
}

export function resetHealth(store, modelId) {
  if (modelId) {
    store.set(modelId, createDefaultHealth(modelId));
  } else {
    store.clear();
  }
}

export function getAllRecords(store) {
  return Array.from(store.values());
}

export function deleteRecord(store, modelId) {
  return store.delete(modelId);
}

export function hasRecord(store, modelId) {
  return store.has(modelId);
}
