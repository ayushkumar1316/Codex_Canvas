import { modelCatalog } from "./modelCatalog";
import {
  REQUIRED_MODEL_FIELDS,
  VALID_CAPABILITIES,
  VALID_PROVIDER_TYPES,
  VALID_SPEED_TIERS,
  VALID_AVAILABILITY_LEVELS,
  VALIDATION_ERROR,
  Capability,
} from "./modelTypes";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateRequiredFields(model, index) {
  const errors = [];

  for (const field of REQUIRED_MODEL_FIELDS) {
    if (!(field in model) || model[field] === undefined || model[field] === null) {
      errors.push({
        error: VALIDATION_ERROR.MISSING_FIELD,
        model: model.id || `index:${index}`,
        field,
        message: `Model "${model.id || `index:${index}`}" is missing required field "${field}".`,
      });
    }
  }

  return errors;
}

function validateFieldTypes(model, index) {
  const errors = [];
  const id = model.id || `index:${index}`;

  if ("id" in model && typeof model.id !== "string") {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "id", message: `"id" must be a string.` });
  }
  if ("displayName" in model && typeof model.displayName !== "string") {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "displayName", message: `"displayName" must be a string.` });
  }
  if ("provider" in model && typeof model.provider !== "string") {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "provider", message: `"provider" must be a string.` });
  }
  if ("providerType" in model && !VALID_PROVIDER_TYPES.includes(model.providerType)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_VALUE, model: id, field: "providerType", message: `"providerType" must be one of: ${VALID_PROVIDER_TYPES.join(", ")}. Got: "${model.providerType}"` });
  }
  if ("contextWindow" in model && (typeof model.contextWindow !== "number" || model.contextWindow <= 0)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "contextWindow", message: `"contextWindow" must be a positive number.` });
  }
  if ("maxOutputTokens" in model && (typeof model.maxOutputTokens !== "number" || model.maxOutputTokens <= 0)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "maxOutputTokens", message: `"maxOutputTokens" must be a positive number.` });
  }
  if ("priority" in model && (typeof model.priority !== "number" || model.priority < 0)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "priority", message: `"priority" must be a non-negative number.` });
  }
  if ("notes" in model && typeof model.notes !== "string") {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "notes", message: `"notes" must be a string.` });
  }

  const booleanFields = ["vision", "coding", "structuredOutput", "toolCalling", "reasoning", "multimodal", "free", "deprecated"];
  for (const field of booleanFields) {
    if (field in model && typeof model[field] !== "boolean") {
      errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field, message: `"${field}" must be a boolean.` });
    }
  }

  return errors;
}

function validateCapabilities(model, index) {
  const errors = [];
  const id = model.id || `index:${index}`;

  if (!Array.isArray(model.capabilities)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_TYPE, model: id, field: "capabilities", message: `"capabilities" must be an array.` });
    return errors;
  }

  const invalid = model.capabilities.filter((cap) => !VALID_CAPABILITIES.includes(cap));
  if (invalid.length > 0) {
    errors.push({ error: VALIDATION_ERROR.INVALID_VALUE, model: id, field: "capabilities", message: `Invalid capabilities: ${invalid.join(", ")}. Valid: ${VALID_CAPABILITIES.join(", ")}` });
  }

  const unique = new Set(model.capabilities);
  if (unique.size !== model.capabilities.length) {
    errors.push({ error: VALIDATION_ERROR.INVALID_VALUE, model: id, field: "capabilities", message: `Duplicate capabilities found.` });
  }

  return errors;
}

function validateSpeedTier(model, index) {
  const errors = [];
  const id = model.id || `index:${index}`;

  if (!VALID_SPEED_TIERS.includes(model.speed)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_VALUE, model: id, field: "speed", message: `"speed" must be one of: ${VALID_SPEED_TIERS.join(", ")}. Got: "${model.speed}"` });
  }

  return errors;
}

function validateAvailability(model, index) {
  const errors = [];
  const id = model.id || `index:${index}`;

  if (!VALID_AVAILABILITY_LEVELS.includes(model.availability)) {
    errors.push({ error: VALIDATION_ERROR.INVALID_VALUE, model: id, field: "availability", message: `"availability" must be one of: ${VALID_AVAILABILITY_LEVELS.join(", ")}. Got: "${model.availability}"` });
  }

  return errors;
}

