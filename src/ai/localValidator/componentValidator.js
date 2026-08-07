import { VALIDATION_CODES, SUPPORTED_COMPONENT_TYPES } from "./validationRules";

function createError(code, message, path = "") {
  return { code, message, path };
}

function createWarning(code, message, path = "") {
  return { code, message, path, warning: true };
}

function validateNode(node, path, errors, warnings, seenIds) {
  if (!node || typeof node !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_ROOT.code, "Node is not an object", path));
    return;
  }

  if (!node.id || typeof node.id !== "string") {
    errors.push(createError(VALIDATION_CODES.MISSING_ID.code, VALIDATION_CODES.MISSING_ID.message, path));
  } else if (seenIds.has(node.id)) {
    errors.push(createError(VALIDATION_CODES.DUPLICATE_ID.code, `Duplicate ID: ${node.id}`, path));
  } else {
    seenIds.add(node.id);
  }

  if (!node.type || typeof node.type !== "string") {
    errors.push(createError(VALIDATION_CODES.MISSING_TYPE.code, VALIDATION_CODES.MISSING_TYPE.message, path));
  } else if (!SUPPORTED_COMPONENT_TYPES.has(node.type)) {
    errors.push(createError(VALIDATION_CODES.UNSUPPORTED_TYPE.code, `Unsupported type: ${node.type}`, path));
  }

  if (!node.props || typeof node.props !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_PROPS.code, VALIDATION_CODES.MISSING_PROPS.message, path));
  }

  if (!node.styles || typeof node.styles !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_STYLES.code, VALIDATION_CODES.MISSING_STYLES.message, path));
  }

  if (!Array.isArray(node.children)) {
    errors.push(createError(VALIDATION_CODES.MISSING_CHILDREN.code, VALIDATION_CODES.MISSING_CHILDREN.message, path));
    return;
  }

  for (let i = 0; i < node.children.length; i++) {
    validateNode(node.children[i], `${path}.children[${i}]`, errors, warnings, seenIds);
  }
}

export function validateComponentTree(tree) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();

  if (!tree || typeof tree !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_ROOT.code, "Component tree is not an object"));
    return { valid: false, errors, warnings };
  }

  if (tree.type !== "root") {
    warnings.push(createWarning("NON_ROOT_TYPE", `Root node type is "${tree.type}" instead of "root"`));
  }

  validateNode(tree, "root", errors, warnings, seenIds);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateInsertedNode(node) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();

  validateNode(node, "insertedNode", errors, warnings, seenIds);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
