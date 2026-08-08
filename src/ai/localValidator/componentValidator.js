import { VALIDATION_CODES, SUPPORTED_COMPONENT_TYPES, NESTING_RULES } from "./validationRules";

function createError(codeDef, message, path = "") {
  const def = typeof codeDef === "string"
    ? Object.values(VALIDATION_CODES).find((c) => c.code === codeDef)
    : codeDef;
  return { code: def.code, severity: def.severity, message: message || def.message, path };
}

function createWarning(codeDef, message, path = "") {
  const def = typeof codeDef === "string"
    ? Object.values(VALIDATION_CODES).find((c) => c.code === codeDef)
    : codeDef;
  return { code: def.code, severity: def.severity, message: message || def.message, path, warning: true };
}

function validateNode(node, path, errors, warnings, seenIds, ancestorIds) {
  if (!node || typeof node !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_ROOT, "Node is not an object", path));
    return;
  }

  if (!node.id || typeof node.id !== "string") {
    errors.push(createError(VALIDATION_CODES.MISSING_ID, VALIDATION_CODES.MISSING_ID.message, path));
  } else if (seenIds.has(node.id)) {
    errors.push(createError(VALIDATION_CODES.DUPLICATE_ID, `Duplicate ID: ${node.id}`, path));
  } else {
    seenIds.add(node.id);
  }

  if (ancestorIds.has(node.id)) {
    errors.push(createError(VALIDATION_CODES.CIRCULAR_REFERENCE, `Circular reference to ID: ${node.id}`, path));
    return;
  }

  if (!node.type || typeof node.type !== "string") {
    errors.push(createError(VALIDATION_CODES.MISSING_TYPE, VALIDATION_CODES.MISSING_TYPE.message, path));
  } else if (!SUPPORTED_COMPONENT_TYPES.has(node.type)) {
    errors.push(createError(VALIDATION_CODES.UNSUPPORTED_TYPE, `Unsupported type: ${node.type}`, path));
  }

  if (!node.props || typeof node.props !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_PROPS, VALIDATION_CODES.MISSING_PROPS.message, path));
  }

  if (!node.styles || typeof node.styles !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_STYLES, VALIDATION_CODES.MISSING_STYLES.message, path));
  }

  if (!Array.isArray(node.children)) {
    errors.push(createError(VALIDATION_CODES.MISSING_CHILDREN, VALIDATION_CODES.MISSING_CHILDREN.message, path));
    return;
  }

  const allowedParents = NESTING_RULES[node.type];
  if (allowedParents !== undefined) {
    const parentType = path.includes(".") ? path.split(".")[0] : null;
    if (parentType && parentType !== "root" && !allowedParents.includes(parentType)) {
      warnings.push(createWarning(VALIDATION_CODES.INVALID_NESTING, `${node.type} inside ${parentType} is not recommended`, path));
    }
  }

  if (node.children.length > 0 && ["heading", "text", "button", "input", "textarea", "image"].includes(node.type)) {
    warnings.push(createWarning(VALIDATION_CODES.INVALID_NESTING, `${node.type} should not have children`, path));
  }

  const nextAncestors = new Set(ancestorIds);
  if (node.id) nextAncestors.add(node.id);

  for (let i = 0; i < node.children.length; i++) {
    validateNode(node.children[i], `${path}.children[${i}]`, errors, warnings, seenIds, nextAncestors);
  }
}

export function validateComponentTree(tree, canvasState) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const ancestorIds = new Set();

  if (!tree || typeof tree !== "object") {
    errors.push(createError(VALIDATION_CODES.MISSING_ROOT, "Component tree is not an object"));
    return { valid: false, errors, warnings };
  }

  if (tree.type !== "root") {
    warnings.push(createWarning("NON_ROOT_TYPE", `Root node type is "${tree.type}" instead of "root"`));
  }

  const isEmpty = !tree.children || tree.children.length === 0;
  if (isEmpty && canvasState && canvasState !== "EMPTY") {
    warnings.push(createWarning(VALIDATION_CODES.EMPTY_TREE, "Component tree is empty but canvas state is not EMPTY"));
  }

  validateNode(tree, "root", errors, warnings, seenIds, ancestorIds);

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
  const ancestorIds = new Set();

  validateNode(node, "insertedNode", errors, warnings, seenIds, ancestorIds);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
