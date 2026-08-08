import { Capability } from "../models/modelTypes";
import { SpeedTier, Availability } from "../models/modelTypes";
import { healthEngine } from "../health/healthEngine";
import { HealthStatus } from "../health/healthRules";

const FEATURE_TO_MODEL_PROPERTY = {
  structured_output: "structuredOutput",
  long_context: null,
  vision: "vision",
  tool_calling: "toolCalling",
  reasoning: "reasoning",
  streaming: null,
};

const SPEED_SCORE = {
  [SpeedTier.VERY_FAST]: 5,
  [SpeedTier.FAST]: 4,
  [SpeedTier.MEDIUM]: 3,
  [SpeedTier.SLOW]: 1,
};

const AVAILABILITY_SCORE = {
  [Availability.HIGH]: 4,
  [Availability.MEDIUM]: 3,
  [Availability.LOW]: 1,
  [Availability.VOLATILE]: 0,
};

const LONG_CONTEXT_THRESHOLD = 100000;

export function isModelDeprecated(model) {
  return model.deprecated === true;
}

export function isModelUnavailable(model) {
  return model.availability === Availability.VOLATILE;
}

export function modelHasRequiredFeatures(model, requiredFeatures) {
  for (const feature of requiredFeatures) {
    if (feature === "streaming") continue;
    if (feature === "long_context") {
      if (model.contextWindow < LONG_CONTEXT_THRESHOLD) return false;
      continue;
    }
    const prop = FEATURE_TO_MODEL_PROPERTY[feature];
    if (prop && !model[prop]) return false;
  }
  return true;
}

export function modelHasCapability(model, capabilityId) {
  const capabilityFeatureMap = {
    website_generation: [Capability.CODE, Capability.STRUCTURED_OUTPUT],
    ui_editing: [Capability.CODE, Capability.TOOL_CALLING],
    json_patch_generation: [Capability.STRUCTURED_OUTPUT],
    intent_classification: [Capability.REASONING, Capability.STRUCTURED_OUTPUT],
    vision_understanding: [Capability.VISION],
    wireframe_understanding: [Capability.VISION, Capability.REASONING],
    image_understanding: [Capability.VISION],
    component_generation: [Capability.CODE, Capability.STRUCTURED_OUTPUT],
    layout_generation: [Capability.CODE, Capability.STRUCTURED_OUTPUT],
    style_editing: [Capability.CODE, Capability.TOOL_CALLING],
    content_editing: [Capability.CODE, Capability.TOOL_CALLING],
    reasoning: [Capability.REASONING],
    long_context: [Capability.LONG_CONTEXT],
    structured_output: [Capability.STRUCTURED_OUTPUT],
    tool_calling: [Capability.TOOL_CALLING],
  };

  const required = capabilityFeatureMap[capabilityId];
  if (!required) return true;
  return required.every((f) => model.capabilities.includes(f));
}

export function applyConstraints(model, constraints) {
  if (constraints.requireVision && !model.vision) return false;
  if (constraints.requireStructuredOutput && !model.structuredOutput) return false;
  if (constraints.requireFreeModel && !model.free) return false;
  if (constraints.preferredProvider && model.provider !== constraints.preferredProvider) return false;
  if (constraints.minimumContext && model.contextWindow < constraints.minimumContext) return false;
  if (constraints.minimumReasoning && !model.reasoning) return false;
  if (constraints.minimumCoding && !model.coding) return false;
  return true;
}

export function scoreModelHealth(modelId) {
  const health = healthEngine.getHealth(modelId);

  if (!health) {
    return {
      score: 50,
      status: HealthStatus.UNKNOWN,
      successRate: null,
      avgLatency: null,
      recentFailures: 0,
      recentRateLimits: 0,
      isStale: true,
    };
  }

  const totalAttempts = health.successCount + health.failureCount;
  const successRate = totalAttempts > 0
    ? Math.round((health.successCount / totalAttempts) * 100)
    : null;

  return {
    score: health.healthScore !== null && health.healthScore !== undefined
      ? health.healthScore
      : 50,
    status: health.availability,
    successRate,
    avgLatency: health.averageLatency || null,
    recentFailures: health.timeoutCount || 0,
    recentRateLimits: health.rateLimitCount || 0,
    isStale: health.lastSuccess === null && health.lastFailure === null,
  };
}

export function getHealthSummary() {
  const allHealth = healthEngine.getAllHealth();
  const models = allHealth.map((h) => h.modelId);
  const totalModels = models.length;

  let healthy = 0;
  let degraded = 0;
  let unhealthy = 0;
  let unknown = 0;

  for (const health of allHealth) {
    switch (health.availability) {
      case HealthStatus.HEALTHY:
        healthy += 1;
        break;
      case HealthStatus.DEGRADED:
        degraded += 1;
        break;
      case HealthStatus.UNHEALTHY:
        unhealthy += 1;
        break;
      default:
        unknown += 1;
        break;
    }
  }

  const avgHealthScore = totalModels > 0
    ? Math.round(
        allHealth.reduce((sum, h) => sum + (h.healthScore || 0), 0) / totalModels
      )
    : 70;

  return {
    totalModels,
    healthy,
    degraded,
    unhealthy,
    unknown,
    avgHealthScore,
  };
}

export function scoreModel(model, capability) {
  let score = 0;

  if (modelHasCapability(model, capability.id)) {
    score += 30;
  }

  if (model.coding) score += 20;
  if (model.vision) score += 15;
  if (model.reasoning) score += 15;
  if (model.structuredOutput) score += 10;
  if (model.toolCalling) score += 5;

  const contextScore = Math.min(5, Math.floor(model.contextWindow / 100000));
  score += contextScore;

  score += SPEED_SCORE[model.speed] || 0;

  if (model.free) score += 5;

  const priorityBonus = Math.max(0, 15 - model.priority);
  score += priorityBonus;

  const availBonus = AVAILABILITY_SCORE[model.availability] || 0;
  score += availBonus;

  const healthData = scoreModelHealth(model.id);
  const healthWeight = 25;
  score += Math.round((healthData.score / 100) * healthWeight);

  return score;
}

export function categorizeRanked(models) {
  if (models.length === 0) {
    return { primary: null, fallbacks: [], emergency: [] };
  }

  const sorted = [...models].sort((a, b) => b.score - a.score);

  const primary = sorted[0].model.id;
  const fallbacks = sorted.slice(1, 4).map((m) => m.model.id);
  const emergency = sorted.slice(4, 7).map((m) => m.model.id);

  return { primary, fallbacks, emergency };
}
