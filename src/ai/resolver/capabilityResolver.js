import { getCapability, hasCapability } from "../capabilities/capabilityRegistry";
import { modelCatalog } from "../models/modelCatalog";
import {
  isModelDeprecated,
  isModelUnavailable,
  modelHasRequiredFeatures,
  modelHasCapability,
  applyConstraints,
  scoreModel,
  scoreModelHealth,
  categorizeRanked,
  getHealthSummary,
} from "./resolverRules";
import { validateResolution } from "./resolverValidator";

function filterModels(catalog, capability, constraints) {
  const eligible = [];

  for (const model of catalog) {
    if (isModelDeprecated(model)) continue;
    if (isModelUnavailable(model)) continue;
    if (!modelHasCapability(model, capability.id)) continue;
    if (!modelHasRequiredFeatures(model, capability.requiredFeatures)) continue;
    if (!applyConstraints(model, constraints)) continue;
    eligible.push(model);
  }

  return eligible;
}

function rankModels(eligibleModels, capability) {
  return eligibleModels.map((model) => ({
    model,
    score: scoreModel(model, capability),
  }));
}

function buildResolution(request, ranked, capability, catalogSize) {
  const { primary, fallbacks, emergency } = categorizeRanked(ranked);

  const hasCandidates = ranked.length > 0;
  const confidence = !hasCandidates
    ? "none"
    : ranked.length >= 5
      ? "high"
      : ranked.length >= 2
        ? "medium"
        : "low";

  const reason = !hasCandidates
    ? `No models in catalog (${catalogSize} total) satisfy capability "${capability.id}" with applied constraints`
    : `${ranked.length} model(s) matched capability "${capability.id}"`;

  const healthSummary = getHealthSummary();
  const healthDiagnostics = ranked.map((r) => ({
    model: r.model.id,
    ...scoreModelHealth(r.model.id),
  }));

  const diagnostics = {
    catalogSize,
    capabilityId: capability.id,
    totalEligible: ranked.length,
    filteredOut: catalogSize - ranked.length,
    scores: ranked.map((r) => ({
      model: r.model.id,
      score: r.score,
      provider: r.model.provider,
      free: r.model.free,
      speed: r.model.speed,
    })),
    health: {
      summary: healthSummary,
      models: healthDiagnostics,
    },
    appliedConstraints: { ...request },
  };

  const resolution = {
    capability: capability.id,
    primary,
    fallbacks,
    emergency,
    confidence,
    reason,
    diagnostics,
  };

  return validateResolution(resolution);
}

export function resolveCapability(request = {}) {
  const {
    capability: capabilityId,
    requireVision = false,
    requireStructuredOutput = true,
    requireFreeModel = false,
    preferredProvider = null,
    minimumContext = 0,
    minimumReasoning = false,
    minimumCoding = false,
  } = request;

  if (!capabilityId) {
    return {
      success: false,
      error: { type: "invalid_request", message: "capability is required" },
      resolution: null,
    };
  }

  if (!hasCapability(capabilityId)) {
    return {
      success: false,
      error: { type: "invalid_capability", message: `Unknown capability: "${capabilityId}"` },
      resolution: null,
    };
  }

  const capability = getCapability(capabilityId);

  const constraints = {
    requireVision,
    requireStructuredOutput,
    requireFreeModel,
    preferredProvider,
    minimumContext,
    minimumReasoning,
    minimumCoding,
  };

  const eligible = filterModels(modelCatalog, capability, constraints);
  const ranked = rankModels(eligible, capability);
  const resolution = buildResolution(request, ranked, capability, modelCatalog.length);

  return {
    success: resolution.primary !== null,
    error: resolution.primary === null
      ? { type: "no_eligible_models", message: resolution.reason }
      : null,
    resolution,
  };
}

export function getCandidateModels(capabilityId, constraints = {}) {
  if (!hasCapability(capabilityId)) return [];
  const capability = getCapability(capabilityId);
  return filterModels(modelCatalog, capability, constraints);
}

export function rankCandidateModels(capabilityId, constraints = {}) {
  const candidates = getCandidateModels(capabilityId, constraints);
  if (!hasCapability(capabilityId)) return [];
  const capability = getCapability(capabilityId);
  return rankModels(candidates, capability);
}
