import { hasCapability, getAllCapabilities } from "../capabilities/capabilityRegistry";
import { modelCatalog } from "../models/modelCatalog";

const VALID_CONFIDENCE = new Set(["high", "medium", "low", "none"]);

function validateCapabilityExists(resolution, errors) {
  if (!resolution.capability) {
    errors.push({ field: "capability", message: "capability is required" });
    return false;
  }
  if (!hasCapability(resolution.capability)) {
    errors.push({
      field: "capability",
      message: `Unknown capability: "${resolution.capability}"`,
    });
    return false;
  }
  return true;
}

function validateRegistryIntegrity(errors) {
  const caps = getAllCapabilities();
  if (caps.length === 0) {
    errors.push({ field: "registry", message: "Capability registry is empty" });
    return false;
  }
  return true;
}

function validateCatalogIntegrity(errors) {
  if (!Array.isArray(modelCatalog) || modelCatalog.length === 0) {
    errors.push({ field: "catalog", message: "Model catalog is empty or invalid" });
    return false;
  }
  return true;
}

function validateNoDuplicateCandidates(resolution, errors) {
  const all = [
    resolution.primary,
    ...(resolution.fallbacks || []),
    ...(resolution.emergency || []),
  ].filter(Boolean);

  const seen = new Set();
  for (const id of all) {
    if (seen.has(id)) {
      errors.push({
        field: "candidates",
        message: `Duplicate model "${id}" across primary/fallbacks/emergency`,
      });
    }
    seen.add(id);
  }
}

function validateEligibleModelsExist(resolution, errors) {
  if (!resolution.primary && (!resolution.fallbacks || resolution.fallbacks.length === 0)) {
    errors.push({
      field: "candidates",
      message: "No eligible models found for this capability and constraints",
    });
  }
}

function validateConfidence(resolution, errors) {
  if (resolution.confidence && !VALID_CONFIDENCE.has(resolution.confidence)) {
    errors.push({
      field: "confidence",
      message: `Invalid confidence: "${resolution.confidence}". Valid: ${[...VALID_CONFIDENCE].join(", ")}`,
    });
  }
}

function validateFields(resolution, errors) {
  const required = ["capability", "primary", "fallbacks", "emergency", "confidence", "reason", "diagnostics"];
  for (const field of required) {
    if (!(field in resolution)) {
      errors.push({ field, message: `Missing required field: ${field}` });
    }
  }

  if (resolution.fallbacks && !Array.isArray(resolution.fallbacks)) {
    errors.push({ field: "fallbacks", message: "fallbacks must be an array" });
  }
  if (resolution.emergency && !Array.isArray(resolution.emergency)) {
    errors.push({ field: "emergency", message: "emergency must be an array" });
  }
}

export function validateResolution(resolution) {
  const errors = [];

  if (!resolution || typeof resolution !== "object") {
    return {
      valid: false,
      errors: [{ field: "resolution", message: "Resolution must be an object" }],
      resolution,
    };
  }

  validateFields(resolution, errors);
  validateCapabilityExists(resolution, errors);
  validateRegistryIntegrity(errors);
  validateCatalogIntegrity(errors);
  validateNoDuplicateCandidates(resolution, errors);
  validateEligibleModelsExist(resolution, errors);
  validateConfidence(resolution, errors);

  return {
    valid: errors.length === 0,
    errors,
    resolution,
  };
}

export function validateResolverInput(request) {
  const errors = [];

  if (!request || typeof request !== "object") {
    return { valid: false, errors: [{ field: "request", message: "Request must be an object" }] };
  }

  if (!request.capability) {
    errors.push({ field: "capability", message: "capability is required" });
  } else if (!hasCapability(request.capability)) {
    errors.push({ field: "capability", message: `Unknown capability: "${request.capability}"` });
  }

  return { valid: errors.length === 0, errors };
}

export default { validateResolution, validateResolverInput };
