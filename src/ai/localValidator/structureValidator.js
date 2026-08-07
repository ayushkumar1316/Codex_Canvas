import { VALIDATION_CODES, SUPPORTED_OPERATION_TYPES } from "./validationRules";

function createError(code, message, path = "") {
  return { code, message, path };
}

function createWarning(code, message, path = "") {
  return { code, message, path, warning: true };
}

export function validateStructure(response) {
  const errors = [];
  const warnings = [];

  if (!response || typeof response !== "object") {
    errors.push(createError(VALIDATION_CODES.INVALID_JSON.code, VALIDATION_CODES.INVALID_JSON.message));
    return { valid: false, errors, warnings };
  }

  if (!Array.isArray(response.operations)) {
    errors.push(createError(VALIDATION_CODES.MISSING_OPS.code, VALIDATION_CODES.MISSING_OPS.message));
    return { valid: false, errors, warnings };
  }

  if (response.operations.length === 0) {
    warnings.push(createWarning(VALIDATION_CODES.EMPTY_TREE.code, "No operations in response"));
  }

  for (let i = 0; i < response.operations.length; i++) {
    const op = response.operations[i];
    const opPath = `operations[${i}]`;

    if (!op || typeof op !== "object") {
      errors.push(createError(VALIDATION_CODES.INVALID_OP_TYPE.code, "Operation is not an object", opPath));
      continue;
    }

    if (!op.type || !SUPPORTED_OPERATION_TYPES.has(op.type)) {
      errors.push(createError(VALIDATION_CODES.INVALID_OP_TYPE.code, `Invalid operation type: ${op.type}`, opPath));
      continue;
    }

    if (op.type === "insertNode") {
      if (!op.parentId) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, "insertNode missing parentId", opPath));
      }
      if (!op.position || !["start", "end"].includes(op.position)) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, "insertNode missing valid position", opPath));
      }
      if (!op.node) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, "insertNode missing node", opPath));
      }
    }

    if (op.type === "updateProps" || op.type === "updateStyles") {
      if (!op.targetId) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, `${op.type} missing targetId`, opPath));
      }
    }

    if (op.type === "deleteNode") {
      if (!op.targetId) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, "deleteNode missing targetId", opPath));
      }
    }

    if (op.type === "replaceNode") {
      if (!op.targetId) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, "replaceNode missing targetId", opPath));
      }
      if (!op.node) {
        errors.push(createError(VALIDATION_CODES.MISSING_OP_FIELDS.code, "replaceNode missing node", opPath));
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
