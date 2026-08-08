const HEALTH_TTL = 5 * 60 * 1000;
const FAILURE_DECAY_MS = 60 * 1000;
const RATE_LIMIT_DECAY_MS = 5 * 60 * 1000;

const records = new Map();

function createRecord(modelId) {
  return {
    modelId,
    totalAttempts: 0,
    successes: 0,
    failures: 0,
    rateLimits: 0,
    lastSuccess: 0,
    lastFailure: 0,
    lastRateLimit: 0,
    lastChecked: 0,
    avgLatency: 0,
    recentFailures: 0,
    recentRateLimits: 0,
    status: "unknown",
  };
}

function getOrCreate(modelId) {
  if (!records.has(modelId)) {
    records.set(modelId, createRecord(modelId));
  }
  return records.get(modelId);
}

export function recordSuccess(modelId, latency = 0) {
  const r = getOrCreate(modelId);
  r.totalAttempts += 1;
  r.successes += 1;
  r.lastSuccess = Date.now();
  r.lastChecked = Date.now();
  r.status = "healthy";
  r.avgLatency = r.totalAttempts === 1
    ? latency
    : r.avgLatency * 0.8 + latency * 0.2;
  decayRecent(r);
}

export function recordFailure(modelId) {
  const r = getOrCreate(modelId);
  r.totalAttempts += 1;
  r.failures += 1;
  r.lastFailure = Date.now();
  r.lastChecked = Date.now();
  r.recentFailures += 1;
  r.status = r.failures > r.successes ? "unhealthy" : "degraded";
  decayRecent(r);
}

export function recordRateLimit(modelId) {
  const r = getOrCreate(modelId);
  r.totalAttempts += 1;
  r.rateLimits += 1;
  r.lastRateLimit = Date.now();
  r.lastChecked = Date.now();
  r.recentRateLimits += 1;
  r.status = "degraded";
  decayRecent(r);
}

function decayRecent(record) {
  const now = Date.now();
  if (record.lastFailure && now - record.lastFailure > FAILURE_DECAY_MS) {
    record.recentFailures = Math.max(0, record.recentFailures - 1);
  }
  if (record.lastRateLimit && now - record.lastRateLimit > RATE_LIMIT_DECAY_MS) {
    record.recentRateLimits = Math.max(0, record.recentRateLimits - 1);
  }
}

export function getHealth(modelId) {
  if (!records.has(modelId)) {
    return { modelId, status: "unknown", healthScore: 70 };
  }
  const r = records.get(modelId);
  decayRecent(r);
  return { ...r, healthScore: computeHealthScore(r) };
}

export function getAllHealth() {
  const result = {};
  for (const [modelId, record] of records) {
    decayRecent(record);
    result[modelId] = { ...record, healthScore: computeHealthScore(record) };
  }
  return result;
}

export function computeHealthScore(record) {
  if (record.status === "unknown") return 70;

  let score = 100;

  if (record.totalAttempts > 0) {
    const successRate = record.successes / record.totalAttempts;
    score = successRate * 100;
  }

  if (record.recentFailures > 0) {
    score -= record.recentFailures * 15;
  }

  if (record.recentRateLimits > 0) {
    score -= record.recentRateLimits * 20;
  }

  if (record.status === "unhealthy") {
    score = Math.min(score, 30);
  } else if (record.status === "degraded") {
    score = Math.min(score, 60);
  }

  if (record.avgLatency > 30000) {
    score -= 10;
  } else if (record.avgLatency > 15000) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function isHealthStale(modelId) {
  if (!records.has(modelId)) return true;
  const r = records.get(modelId);
  return Date.now() - r.lastChecked > HEALTH_TTL;
}

export function resetHealth(modelId) {
  if (modelId) {
    records.delete(modelId);
  } else {
    records.clear();
  }
}

export function getHealthSummary() {
  const all = getAllHealth();
  const models = Object.keys(all);
  const healthy = models.filter((m) => all[m].status === "healthy").length;
  const degraded = models.filter((m) => all[m].status === "degraded").length;
  const unhealthy = models.filter((m) => all[m].status === "unhealthy").length;
  const unknown = models.filter((m) => all[m].status === "unknown").length;

  return {
    totalModels: models.length,
    healthy,
    degraded,
    unhealthy,
    unknown,
    avgHealthScore: models.length > 0
      ? Math.round(models.reduce((sum, m) => sum + all[m].healthScore, 0) / models.length)
      : 70,
  };
}

export default {
  recordSuccess,
  recordFailure,
  recordRateLimit,
  getHealth,
  getAllHealth,
  computeHealthScore,
  isHealthStale,
  resetHealth,
  getHealthSummary,
};