function validateCapabilityConsistency(model, index) {
  const errors = [];
  const id = model.id || `index:${index}`;
  const caps = model.capabilities || [];

  if (model.vision === true && !caps.includes(Capability.VISION)) {
    errors.push({ error: VALIDATION_ERROR.CAPABILITY_MISMATCH, model: id, field: "vision", message: `vision=true but "${Capability.VISION}" missing from capabilities.` });
  }
  if (model.coding === true && !caps.includes(Capability.CODE)) {
    errors.push({ error: VALIDATION_ERROR.CAPABILITY_MISMATCH, model: id, field: "coding", message: `coding=true but "${Capability.CODE}" missing from capabilities.` });
  }
  if (model.structuredOutput === true && !caps.includes(Capability.STRUCTURED_OUTPUT)) {
    errors.push({ error: VALIDATION_ERROR.CAPABILITY_MISMATCH, model: id, field: "structuredOutput", message: `structuredOutput=true but "${Capability.STRUCTURED_OUTPUT}" missing from capabilities.` });
  }
  if (model.toolCalling === true && !caps.includes(Capability.TOOL_CALLING)) {
    errors.push({ error: VALIDATION_ERROR.CAPABILITY_MISMATCH, model: id, field: "toolCalling", message: `toolCalling=true but "${Capability.TOOL_CALLING}" missing from capabilities.` });
  }
  if (model.reasoning === true && !caps.includes(Capability.REASONING)) {
    errors.push({ error: VALIDATION_ERROR.CAPABILITY_MISMATCH, model: id, field: "reasoning", message: `reasoning=true but "${Capability.REASONING}" missing from capabilities.` });
  }
  if (model.multimodal === true && !caps.includes(Capability.MULTIMODAL)) {
    errors.push({ error: VALIDATION_ERROR.CAPABILITY_MISMATCH, model: id, field: "multimodal", message: `multimodal=true but "${Capability.MULTIMODAL}" missing from capabilities.` });
  }

  return errors;
}

function detectDuplicates(catalog) {
  const errors = [];

  const idCounts = new Map();
  for (const model of catalog) {
    if (typeof model.id === "string") {
      idCounts.set(model.id, (idCounts.get(model.id) || 0) + 1);
    }
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      errors.push({ error: VALIDATION_ERROR.DUPLICATE_ID, model: id, field: "id", message: `Duplicate model ID "${id}" appears ${count} times.` });
    }
  }

  const nameCounts = new Map();
  for (const model of catalog) {
    if (typeof model.displayName === "string") {
      const key = model.displayName.toLowerCase();
      nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
    }
  }
  for (const [name, count] of nameCounts) {
    if (count > 1) {
      errors.push({ error: VALIDATION_ERROR.DUPLICATE_NAME, model: name, field: "displayName", message: `Duplicate display name "${name}" appears ${count} times.` });
    }
  }

  return errors;
}

export function validateModel(model, index = 0) {
  if (!isObject(model)) {
    return [{ error: VALIDATION_ERROR.INVALID_TYPE, model: `index:${index}`, field: "model", message: `Model at index ${index} is not an object.` }];
  }

  return [
    ...validateRequiredFields(model, index),
    ...validateFieldTypes(model, index),
    ...validateCapabilities(model, index),
    ...validateSpeedTier(model, index),
    ...validateAvailability(model, index),
    ...validateCapabilityConsistency(model, index),
  ];
}

export function validateModelCatalog(catalog = modelCatalog) {
  if (!Array.isArray(catalog)) {
    return { valid: false, errors: [{ error: "invalid_catalog", message: "Catalog must be an array." }], warnings: [], totalModels: 0 };
  }

  const errors = [];
  const warnings = [];

  for (let i = 0; i < catalog.length; i++) {
    const modelErrors = validateModel(catalog[i], i);
    errors.push(...modelErrors);
  }

  errors.push(...detectDuplicates(catalog));

  const deprecated = catalog.filter((m) => m.deprecated === true);
  if (deprecated.length > 0) {
    warnings.push(`Catalog contains ${deprecated.length} deprecated model(s): ${deprecated.map((m) => m.id).join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalModels: catalog.length,
  };
}
