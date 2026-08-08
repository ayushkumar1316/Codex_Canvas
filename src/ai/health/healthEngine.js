import {
  HealthStatus,
  ScoringWeights,
  Thresholds,
} from "./healthRules";
import {
  getHealthRecord,
  createStore,
  resetHealth,
  getAllRecords,
  deleteRecord,
  hasRecord,
} from "./healthStore";

export function createHealthEngine(store = createStore()) {
  function computeScore(record) {
    const totalRequests = record.successCount + record.failureCount;

    if (totalRequests < Thresholds.MIN_SAMPLES_FOR_SCORE) {
      return null;
    }

    let score = Thresholds.MAX_SCORE / 2;

    score += record.successCount * ScoringWeights.SUCCESS;
    score += record.failureCount * ScoringWeights.FAILURE;
    score += record.rateLimitCount * ScoringWeights.RATE_LIMIT;
    score += record.timeoutCount * ScoringWeights.TIMEOUT;

    if (record.averageLatency > Thresholds.LATENCY_THRESHOLD_MS) {
      score += ScoringWeights.LATENCY_PENALTY;
    }

    score += record.averageRepairCount * ScoringWeights.REPAIR_PENALTY;
    score += record.averageValidationFailures * ScoringWeights.VALIDATION_FAILURE_PENALTY;

    return Math.max(Thresholds.MIN_SCORE, Math.min(Thresholds.MAX_SCORE, Math.round(score)));
  }

  function computeAvailability(record) {
    const totalRequests = record.successCount + record.failureCount;

    if (totalRequests < Thresholds.MIN_SAMPLES_FOR_SCORE) {
      return HealthStatus.UNKNOWN;
    }

    const failureRate = record.failureCount / totalRequests;

    const score = computeScore(record);

    if (failureRate >= Thresholds.HIGH_FAILURE_RATE || score < Thresholds.DEGRADED_MIN) {
      return HealthStatus.UNHEALTHY;
    }

    if (score < Thresholds.HEALTHY_MIN) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  function updateDerived(record) {
    record.averageLatency = record.latencyCount > 0
      ? Math.round(record.totalLatency / record.latencyCount)
      : 0;

    record.averageRepairCount = record.repairCount > 0
      ? record.totalRepairCount / record.repairCount
      : 0;

    record.averageValidationFailures = record.validationCount > 0
      ? record.totalValidationFailures / record.validationCount
      : 0;

    record.healthScore = computeScore(record);
    record.availability = computeAvailability(record);
  }

  return {
    recordSuccess(modelId, metadata = {}) {
      const record = getHealthRecord(store, modelId);
      record.successCount += 1;
      record.lastSuccess = Date.now();

      if (metadata.repairCount !== undefined) {
        record.totalRepairCount += metadata.repairCount;
        record.repairCount += 1;
      }

      if (metadata.validationFailures !== undefined) {
        record.totalValidationFailures += metadata.validationFailures;
        record.validationCount += 1;
      }

      updateDerived(record);
      return { ...record };
    },

    recordFailure(modelId, metadata = {}) {
      const record = getHealthRecord(store, modelId);
      record.failureCount += 1;
      record.lastFailure = Date.now();

      if (metadata.isTimeout) {
        record.timeoutCount += 1;
      }

      if (metadata.isRateLimit) {
        record.rateLimitCount += 1;
      }

      if (metadata.repairCount !== undefined) {
        record.totalRepairCount += metadata.repairCount;
        record.repairCount += 1;
      }

      if (metadata.validationFailures !== undefined) {
        record.totalValidationFailures += metadata.validationFailures;
        record.validationCount += 1;
      }

      updateDerived(record);
      return { ...record };
    },

    recordLatency(modelId, latencyMs) {
      const record = getHealthRecord(store, modelId);
      record.totalLatency += latencyMs;
      record.latencyCount += 1;
      updateDerived(record);
      return { ...record };
    },

    getHealth(modelId) {
      const record = store.get(modelId);
      return record ? { ...record } : null;
    },

    getHealthScore(modelId) {
      const record = store.get(modelId);
      if (!record) return null;
      return {
        modelId: record.modelId,
        healthScore: record.healthScore,
        availability: record.availability,
        totalRequests: record.successCount + record.failureCount,
      };
    },

    getAllHealth() {
      return getAllRecords(store).map((record) => ({ ...record }));
    },

    getAllScores() {
      return getAllRecords(store).map((record) => ({
        modelId: record.modelId,
        healthScore: record.healthScore,
        availability: record.availability,
        totalRequests: record.successCount + record.failureCount,
      }));
    },

    getHealthyModels() {
      return getAllRecords(store)
        .filter((record) => record.availability === HealthStatus.HEALTHY)
        .map((record) => record.modelId);
    },

    getUnhealthyModels() {
      return getAllRecords(store)
        .filter((record) => record.availability === HealthStatus.UNHEALTHY)
        .map((record) => record.modelId);
    },

    resetHealth(modelId) {
      resetHealth(store, modelId);
    },

    deleteRecord(modelId) {
      return deleteRecord(store, modelId);
    },

    hasRecord(modelId) {
      return hasRecord(store, modelId);
    },

    getStore() {
      return store;
    },
  };
}

export const healthEngine = createHealthEngine();
