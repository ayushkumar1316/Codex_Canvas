import {
  resolveCapability,
  getCandidateModels,
  rankCandidateModels,
} from "./capabilityResolver";
import { validateResolution, validateResolverInput } from "./resolverValidator";
import {
  healthEngine,
  createHealthEngine,
} from "../health/healthEngine";
import { getHealthSummary } from "./resolverRules";

export { resolveCapability, getCandidateModels, rankCandidateModels };
export { validateResolution, validateResolverInput };
export { healthEngine, createHealthEngine };
export { getHealthSummary };

export function resolveForCapability(capabilityId, constraints = {}) {
  return resolveCapability({ capability: capabilityId, ...constraints });
}

export function explainResolution(resolution) {
  if (!resolution) return "No resolution provided";
  const parts = [`Capability: ${resolution.capability}`];
  if (resolution.primary) {
    parts.push(`Primary: ${resolution.primary}`);
  }
  if (resolution.fallbacks?.length) {
    parts.push(`Fallbacks: ${resolution.fallbacks.join(", ")}`);
  }
  if (resolution.emergency?.length) {
    parts.push(`Emergency: ${resolution.emergency.join(", ")}`);
  }
  parts.push(`Confidence: ${resolution.confidence}`);
  parts.push(`Reason: ${resolution.reason}`);
  return parts.join("\n");
}
