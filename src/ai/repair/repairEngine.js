import { REPAIR_RULES, REPAIR_LEVEL, COMPONENT_TYPE_MAP, STYLE_DEFAULTS } from "./repairRules";
import { getSupportedComponentTypes, ValidationErrorCode } from "../validator";

const SUPPORTED_COMPONENT_TYPES = getSupportedComponentTypes();
const SUPPORTED_OPERATION_TYPES = new Set([
  "updateProps", "updateStyles", "insertNode", "deleteNode", "replaceNode",
]);

function generateId() {
  return `repair_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapComponentType(type) {
  if (!type || typeof type !== "string") return "container";
  if (SUPPORTED_COMPONENT_TYPES.has(type)) return type;
  return COMPONENT_TYPE_MAP[type.toLowerCase()] || "container";
}

function normalizeSpacing(value) {
  if (!value || typeof value !== "string") return STYLE_DEFAULTS.spacing;
  if (/^-?\d+(\.\d+)?(px|rem|em|%)?$/.test(value)) return value;
  const num = parseFloat(value);
  if (!isNaN(num)) return `${Math.max(0, num)}px`;
  return STYLE_DEFAULTS.spacing;
}

function normalizeColor(value) {
  if (!value || typeof value !== "string") return STYLE_DEFAULTS.color;
  if (/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|[a-z]+)$/i.test(value)) return value;
  return STYLE_DEFAULTS.color;
}

function normalizeFontSize(value) {
  if (!value || typeof value !== "string") return STYLE_DEFAULTS.fontSize;
  if (/^\d+(\.\d+)?(px|rem|em)$/.test(value)) return value;
  const num = parseFloat(value);
  if (!isNaN(num) && num > 0) return `${num}px`;
  return STYLE_DEFAULTS.fontSize;
}

function normalizeStyles(styles) {
  if (!styles || typeof styles !== "object") return {};

  const result = { ...styles };

  const spacingKeys = [
    "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
    "gap", "rowGap", "columnGap",
  ];
  for (const key of spacingKeys) {
    if (result[key] !== undefined) {
      result[key] = normalizeSpacing(String(result[key]));
    }
  }

  const colorKeys = [
    "color", "backgroundColor", "borderColor", "outlineColor",
    "textDecorationColor", "columnRuleColor", "caretColor",
  ];
  for (const key of colorKeys) {
    if (result[key] !== undefined) {
      result[key] = normalizeColor(String(result[key]));
    }
  }

  if (result.fontSize !== undefined) {
    result.fontSize = normalizeFontSize(String(result.fontSize));
  }

  if (result.borderRadius !== undefined && typeof result.borderRadius === "number") {
    result.borderRadius = `${result.borderRadius}px`;
  }

  return result;
}

function deduplicateIds(tree, seenIds = new Set()) {
  if (!tree || typeof tree !== "object") return tree;

  const result = { ...tree };

  if (result.id && seenIds.has(result.id)) {
    result.id = generateId();
  }
  if (result.id) {
    seenIds.add(result.id);
  }

  if (Array.isArray(result.children)) {
    result.children = result.children.map((child) => deduplicateIds(child, seenIds));
  }

  return result;
}

function fillMissingFields(node) {
  if (!node || typeof node !== "object") return node;

  const result = { ...node };

  if (!result.id) result.id = generateId();
  if (!result.type) result.type = "container";
  if (!result.props || typeof result.props !== "object") result.props = {};
  if (!result.styles || typeof result.styles !== "object") result.styles = {};
  if (!Array.isArray(result.children)) result.children = [];

  if (result.type && !SUPPORTED_COMPONENT_TYPES.has(result.type)) {
    result.type = mapComponentType(result.type);
  }

  if (result.styles) {
    result.styles = normalizeStyles(result.styles);
  }

  if (Array.isArray(result.children)) {
    result.children = result.children.map(fillMissingFields);
  }

  return result;
}

function defaultNode() {
  return {
    id: generateId(),
    type: "container",
    props: {},
    styles: {},
    children: [],
  };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function collectNodeIds(node, ids = new Set()) {
  if (!node || typeof node !== "object") return ids;
  if (typeof node.id === "string") ids.add(node.id);
  for (const child of node.children ?? []) {
    collectNodeIds(child, ids);
  }
  return ids;
}

function collectTreeIds(tree) {
  if (!tree || typeof tree !== "object") return new Set();
  return collectNodeIds(tree);
}

function repairComponentTree(tree) {
  if (!tree || typeof tree !== "object") return tree;

  let result = fillMissingFields(tree);
  result = deduplicateIds(result);

  if (Array.isArray(result.children)) {
    result.children = result.children.map(repairComponentTree);
  }

  return result;
}

function setVersion(response) {
  if (response && typeof response === "object") {
    response.version = "1.0";
  }
  return response;
}

function stripResponseExtraKeys(response) {
  if (!response || typeof response !== "object") return response;
  if (!Array.isArray(response.operations)) return response;

  for (const key of Object.keys(response)) {
    if (key !== "version" && key !== "operations") {
      delete response[key];
    }
  }
  return response;
}

function dropBadOperations(response) {
  if (response && Array.isArray(response.operations)) {
    response.operations = response.operations.filter(
      (op) => op && typeof op === "object" && !Array.isArray(op)
    );
  }
  return response;
}

function mapOperationTypes(response) {
  if (response && Array.isArray(response.operations)) {
    response.operations = response.operations.map((op) => {
      if (!op || typeof op !== "object") return op;

      if (typeof op.type === "string" && !SUPPORTED_OPERATION_TYPES.has(op.type)) {
        if (looksLikeComponentNode(op)) {
          return convertComponentToInsert(op);
        }
      }

      return op;
    });
  }
  return response;
}

function looksLikeComponentNode(op) {
  return (
    typeof op.type === "string" &&
    (SUPPORTED_COMPONENT_TYPES.has(op.type) || COMPONENT_TYPE_MAP[op.type.toLowerCase()]) &&
    (typeof op.id === "string" || isObject(op.props) || isObject(op.styles) || Array.isArray(op.children))
  );
}

function convertComponentToInsert(op) {
  const rootId = "root";
  return {
    type: "insertNode",
    parentId: rootId,
    position: "end",
    node: {
      id: typeof op.id === "string" ? op.id : generateId(),
      type: mapComponentType(op.type),
      props: isObject(op.props) ? op.props : {},
      styles: isObject(op.styles) ? op.styles : {},
      children: Array.isArray(op.children) ? op.children : [],
    },
  };
}

function isComponentNode(value) {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string"
  );
}

function normalizeRawNode(node) {
  if (!node || typeof node !== "object") return node;
  return {
    id: typeof node.id === "string" ? node.id : generateId(),
    type: mapComponentType(node.type),
    props: isObject(node.props) ? node.props : {},
    styles: isObject(node.styles) ? node.styles : {},
    children: Array.isArray(node.children)
      ? node.children.map(normalizeRawNode)
      : [],
  };
}

function flattenTree(node, parentId, operations) {
  if (!isComponentNode(node)) return;
  operations.push({
    type: "insertNode",
    parentId,
    position: "end",
    node: {
      id: typeof node.id === "string" ? node.id : generateId(),
      type: mapComponentType(node.type),
      props: isObject(node.props) ? node.props : {},
      styles: isObject(node.styles) ? node.styles : {},
      children: [],
    },
  });
  for (const child of node.children ?? []) {
    flattenTree(child, node.id, operations);
  }
}

function buildResponse(target, operations) {
  if (isObject(target)) {
    target.version = "1.0";
    target.operations = operations;
    return target;
  }
  return { version: "1.0", operations };
}

function convertRawTreeToOperations(response) {
  if (!response) return response;

  if (Array.isArray(response)) {
    const nodes = response.filter(isComponentNode);
    if (nodes.length === 0) return response;
    const operations = [];
    for (const node of nodes) {
      flattenTree(node, "root", operations);
    }
    return buildResponse(response, operations);
  }

  if (typeof response !== "object") return response;
  if (Array.isArray(response.operations)) return response;

  const rawRoot =
    response.componentTree && isComponentNode(response.componentTree)
      ? response.componentTree
      : isComponentNode(response)
        ? response
        : null;

  if (!rawRoot) return response;

  const operations = [];
  if (rawRoot.id === "root") {
    operations.push({
      type: "replaceNode",
      targetId: "root",
      node: normalizeRawNode(rawRoot),
    });
  } else {
    flattenTree(rawRoot, "root", operations);
  }

  return buildResponse(response, operations);
}

function orderOperations(response, tree) {
  if (!response || !Array.isArray(response.operations)) return response;

  const rootId = tree?.id ?? "root";
  const insertOps = [];
  const updateOps = [];
  const terminalOps = [];

  for (const op of response.operations) {
    if (!op || typeof op !== "object") {
      terminalOps.push(op);
    } else if (op.type === "insertNode") {
      insertOps.push(op);
    } else if (op.type === "updateProps" || op.type === "updateStyles") {
      updateOps.push(op);
    } else {
      terminalOps.push(op);
    }
  }

  const idToInsert = new Map();
  for (const op of insertOps) {
    if (op.node && typeof op.node.id === "string") {
      idToInsert.set(op.node.id, op);
    }
  }

  const ordered = [];
  const placed = new Set();
  let progressed = true;

  while (placed.size < insertOps.length && progressed) {
    progressed = false;
    for (const op of insertOps) {
      if (placed.has(op)) continue;
      const parentId = op.parentId;
      const parentInsert = typeof parentId === "string" ? idToInsert.get(parentId) : null;
      if (parentId === rootId || parentId === undefined || !parentInsert || placed.has(parentInsert)) {
        ordered.push(op);
        placed.add(op);
        progressed = true;
      }
    }
  }

  for (const op of insertOps) {
    if (!placed.has(op)) {
      ordered.push(op);
      placed.add(op);
    }
  }

  response.operations = [...ordered, ...updateOps, ...terminalOps];
  return response;
}

function dropDanglingUpdateOps(response, tree) {
  if (!response || !Array.isArray(response.operations)) return response;

  const knownIds = collectTreeIds(tree);
  for (const op of response.operations) {
    if (op && (op.type === "insertNode" || op.type === "replaceNode") && op.node) {
      collectNodeIds(op.node, knownIds);
    }
  }

  response.operations = response.operations.filter((op) => {
    if (!op || typeof op !== "object") return true;
    if (op.type === "updateProps" || op.type === "updateStyles") {
      if (typeof op.targetId === "string" && !knownIds.has(op.targetId)) {
        return false;
      }
    }
    return true;
  });

  return response;
}

function fillOperationDefaults(response) {
  if (!response || !Array.isArray(response.operations)) return response;

  for (const op of response.operations) {
    if (!op || typeof op !== "object") continue;

    if (op.type === "insertNode") {
      if (!op.parentId) op.parentId = "root";
      if (!op.position) op.position = "end";
      if (!op.node || typeof op.node !== "object") op.node = defaultNode();
    } else if (op.type === "updateProps") {
      if (!isObject(op.props)) op.props = {};
    } else if (op.type === "updateStyles") {
      if (!isObject(op.styles)) op.styles = {};
    } else if (op.type === "replaceNode") {
      if (!op.node || typeof op.node !== "object") {
        if (op.targetId && typeof op.targetId === "string") {
          op.node = defaultNode();
        }
      }
    }
  }

  return response;
}

function fixPositions(response) {
  if (!response || !Array.isArray(response.operations)) return response;

  for (const op of response.operations) {
    if (op && op.type === "insertNode" && !["start", "end"].includes(op.position)) {
      op.position = "end";
    }
  }

  return response;
}

function coerceStringFields(response) {
  if (!response || !Array.isArray(response.operations)) return response;

  for (const op of response.operations) {
    if (!op || typeof op !== "object") continue;
    if (op.targetId !== undefined && typeof op.targetId !== "string") {
      op.targetId = String(op.targetId);
    }
    if (op.parentId !== undefined && typeof op.parentId !== "string") {
      op.parentId = String(op.parentId);
    }
  }

  return response;
}

function normalizeOperationNodes(response) {
  if (!response || !Array.isArray(response.operations)) return response;

  for (const op of response.operations) {
    if (!op || typeof op !== "object") continue;
    if (op.type === "insertNode" || op.type === "replaceNode") {
      if (op.node && typeof op.node === "object") {
        op.node = fillMissingFields(op.node);
      } else {
        op.node = defaultNode();
      }
    }
  }

  return response;
}

function mapNodeTypes(response) {
  if (!response || !Array.isArray(response.operations)) return response;

  const fixType = (node) => {
    if (!node || typeof node !== "object") return node;
    if (typeof node.type === "string" && !SUPPORTED_COMPONENT_TYPES.has(node.type)) {
      node.type = mapComponentType(node.type);
    }
    for (const child of node.children ?? []) {
      fixType(child);
    }
    return node;
  };

  for (const op of response.operations) {
    if (!op || typeof op !== "object") continue;
    if (op.type === "insertNode" || op.type === "replaceNode") {
      op.node = fixType(op.node);
    }
  }

  return response;
}

function deduplicateOperationNodes(response, tree) {
  if (!response || !Array.isArray(response.operations)) return response;

  const knownIds = collectTreeIds(tree);
  const seen = new Set(knownIds);

  const dedupeNode = (node) => {
    if (!node || typeof node !== "object") return node;
    const result = { ...node };
    if (typeof result.id === "string") {
      if (seen.has(result.id)) {
        result.id = generateId();
      }
      seen.add(result.id);
    }
    if (Array.isArray(result.children)) {
      result.children = result.children.map(dedupeNode);
    }
    return result;
  };

  for (const op of response.operations) {
    if (!op || typeof op !== "object") continue;
    if ((op.type === "insertNode" || op.type === "replaceNode") && op.node) {
      op.node = dedupeNode(op.node);
    }
  }

  return response;
}

function getRepairHandler(kind) {
  switch (kind) {
    case "version-mismatch":
    case "business-version-required":
      return setVersion;

    case "response-extra-key":
      return stripResponseExtraKeys;

    case "op-not-object":
      return dropBadOperations;

    case "op-type-unsupported":
    case "business-op-type-unsupported":
      return mapOperationTypes;

    case "operations-not-array":
    case "business-operations-required":
    case "business-operations-not-array":
    case "response-not-object":
      return convertRawTreeToOperations;

    case "op-missing-required":
      return fillOperationDefaults;

    case "op-target-id-type":
    case "op-parent-id-type":
      return coerceStringFields;

    case "op-props-type":
    case "op-styles-type":
      return fillOperationDefaults;

    case "op-position-invalid":
      return fixPositions;

    case "node-not-object":
    case "node-extra-key":
    case "node-id-type":
    case "node-props-type":
    case "node-styles-type":
    case "node-children-type":
      return normalizeOperationNodes;

    case "node-type-unsupported":
    case "registry-type-unregistered":
      return mapNodeTypes;

    case "patch-target-missing":
    case "patch-target-deleted":
    case "patch-parent-missing":
      return (response, tree) => {
        orderOperations(response, tree);
        dropDanglingUpdateOps(response, tree);
        return response;
      };

    case "patch-node-duplicate-id":
    case "patch-node-already-exists":
    case "patch-replacement-id-exists":
      return deduplicateOperationNodes;

    default:
      return null;
  }
}

const UNREPAIRABLE_KINDS = new Set([
  "patch-cannot-delete-root",
  "patch-terminal-conflict",
  "patch-duplicate-update",
  "patch-tree-required",
  "patch-tree-duplicate-id",
]);

export function repairResponse(response, validationErrors, context = {}) {
  if (!validationErrors || validationErrors.length === 0) {
    return {
      repaired: false,
      valid: true,
      repairLevel: null,
      repairedFields: [],
      warnings: [],
      score: 100,
      response,
    };
  }

  let result = typeof response === "string" ? JSON.parse(response) : response;
  const repairedFields = [];
  const warnings = [];
  let maxLevel = null;

  const unrepairable = validationErrors.filter(
    (error) => UNREPAIRABLE_KINDS.has(error.kind)
  );

  if (unrepairable.length > 0) {
    return {
      repaired: false,
      valid: false,
      repairLevel: REPAIR_LEVEL.CRITICAL,
      repairedFields: [],
      warnings,
      score: 0,
      errors: unrepairable,
      response: result,
    };
  }

  for (const error of validationErrors) {
    const rule = REPAIR_RULES[error.code];
    const handler = getRepairHandler(error.kind);
    if (!handler) continue;

    try {
      result = handler(result, context.componentTree, context);
      repairedFields.push(error.kind);
      if (rule?.level === REPAIR_LEVEL.MAJOR) {
        warnings.push(`Repaired: ${rule.description}`);
      }
      if (!maxLevel || rule?.level === REPAIR_LEVEL.CRITICAL) {
        maxLevel = rule?.level || REPAIR_LEVEL.MINOR;
      }
    } catch {
      warnings.push(`Failed to repair: ${error.message}`);
    }
  }

  const hasCritical = validationErrors.some(
    (error) =>
      error.code === ValidationErrorCode.SCHEMA ||
      error.code === ValidationErrorCode.BUSINESS
  );

  if (hasCritical && repairedFields.length === 0) {
    return {
      repaired: false,
      valid: false,
      repairLevel: REPAIR_LEVEL.CRITICAL,
      repairedFields: [],
      warnings,
      score: 0,
      errors: validationErrors,
      response: result,
    };
  }

  return {
    repaired: repairedFields.length > 0,
    valid: repairedFields.length > 0,
    repairLevel: maxLevel || REPAIR_LEVEL.MINOR,
    repairedFields,
    warnings,
    score: Math.max(0, 100 - repairedFields.length * 3 - warnings.length),
    response: result,
  };
}

export function repairComponentTreeStandalone(tree) {
  if (!tree || typeof tree !== "object") return tree;
  return repairComponentTree(tree);
}
