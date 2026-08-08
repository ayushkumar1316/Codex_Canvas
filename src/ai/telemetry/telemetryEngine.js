import {
  TelemetryEvent,
} from "./telemetryTypes";
import {
  createTelemetryStore,
  incrementUsage,
  addTimelineEvent,
  resetTelemetry as resetStore,
} from "./telemetryStore";
import {
  computeAnalytics,
  computeUsage,
} from "./telemetryAnalytics";

export function createTelemetryEngine(store = createTelemetryStore()) {
  function buildEvent(type, data = {}) {
    return {
      type,
      timestamp: Date.now(),
      ...data,
    };
  }

  function recordMetric(record, key, value) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      record[key] += value;
    }
  }

  return {
    recordRequest(metadata = {}) {
      store.global.requestCount += 1;

      if (metadata.model) incrementUsage(store.usage, "model", metadata.model);
      if (metadata.provider) incrementUsage(store.usage, "provider", metadata.provider);
      if (metadata.capability) incrementUsage(store.usage, "capability", metadata.capability);

      addTimelineEvent(store, buildEvent(TelemetryEvent.REQUEST, metadata));
      return { ...store.global };
    },

    recordSuccess(metadata = {}) {
      store.global.successCount += 1;

      if (metadata.latency) recordMetric(store.global, "totalLatency", metadata.latency);
      if (metadata.latency) store.global.latencyCount += 1;
      if (metadata.promptSize) recordMetric(store.global, "totalPromptSize", metadata.promptSize);
      if (metadata.promptSize) store.global.promptCount += 1;
      if (metadata.responseSize) recordMetric(store.global, "totalResponseSize", metadata.responseSize);
      if (metadata.responseSize) store.global.responseCount += 1;
      if (metadata.completionTime) recordMetric(store.global, "totalCompletionTime", metadata.completionTime);
      if (metadata.completionTime) store.global.completionCount += 1;

      addTimelineEvent(store, buildEvent(TelemetryEvent.SUCCESS, metadata));
      return { ...store.global };
    },

    recordFailure(metadata = {}) {
      store.global.failureCount += 1;
      addTimelineEvent(store, buildEvent(TelemetryEvent.FAILURE, metadata));
      return { ...store.global };
    },

    recordRepair(metadata = {}) {
      store.global.repairCount += 1;
      addTimelineEvent(store, buildEvent(TelemetryEvent.REPAIR, metadata));
      return { ...store.global };
    },

    recordValidation(metadata = {}) {
      store.global.validationCount += 1;
      addTimelineEvent(store, buildEvent(TelemetryEvent.VALIDATION, metadata));
      return { ...store.global };
    },

    recordLatency(modelId, latencyMs) {
      recordMetric(store.global, "totalLatency", latencyMs);
      store.global.latencyCount += 1;
      addTimelineEvent(store, buildEvent(TelemetryEvent.SUCCESS, { modelId, latency: latencyMs }));
      return { ...store.global };
    },

    getAnalytics() {
      return computeAnalytics(store);
    },

    getUsage() {
      return computeUsage(store);
    },

    getTimeline() {
      return store.timeline.map((event) => ({ ...event }));
    },

    getStore() {
      return store;
    },

    resetTelemetry() {
      resetStore(store);
    },
  };
}

export const telemetryEngine = createTelemetryEngine();
