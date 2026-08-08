import { CAPABILITY_CATEGORY, EXECUTION_MODE, CAPABILITY_PRIORITY } from "./capabilityTypes";

const REQUIRED_FIELDS = [
  "id",
  "name",
  "description",
  "category",
  "priority",
  "requiredFeatures",
  "optionalFeatures",
  "supportsFallback",
  "supportsEmergency",
  "defaultExecutionMode",
];

const VALID_CATEGORIES = new Set(Object.values(CAPABILITY_CATEGORY));
const VALID_EXECUTION_MODES = new Set(Object.values(EXECUTION_MODE));
const VALID_PRIORITIES = new Set(Object.values(CAPABILITY_PRIORITY));

function validateRequiredFields(capability, errors) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in capability)) {
      errors.push({
        capabilityId: capability.id || "<missing id>",
        field,
        message: `Missing required field: ${field}`,
      });
    }
  }
}

function validateFieldTypes(capability, errors) {
  const id = capability.id || "<missing id>";

  if (typeof capability.id !== "string" || capability.id.trim() === "") {
    errors.push({ capabilityId: id, field: "id", message: "id must be a non-empty string" });
  }

  if (typeof capability.name !== "string" || capability.name.trim() === "") {
    errors.push({ capabilityId: id, field: "name", message: "name must be a non-empty string" });
  }

  if (typeof capability.description !== "string" || capability.description.trim() === "") {
    errors.push({ capabilityId: id, field: "description", message: "description must be a non-empty string" });
  }

  if (!Array.isArray(capability.requiredFeatures)) {
    errors.push({ capabilityId: id, field: "requiredFeatures", message: "requiredFeatures must be an array" });
  }

  if (!Array.isArray(capability.optionalFeatures)) {
    errors.push({ capabilityId: id, field: "optionalFeatures", message: "optionalFeatures must be an array" });
  }

  if (typeof capability.supportsFallback !== "boolean") {
    errors.push({ capabilityId: id, field: "supportsFallback", message: "supportsFallback must be a boolean" });
  }

  if (typeof capability.supportsEmergency !== "boolean") {
    errors.push({ capabilityId: id, field: "supportsEmergency", message: "supportsEmergency must be a boolean" });
  }
}

function validateEnums(capability, errors) {
  const id = capability.id || "<missing id>";

  if (!VALID_CATEGORIES.has(capability.category)) {
    errors.push({
      capabilityId: id,
      field: "category",
      message: `Invalid category "${capability.category}". Valid: ${[...VALID_CATEGORIES].join(", ")}`,
    });
  }

  if (!VALID_PRIORITIES.has(capability.priority)) {
    errors.push({
      capabilityId: id,
      field: "priority",
      message: `Invalid priority ${capability.priority}. Valid: ${[...VALID_PRIORITIES].join(", ")}`,
    });
  }

  if (!VALID_EXECUTION_MODES.has(capability.defaultExecutionMode)) {
    errors.push({
      capabilityId: id,
      field: "defaultExecutionMode",
      message: `Invalid execution mode "${capability.defaultExecutionMode}". Valid: ${[...VALID_EXECUTION_MODES].join(", ")}`,
    });
  }
}

function validateUniqueIds(capabilities, errors) {
  const seen = new Map();
  for (const cap of capabilities) {
    if (seen.has(cap.id)) {
      errors.push({
        capabilityId: cap.id,
        field: "id",
        message: `Duplicate capability ID "${cap.id}" (first seen at index ${seen.get(cap.id)})`,
      });
    } else {
      seen.set(cap.id, capabilities.indexOf(cap));
    }
  }
}

function validateNoModelReferences(capabilities, errors) {
  const modelPatterns = [
    /\bgemma\b/i,
    /\bnemotron\b/i,
    /\bgroq\b/i,
    /\bopenrouter\b/i,
    /\bgpt[\s-]?\d/i,
    /\bgemini\b/i,
    /\bclaude\b/i,
    /\bllama\b/i,
    /\bmistral\b/i,
    /\bphi[\s-]?\d/i,
  ];

  for (const cap of capabilities) {
    const searchable = [cap.id, cap.name, cap.description].join(" ");
    for (const pattern of modelPatterns) {
      if (pattern.test(searchable)) {
        errors.push({
          capabilityId: cap.id,
          field: "description",
          message: `Capability references a model name: ${pattern.source}`,
        });
      }
    }
  }
}

export function validateCapabilityRegistry(capabilities) {
  const errors = [];

  if (!Array.isArray(capabilities)) {
    return { valid: false, errors: [{ capabilityId: "<root>", field: "registry", message: "Registry must be an array" }] };
  }

  if (capabilities.length === 0) {
    return { valid: false, errors: [{ capabilityId: "<root>", field: "registry", message: "Registry is empty" }] };
  }

  validateUniqueIds(capabilities, errors);

  for (const cap of capabilities) {
    validateRequiredFields(cap, errors);
    validateFieldTypes(cap, errors);
    validateEnums(cap, errors);
  }

  validateNoModelReferences(capabilities, errors);

  return {
    valid: errors.length === 0,
    errors,
    capabilityCount: capabilities.length,
  };
}

export default { validateCapabilityRegistry };
