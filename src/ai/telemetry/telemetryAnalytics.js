import { SortOrder } from "./telemetryTypes";
import { getUsageEntries } from "./telemetryStore";

function safeDivide(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function sortEntries(entries, order = SortOrder.DESC) {
  return [...entries].sort((a, b) =>
    order === SortOrder.ASC ? a.count - b.count : b.count - a.count
  );
}

export function computeAverageLatency(store) {
  return safeDivide(store.global.totalLatency, store.global.latencyCount);
}

export function computeAveragePromptSize(store) {
  return safeDivide(store.global.totalPromptSize, store.global.promptCount);
}

export function computeAverageResponseSize(store) {
  return safeDivide(store.global.totalResponseSize, store.global.responseCount);
}

export function computeAverageCompletionTime(store) {
  return safeDivide(store.global.totalCompletionTime, store.global.completionCount);
}

export function computeSuccessRate(store) {
  const total = store.global.successCount + store.global.failureCount;
  return safeDivide(store.global.successCount, total);
}

export function computeFailureRate(store) {
  const total = store.global.successCount + store.global.failureCount;
  return safeDivide(store.global.failureCount, total);
}

export function computeAverageRepairRate(store) {
  return safeDivide(store.global.repairCount, store.global.requestCount);
}

export function computeAverageValidationRate(store) {
  return safeDivide(store.global.validationCount, store.global.requestCount);
}

export function computeAverageValidationFailures(store) {
  return safeDivide(store.global.validationCount, store.global.requestCount);
}

export function getMostUsed(store, dimension, limit = 5) {
  const entries = getUsageEntries(store.usage, dimension);
  return sortEntries(entries, SortOrder.DESC).slice(0, limit);
}

export function getTopPerformingModels(store, limit = 5) {
  const modelEntries = getUsageEntries(store.usage, "model");
  return sortEntries(modelEntries, SortOrder.DESC).slice(0, limit);
}

export function getTopPerformingProviders(store, limit = 5) {
  const providerEntries = getUsageEntries(store.usage, "provider");
  return sortEntries(providerEntries, SortOrder.DESC).slice(0, limit);
}

export function getUsageBreakdown(store, dimension) {
  return sortEntries(getUsageEntries(store.usage, dimension), SortOrder.DESC);
}

export function computePercentile(values, percentile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export function computeThroughputPerMinute(store) {
  if (store.timeline.length < 2) return 0;
  const oldest = store.timeline[0].timestamp;
  const newest = store.timeline[store.timeline.length - 1].timestamp;
  const minutes = (newest - oldest) / 60000;
  return minutes === 0 ? 0 : safeDivide(store.global.requestCount, minutes);
}

export function computeAnalytics(store) {
  return {
    requestCount: store.global.requestCount,
    successCount: store.global.successCount,
    failureCount: store.global.failureCount,
    repairCount: store.global.repairCount,
    validationCount: store.global.validationCount,
    averageLatency: computeAverageLatency(store),
    averagePromptSize: computeAveragePromptSize(store),
    averageResponseSize: computeAverageResponseSize(store),
    averageCompletionTime: computeAverageCompletionTime(store),
    successRate: computeSuccessRate(store),
    failureRate: computeFailureRate(store),
    averageRepairRate: computeAverageRepairRate(store),
    averageValidationRate: computeAverageValidationRate(store),
    averageValidationFailures: computeAverageValidationFailures(store),
    mostUsedModel: getMostUsed(store, "model", 1)[0] || null,
    mostUsedProvider: getMostUsed(store, "provider", 1)[0] || null,
    mostUsedCapability: getMostUsed(store, "capability", 1)[0] || null,
    topPerformingModels: getTopPerformingModels(store, 5),
    topPerformingProviders: getTopPerformingProviders(store, 5),
    usageBreakdown: {
      model: getUsageBreakdown(store, "model"),
      provider: getUsageBreakdown(store, "provider"),
      capability: getUsageBreakdown(store, "capability"),
    },
  };
}

export function computeUsage(store) {
  return {
    model: getUsageEntries(store.usage, "model"),
    provider: getUsageEntries(store.usage, "provider"),
    capability: getUsageEntries(store.usage, "capability"),
  };
}
