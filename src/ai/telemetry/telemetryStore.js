import { DEFAULT_STORE_STATE, USAGE_DIMENSIONS } from "./telemetryTypes";

function createEmptyState() {
  return { ...DEFAULT_STORE_STATE };
}

function createEmptyUsage() {
  return {
    model: new Map(),
    provider: new Map(),
    capability: new Map(),
  };
}

export function createTelemetryStore() {
  return {
    global: createEmptyState(),
    usage: createEmptyUsage(),
    timeline: [],
  };
}

export function getGlobalState(store) {
  return store.global;
}

export function incrementUsage(usage, dimension, key, count = 1) {
  if (!USAGE_DIMENSIONS.includes(dimension)) return;
  const map = usage[dimension];
  map.set(key, (map.get(key) || 0) + count);
}

export function getUsageMap(usage, dimension) {
  if (!USAGE_DIMENSIONS.includes(dimension)) return new Map();
  return new Map(usage[dimension]);
}

export function getUsageEntries(usage, dimension) {
  if (!USAGE_DIMENSIONS.includes(dimension)) return [];
  return Array.from(usage[dimension].entries()).map(([key, count]) => ({ key, count }));
}

export function addTimelineEvent(store, event) {
  store.timeline.push(event);
}

export function getTimeline(store) {
  return [...store.timeline];
}

export function resetTelemetry(store) {
  store.global = createEmptyState();
  store.usage = createEmptyUsage();
  store.timeline = [];
}

export function hasUsage(usage, dimension, key) {
  if (!USAGE_DIMENSIONS.includes(dimension)) return false;
  return usage[dimension].has(key);
}

export function getUsageCount(usage, dimension, key) {
  if (!USAGE_DIMENSIONS.includes(dimension)) return 0;
  return usage[dimension].get(key) || 0;
}
