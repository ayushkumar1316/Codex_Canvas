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
  const lower = String(type).toLowerCase();
  if (SUPPORTED_COMPONENT_TYPES.has(lower)) return lower;
  if (COMPONENT_TYPE_MAP[lower]) return COMPONENT_TYPE_MAP[lower];
  return "container";
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

const TEXT_COMPONENT_TYPES = new Set(["heading", "button", "input", "textarea"]);

function normalizeTextInChildren(node) {
  if (!node || typeof node !== "object") return node;
  const result = { ...node };

  if (Array.isArray(result.children)) {
    result.children = result.children.map(normalizeTextInChildren);
  }

  if (TEXT_COMPONENT_TYPES.has(result.type) && !result.props?.text) {
    const singleChild = result.children.length === 1 ? result.children[0] : null;
    if (singleChild && singleChild.type === "text" && singleChild.props?.text) {
      result.props = { ...result.props, text: singleChild.props.text };
      result.children = [];
    }
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
  result = normalizeTextInChildren(result);

  if (Array.isArray(result.children)) {
    result.children = result.children.map(repairComponentTree);
  }

  return result;
}

function isJsonPatchOperation(obj) {
  return (
    isObject(obj) &&
    typeof obj.op === "string" &&
    typeof obj.path === "string" &&
    ["add", "remove", "replace", "move", "copy", "test"].includes(obj.op)
  );
}

function parseJsonPatchPath(path) {
  if (!path || typeof path !== "string") return [];
  const segments = path.split("/").filter(Boolean);
  const result = [];
  let i = 0;
  while (i < segments.length) {
    if (segments[i] === "children" && i + 1 < segments.length && /^\d+$/.test(segments[i + 1])) {
      result.push({ type: "child", index: parseInt(segments[i + 1], 10) });
      i += 2;
    } else if (segments[i] === "styles") {
      result.push({ type: "styles", key: segments[i + 1] || "" });
      i += 2;
    } else if (segments[i] === "props") {
      result.push({ type: "props", key: segments[i + 1] || "" });
      i += 2;
    } else if (segments[i] === "id") {
      result.push({ type: "id" });
      i += 1;
    } else {
      result.push({ type: "unknown", key: segments[i] });
      i += 1;
    }
  }
  return result;
}

function resolveNodeByPath(tree, pathSegments) {
  let current = tree;
  for (const seg of pathSegments) {
    if (seg.type === "child") {
      if (!current || !Array.isArray(current.children) || !current.children[seg.index]) {
        return null;
      }
      current = current.children[seg.index];
    } else {
      break;
    }
  }
  return current;
}

function convertJsonPatchToOurFormat(patchOps, tree) {
  if (!Array.isArray(patchOps)) return null;
  const operations = [];

  for (const op of patchOps) {
    if (!isJsonPatchOperation(op)) continue;
    const segments = parseJsonPatchPath(op.path);
    const childSegs = segments.filter((s) => s.type === "child");
    const propSeg = segments.find((s) => s.type === "styles" || s.type === "props");

    const targetNode = tree ? resolveNodeByPath(tree, childSegs) : null;
    const targetId = targetNode?.id;

    switch (op.op) {
      case "replace":
      case "add": {
        if (propSeg && targetId) {
          if (propSeg.type === "styles") {
            operations.push({
              type: "updateStyles",
              targetId,
              styles: { [propSeg.key]: op.value },
            });
          } else {
            operations.push({
              type: "updateProps",
              targetId,
              props: { [propSeg.key]: op.value },
            });
          }
        } else if (!propSeg && op.value && isObject(op.value) && targetId) {
          if (childSegs.length > 0 && segments[segments.length - 1]?.type !== "child") {
            const lastChildSeg = childSegs[childSegs.length - 1];
            if (targetNode) {
              operations.push({
                type: "replaceNode",
                targetId,
                node: normalizeRawNode(op.value),
              });
            }
          }
        } else if (!propSeg && op.value && isObject(op.value) && targetId === undefined) {
          const parentId = targetNode?.id || "root";
          operations.push({
            type: "insertNode",
            parentId,
            position: "end",
            node: normalizeRawNode(op.value),
          });
        } else if (targetId) {
          operations.push({
            type: "updateProps",
            targetId,
            props: op.value !== undefined ? { value: op.value } : {},
          });
        }
        break;
      }
      case "remove": {
        if (targetId) {
          operations.push({ type: "deleteNode", targetId });
        }
        break;
      }
      default:
        break;
    }
  }

  return operations.length > 0 ? { version: "1.0", operations } : null;
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

function convertReplaceWithInlineChildren(response) {
  if (!response || !Array.isArray(response.operations)) return response;

  const needsReplaceConversion = response.operations.some(
    (op) => op && typeof op === "object" &&
      op.type === "replace" &&
      (op.target || op.targetId) &&
      Array.isArray(op.children) &&
      op.children.length > 0 &&
      typeof op.children[0] === "object" &&
      typeof op.children[0].type === "string"
  );

  const needsReplaceTreeConversion = response.operations.some(
    (op) => op && typeof op === "object" &&
      (op.type === "replace_tree" || op.type === "replaceTree") &&
      op.tree && typeof op.tree === "object" &&
      typeof op.tree.type === "string"
  );

  if (!needsReplaceConversion && !needsReplaceTreeConversion) return response;

  const newOps = [];
  function flattenChild(child, parentId) {
    if (!child || typeof child !== "object") return;
    const normalized = normalizeRawNode(child);
    newOps.push({
      type: "insertNode",
      parentId,
      position: "end",
      node: { ...normalized, children: [] },
    });
    for (const grandchild of (child.children || [])) {
      flattenChild(grandchild, normalized.id);
    }
  }

  for (const op of response.operations) {
    if (!op || typeof op !== "object") {
      newOps.push(op);
      continue;
    }

    if (op.type === "replace" && Array.isArray(op.children)) {
      const parentId = op.target || op.targetId || "root";
      for (const child of op.children) {
        flattenChild(child, parentId);
      }
    } else if ((op.type === "replace_tree" || op.type === "replaceTree") && op.tree) {
      const root = normalizeRawNode(op.tree);
      newOps.push({
        type: "replaceNode",
        targetId: "root",
        node: { ...root, children: [] },
      });
      for (const child of (op.tree.children || [])) {
        flattenChild(child, root.id);
      }
    } else {
      newOps.push(op);
    }
  }

  response.operations = newOps;
  return response;
}

function mapOperationTypes(response) {
  if (response && Array.isArray(response.operations)) {
    convertReplaceWithInlineChildren(response);

    console.log("[Repair] mapOperationTypes - total operations:", response.operations.length);
    const unsupported = response.operations.filter(op => !SUPPORTED_OPERATION_TYPES.has(op?.type));
    if (unsupported.length > 0) {
      console.log("[Repair] Unsupported operation types found:", unsupported.map(op => op?.type));
    }

    const hasReplaceTree = response.operations.some(op => op?.type === "replace_tree");
    if (hasReplaceTree) {
      console.log("[Repair] replace_tree detected - filtering out redundant create_component operations");
      response.operations = response.operations.filter(op => op?.type !== "create_component" && op?.type !== "addComponent");
    }

    response.operations = response.operations.map((op) => {
      if (!op || typeof op !== "object") return op;

      if (typeof op.type === "string" && !SUPPORTED_OPERATION_TYPES.has(op.type)) {
        if (op.type === "create_component" || op.type === "addComponent" || op.type === "add_child") {
          return convertCreateComponentToInsert(op);
        }
        if (op.type === "replace_tree") {
          return convertReplaceTreeToReplaceNode(op);
        }
        if (looksLikeComponentNode(op)) {
          return convertComponentToInsert(op);
        }
      }

      return op;
    });

    console.log("[Repair] After mapOperationTypes - types:", response.operations.map(op => op?.type));
  }
  return response;
}

function convertReplaceTreeToReplaceNode(op) {
  console.log("[Repair] convertReplaceTreeToReplaceNode - raw op:", JSON.stringify(op, null, 2));
  const tree = isObject(op.tree) ? op.tree
    : isObject(op.node) ? op.node
    : isObject(op.component) ? op.component
    : isObject(op.root) ? op.root
    : null;

  if (!tree) {
    console.log("[Repair] convertReplaceTreeToReplaceNode - no tree found, returning passthrough");
    return op;
  }

  const normalized = isComponentNode(tree)
    ? normalizeRawNode(tree)
    : { id: "root", type: "root", props: {}, styles: {}, children: tree.children ? tree.children.map(normalizeRawNode) : [] };

  const converted = {
    type: "replaceNode",
    targetId: "root",
    node: normalized,
  };
  console.log("[Repair] convertReplaceTreeToReplaceNode - converted:", JSON.stringify(converted, null, 2).substring(0, 500));
  return converted;
}

function looksLikeComponentNode(op) {
  return (
    typeof op.type === "string" &&
    (SUPPORTED_COMPONENT_TYPES.has(op.type) || COMPONENT_TYPE_MAP[op.type.toLowerCase()]) &&
    (typeof op.id === "string" || isObject(op.props) || isObject(op.styles) || Array.isArray(op.children))
  );
}

function convertCreateComponentToInsert(op) {
  console.log("[Repair] convertCreateComponentToInsert - raw op:", JSON.stringify(op, null, 2));
  const component = isObject(op.component) ? op.component : {};
  const node = isObject(op.node) ? op.node : {};

  const nodeId = typeof node.id === "string" ? node.id
    : typeof component.id === "string" ? component.id
    : typeof op.id === "string" ? op.id
    : generateId();
  const nodeType = typeof node.type === "string" ? node.type
    : typeof component.type === "string" ? component.type
    : typeof op.componentType === "string" ? op.componentType
    : "container";
  const parentId = typeof op.parentId === "string" ? op.parentId
    : typeof node.parentId === "string" ? node.parentId
    : typeof component.parentId === "string" ? component.parentId
    : typeof op.targetId === "string" ? op.targetId
    : typeof op.target === "string" ? op.target
    : "root";
  const position = typeof op.position === "string" ? op.position
    : typeof node.position === "string" ? node.position
    : typeof op.index === "number" ? "end"
    : "end";

  const nodeProps = isObject(node.props) ? node.props
    : isObject(component.props) ? component.props
    : isObject(op.props) ? op.props
    : {};
  const nodeStyles = isObject(node.styles) ? node.styles
    : isObject(component.styles) ? component.styles
    : isObject(op.styles) ? op.styles
    : {};
  const nodeChildren = Array.isArray(node.children) ? node.children
    : Array.isArray(component.children) ? component.children
    : Array.isArray(op.children) ? op.children
    : [];

  const converted = {
    type: "insertNode",
    parentId,
    position,
    node: {
      id: nodeId,
      type: mapComponentType(nodeType),
      props: nodeProps,
      styles: nodeStyles,
      children: nodeChildren.map(child => isComponentNode(child) ? normalizeRawNode(child) : child),
    },
  };
  console.log("[Repair] convertCreateComponentToInsert - converted:", JSON.stringify(converted, null, 2));
  return converted;
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
  const normalized = {
    id: typeof node.id === "string" ? node.id : generateId(),
    type: mapComponentType(node.type),
    props: isObject(node.props) ? node.props : {},
    styles: isObject(node.styles) ? node.styles : {},
    children: Array.isArray(node.children)
      ? node.children.map(normalizeRawNode)
      : [],
  };
  return normalizeTextInChildren(normalized);
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
      if (!op.targetId) op.targetId = "root";
      if (!isObject(op.props)) op.props = {};
    } else if (op.type === "updateStyles") {
      if (!op.targetId) op.targetId = "root";
      if (!isObject(op.styles)) op.styles = {};
    } else if (op.type === "replaceNode") {
      if (!op.targetId) op.targetId = "root";
      if (!op.node || typeof op.node !== "object") {
        op.node = defaultNode();
      }
    } else if (op.type === "deleteNode") {
      if (!op.targetId) op.targetId = "root";
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

  let result;
  try {
    result = typeof response === "string" ? JSON.parse(response) : response;
  } catch {
    return {
      repaired: false,
      valid: false,
      repairLevel: REPAIR_LEVEL.CRITICAL,
      repairedFields: [],
      warnings: ["Failed to parse response as JSON"],
      score: 0,
      errors: validationErrors,
      response: null,
    };
  }

  if (result && typeof result === "object" && isJsonPatchOperation(result)) {
    const converted = convertJsonPatchToOurFormat([result], context.componentTree);
    if (converted) {
      result = converted;
      validationErrors = validationErrors.filter(
        (e) => e.kind !== "response-extra-key" &&
               e.kind !== "operations-not-array" &&
               e.kind !== "business-operations-required" &&
               e.kind !== "business-operations-not-array"
      );
    }
  } else if (result && Array.isArray(result) && result.length > 0 && result.every(isJsonPatchOperation)) {
    const converted = convertJsonPatchToOurFormat(result, context.componentTree);
    if (converted) {
      result = converted;
      validationErrors = validationErrors.filter(
        (e) => e.kind !== "response-extra-key" &&
               e.kind !== "operations-not-array" &&
               e.kind !== "business-operations-required" &&
               e.kind !== "business-operations-not-array"
      );
    }
  } else if (result && typeof result === "object" && !Array.isArray(result) && !result.operations) {
    const opType = result.operation || result.type;
    const hasContent = isObject(result.styles) || isObject(result.props) || result.node || result.component;
    const targetId = result.nodeId || result.targetId || result.id || result.target;

    if (typeof opType === "string" && hasContent) {
      const op = {
        type: opType,
        ...(targetId ? { targetId } : {}),
        ...(isObject(result.styles) ? { styles: result.styles } : {}),
        ...(isObject(result.props) ? { props: result.props } : {}),
        ...(result.node ? { node: result.node } : {}),
        ...(result.position ? { position: result.position } : {}),
      };
      result = { version: "1.0", operations: [op] };
      validationErrors = validationErrors.filter(
        (e) => e.kind !== "response-extra-key" &&
               e.kind !== "operations-not-array" &&
               e.kind !== "business-operations-required" &&
               e.kind !== "business-operations-not-array"
      );
    }
  } else if (result && typeof result === "object" && Array.isArray(result.operation)) {
    const ops = result.operation.map((op) => {
      if (!op || typeof op !== "object") return op;
      const opType = op.operation || op.type;
      const tid = op.nodeId || op.targetId || op.id || op.target;
      const out = { type: opType };
      if (tid) out.targetId = tid;
      if (isObject(op.styles)) out.styles = op.styles;
      if (isObject(op.props)) out.props = op.props;
      if (op.node) out.node = op.node;
      if (op.parentId) out.parentId = op.parentId;
      if (op.position) out.position = op.position;
      return out;
    });
    result = { version: "1.0", operations: ops };
    validationErrors = validationErrors.filter(
      (e) => e.kind !== "response-extra-key" &&
             e.kind !== "operations-not-array" &&
             e.kind !== "business-operations-required" &&
             e.kind !== "business-operations-not-array"
    );
  }
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
