import aiPatchSchema from "./patchSchema";

const supportedOperationTypes = new Set(
  aiPatchSchema.schema.properties.operations.items.oneOf.map(
    (operation) => operation.properties.type.const
  )
);

const supportedComponentTypes = new Set(
  aiPatchSchema.schema.$defs.componentNode.properties.type.enum
);

const COMPONENT_TYPE_ALIASES = {
  title: "heading",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  header: "heading",
  subtitle: "text",
  description: "text",
  body: "text",
  content: "text",
  paragraph: "text",
  label: "text",
  span: "text",
  p: "text",
  btn: "button",
  cta: "button",
  action: "button",
  link: "button",
  anchor: "button",
  img: "image",
  picture: "image",
  svg: "image",
  textarea: "input",
  field: "input",
  formField: "input",
  panel: "card",
  tile: "card",
  box: "card",
  feature: "card",
  div: "container",
  section: "container",
  hero: "container",
  navbar: "container",
  nav: "container",
  navigation: "container",
  footer: "container",
  wrapper: "container",
  layout: "container",
  flex: "container",
  grid: "container",
  list: "container",
  form: "container",
  table: "container",
  row: "container",
  col: "container",
  h4: "heading",
  h5: "heading",
  h6: "heading",
};

function normalizeComponentType(type) {
  if (!type || typeof type !== "string") return "container";
  if (supportedComponentTypes.has(type)) return type;
  const lower = String(type).toLowerCase();
  if (supportedComponentTypes.has(lower)) return lower;
  if (COMPONENT_TYPE_ALIASES[lower]) return COMPONENT_TYPE_ALIASES[lower];
  return "container";
}

export const ValidationErrorCode = Object.freeze({
  SCHEMA: "VALIDATION_SCHEMA_ERROR",
  BUSINESS: "VALIDATION_BUSINESS_ERROR",
  REGISTRY: "VALIDATION_REGISTRY_ERROR",
  PATCH: "VALIDATION_PATCH_ERROR",
});

export const ValidationErrorKind = Object.freeze({
  // Schema (response / operation shape)
  RESPONSE_NOT_OBJECT: "response-not-object",
  RESPONSE_EXTRA_KEY: "response-extra-key",
  VERSION_MISMATCH: "version-mismatch",
  OPERATIONS_NOT_ARRAY: "operations-not-array",
  OP_NOT_OBJECT: "op-not-object",
  OP_TYPE_UNSUPPORTED: "op-type-unsupported",
  OP_EXTRA_KEY: "op-extra-key",
  OP_MISSING_REQUIRED: "op-missing-required",
  OP_TARGET_ID_TYPE: "op-target-id-type",
  OP_PARENT_ID_TYPE: "op-parent-id-type",
  OP_PROPS_TYPE: "op-props-type",
  OP_STYLES_TYPE: "op-styles-type",
  OP_POSITION_INVALID: "op-position-invalid",
  // Schema (node shape)
  NODE_NOT_OBJECT: "node-not-object",
  NODE_EXTRA_KEY: "node-extra-key",
  NODE_ID_TYPE: "node-id-type",
  NODE_TYPE_UNSUPPORTED: "node-type-unsupported",
  NODE_PROPS_TYPE: "node-props-type",
  NODE_STYLES_TYPE: "node-styles-type",
  NODE_CHILDREN_TYPE: "node-children-type",
  // Business rules
  BUSINESS_VERSION_REQUIRED: "business-version-required",
  BUSINESS_OPERATIONS_REQUIRED: "business-operations-required",
  BUSINESS_OPERATIONS_NOT_ARRAY: "business-operations-not-array",
  BUSINESS_OP_TYPE_UNSUPPORTED: "business-op-type-unsupported",
  // Registry
  REGISTRY_TYPE_UNREGISTERED: "registry-type-unregistered",
  // Patch application (stateful)
  PATCH_TREE_REQUIRED: "patch-tree-required",
  PATCH_TREE_DUPLICATE_ID: "patch-tree-duplicate-id",
  PATCH_TARGET_MISSING: "patch-target-missing",
  PATCH_TARGET_DELETED: "patch-target-deleted",
  PATCH_DUPLICATE_UPDATE: "patch-duplicate-update",
  PATCH_PARENT_MISSING: "patch-parent-missing",
  PATCH_NODE_DUPLICATE_ID: "patch-node-duplicate-id",
  PATCH_NODE_ALREADY_EXISTS: "patch-node-already-exists",
  PATCH_CANNOT_DELETE_ROOT: "patch-cannot-delete-root",
  PATCH_TERMINAL_CONFLICT: "patch-terminal-conflict",
  PATCH_REPLACEMENT_ID_EXISTS: "patch-replacement-id-exists",
});

export function getSupportedComponentTypes() {
  return supportedComponentTypes;
}

function parsePath(path) {
  if (!path) return [];
  return path.split(".").map((segment) => {
    const match = segment.match(/^(.+)\[(\d+)\]$/);
    return match ? { key: match[1], index: Number(match[2]) } : { key: segment };
  });
}

function createError(code, kind, message, path) {
  return { code, kind, message, path: path || null, pathParts: parsePath(path) };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateNodeSchema(node, path, errors) {
  if (!isObject(node)) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.NODE_NOT_OBJECT,
        `${path} must be an object.`,
        path
      )
    );
    return;
  }

  const allowedKeys = new Set(["id", "type", "props", "styles", "children"]);
  Object.keys(node).forEach((key) => {
    if (!allowedKeys.has(key)) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.NODE_EXTRA_KEY,
          `${path}.${key} is not allowed.`,
          `${path}.${key}`
        )
      );
    }
  });

  if (typeof node.id !== "string") {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.NODE_ID_TYPE,
        `${path}.id must be a string.`,
        `${path}.id`
      )
    );
  }

  if (!supportedComponentTypes.has(node.type)) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.NODE_TYPE_UNSUPPORTED,
        `${path}.type is not supported.`,
        `${path}.type`
      )
    );
  }

  if (!isObject(node.props)) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.NODE_PROPS_TYPE,
        `${path}.props must be an object.`,
        `${path}.props`
      )
    );
  }

  if (!isObject(node.styles)) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.NODE_STYLES_TYPE,
        `${path}.styles must be an object.`,
        `${path}.styles`
      )
    );
  }

  if (!Array.isArray(node.children)) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.NODE_CHILDREN_TYPE,
        `${path}.children must be an array.`,
        `${path}.children`
      )
    );
    return;
  }

  node.children.forEach((child, index) => {
    validateNodeSchema(child, `${path}.children[${index}]`, errors);
  });
}

export function validateSchema(response) {
  const errors = [];
  const rootSchema = aiPatchSchema.schema;

  if (!isObject(response)) {
    return [
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.RESPONSE_NOT_OBJECT,
        "Response must be an object.",
        "response"
      ),
    ];
  }

  Object.keys(response).forEach((key) => {
    if (!(key in rootSchema.properties)) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.RESPONSE_EXTRA_KEY,
          `Response property "${key}" is not allowed.`,
          `response.${key}`
        )
      );
    }
  });

  if (response.version !== rootSchema.properties.version.const) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.VERSION_MISMATCH,
        `Response.version must be "${rootSchema.properties.version.const}".`,
        "response.version"
      )
    );
  }

  if (!Array.isArray(response.operations)) {
    errors.push(
      createError(
        ValidationErrorCode.SCHEMA,
        ValidationErrorKind.OPERATIONS_NOT_ARRAY,
        "Response.operations must be an array.",
        "response.operations"
      )
    );
    return errors;
  }

  const operationSchemas = rootSchema.properties.operations.items.oneOf;

  response.operations.forEach((operation, index) => {
    const path = `operations[${index}]`;

    if (!isObject(operation)) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_NOT_OBJECT,
          `${path} must be an object.`,
          path
        )
      );
      return;
    }

    const operationSchema = operationSchemas.find(
      (schema) => schema.properties.type.const === operation.type
    );

    if (!operationSchema) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_TYPE_UNSUPPORTED,
          `${path}.type is not supported.`,
          `${path}.type`
        )
      );
      return;
    }

    Object.keys(operation).forEach((key) => {
      if (!(key in operationSchema.properties)) {
        errors.push(
          createError(
            ValidationErrorCode.SCHEMA,
            ValidationErrorKind.OP_EXTRA_KEY,
            `${path}.${key} is not allowed.`,
            `${path}.${key}`
          )
        );
      }
    });

    operationSchema.required.forEach((key) => {
      if (!(key in operation)) {
        errors.push(
          createError(
            ValidationErrorCode.SCHEMA,
            ValidationErrorKind.OP_MISSING_REQUIRED,
            `${path}.${key} is required.`,
            `${path}.${key}`
          )
        );
      }
    });

    if ("targetId" in operation && typeof operation.targetId !== "string") {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_TARGET_ID_TYPE,
          `${path}.targetId must be a string.`,
          `${path}.targetId`
        )
      );
    }

    if ("parentId" in operation && typeof operation.parentId !== "string") {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_PARENT_ID_TYPE,
          `${path}.parentId must be a string.`,
          `${path}.parentId`
        )
      );
    }

    if ("props" in operation && !isObject(operation.props)) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_PROPS_TYPE,
          `${path}.props must be an object.`,
          `${path}.props`
        )
      );
    }

    if ("styles" in operation && !isObject(operation.styles)) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_STYLES_TYPE,
          `${path}.styles must be an object.`,
          `${path}.styles`
        )
      );
    }

    if (
      "position" in operation &&
      !["start", "end"].includes(operation.position)
    ) {
      errors.push(
        createError(
          ValidationErrorCode.SCHEMA,
          ValidationErrorKind.OP_POSITION_INVALID,
          `${path}.position must be "start" or "end".`,
          `${path}.position`
        )
      );
    }

    if ("node" in operation) {
      validateNodeSchema(operation.node, `${path}.node`, errors);
    }
  });

  return errors;
}

export function validateBusinessRules(patch) {
  const errors = [];

  if (!patch?.version) {
    errors.push(
      createError(
        ValidationErrorCode.BUSINESS,
        ValidationErrorKind.BUSINESS_VERSION_REQUIRED,
        "Patch version is required.",
        "response.version"
      )
    );
  }

  if (!("operations" in (patch ?? {}))) {
    errors.push(
      createError(
        ValidationErrorCode.BUSINESS,
        ValidationErrorKind.BUSINESS_OPERATIONS_REQUIRED,
        "Patch operations are required.",
        "response.operations"
      )
    );
  } else if (!Array.isArray(patch.operations)) {
    errors.push(
      createError(
        ValidationErrorCode.BUSINESS,
        ValidationErrorKind.BUSINESS_OPERATIONS_NOT_ARRAY,
        "Patch operations must be an array.",
        "response.operations"
      )
    );
  }

  for (const operation of patch?.operations ?? []) {
    if (operation && !supportedOperationTypes.has(operation.type)) {
      errors.push(
        createError(
          ValidationErrorCode.BUSINESS,
          ValidationErrorKind.BUSINESS_OP_TYPE_UNSUPPORTED,
          `Unsupported operation type: ${operation.type}.`,
          "response.operations"
        )
      );
    }
  }

  return errors;
}

function getRegistryTypes(registry) {
  if (Array.isArray(registry)) {
    return new Set(registry);
  }
  if (registry && typeof registry === "object") {
    return new Set(Object.keys(registry));
  }
  return new Set();
}

function validateRegistryNode(node, registryTypes, path, errors) {
  if (!registryTypes.has(node.type)) {
    errors.push(
      createError(
        ValidationErrorCode.REGISTRY,
        ValidationErrorKind.REGISTRY_TYPE_UNREGISTERED,
        `${path}.type "${node.type}" is not registered.`,
        `${path}.type`
      )
    );
  }

  for (const [index, child] of (node.children ?? []).entries()) {
    validateRegistryNode(
      child,
      registryTypes,
      `${path}.children[${index}]`,
      errors
    );
  }
}

export function validateRegistry(patch, registry) {
  const errors = [];
  const registryTypes = getRegistryTypes(registry);

  for (const [index, operation] of (patch?.operations ?? []).entries()) {
    if (operation?.type === "insertNode" || operation?.type === "replaceNode") {
      validateRegistryNode(
        operation.node,
        registryTypes,
        `operations[${index}].node`,
        errors
      );
    }
  }

  return errors;
}

function addNodeToIndex(node, nodeIndex, duplicates) {
  if (nodeIndex.has(node.id)) {
    duplicates.add(node.id);
    return;
  }

  nodeIndex.set(node.id, node);

  for (const child of node.children ?? []) {
    addNodeToIndex(child, nodeIndex, duplicates);
  }
}

function getSubtreeIds(node, ids = new Set()) {
  if (!node) {
    return ids;
  }

  ids.add(node.id);

  for (const child of node.children ?? []) {
    getSubtreeIds(child, ids);
  }

  return ids;
}

function removeSubtreeFromIndex(node, nodeIndex) {
  for (const id of getSubtreeIds(node)) {
    nodeIndex.delete(id);
  }
}

function hasDuplicateProperties(operation, updatedProperties) {
  const propertyGroup =
    operation.type === "updateProps" ? operation.props : operation.styles;
  const groupName = operation.type === "updateProps" ? "props" : "styles";

  return Object.keys(propertyGroup ?? {}).filter((property) => {
    const propertyKey = `${groupName}:${operation.targetId}:${property}`;

    if (updatedProperties.has(propertyKey)) {
      return true;
    }

    updatedProperties.add(propertyKey);
    return false;
  });
}

export function validatePatch(patch, componentTree, strategy) {
  const errors = [];
  const isFullGeneration = strategy === "FULL_GENERATION";

  if (!componentTree) {
    return [
      createError(
        ValidationErrorCode.PATCH,
        ValidationErrorKind.PATCH_TREE_REQUIRED,
        "A component tree is required for patch validation.",
        "response.operations"
      ),
    ];
  }

  const nodeIndex = new Map();
  const existingDuplicates = new Set();
  addNodeToIndex(componentTree, nodeIndex, existingDuplicates);

  existingDuplicates.forEach((id) => {
    errors.push(
      createError(
        ValidationErrorCode.PATCH,
        ValidationErrorKind.PATCH_TREE_DUPLICATE_ID,
        `Component tree contains duplicate ID "${id}".`,
        "response.operations"
      )
    );
  });

  const deletedIds = new Set();
  const updatedProperties = new Set();
  const terminalOperations = new Set();

  for (const [index, operation] of (patch?.operations ?? []).entries()) {
    const path = `operations[${index}]`;
    const targetId = operation?.targetId;
    const requiresTarget = [
      "updateProps",
      "updateStyles",
      "deleteNode",
      "replaceNode",
    ].includes(operation?.type);

    if (requiresTarget && !nodeIndex.has(targetId)) {
      const reason = deletedIds.has(targetId)
        ? "was deleted by an earlier operation"
        : "does not exist";
      errors.push(
        createError(
          ValidationErrorCode.PATCH,
          deletedIds.has(targetId)
            ? ValidationErrorKind.PATCH_TARGET_DELETED
            : ValidationErrorKind.PATCH_TARGET_MISSING,
          `${path}.targetId "${targetId}" ${reason}.`,
          `${path}.targetId`
        )
      );
      continue;
    }

    if (operation.type === "updateProps" || operation.type === "updateStyles") {
      const duplicateProperties = hasDuplicateProperties(
        operation,
        updatedProperties
      );

      duplicateProperties.forEach((property) => {
        errors.push(
          createError(
            ValidationErrorCode.PATCH,
            ValidationErrorKind.PATCH_DUPLICATE_UPDATE,
            `${path} duplicates an earlier update for "${property}" on "${targetId}".`,
            path
          )
        );
      });
    }

    if (operation.type === "insertNode") {
      const parentId = operation.parentId;
      const parentExistsInTree = nodeIndex.has(parentId);
      const parentIsRoot = parentId === componentTree.id || parentId === "root";

      if (!parentExistsInTree && !parentIsRoot) {
        if (isFullGeneration) {
          errors.push(
            createError(
              ValidationErrorCode.PATCH,
              ValidationErrorKind.PATCH_PARENT_MISSING,
              `${path}.parentId "${parentId}" does not exist in the component tree or earlier operations.`,
              `${path}.parentId`
            )
          );
          continue;
        } else {
          errors.push(
            createError(
              ValidationErrorCode.PATCH,
              ValidationErrorKind.PATCH_PARENT_MISSING,
              `${path}.parentId "${parentId}" does not exist.`,
              `${path}.parentId`
            )
          );
          continue;
        }
      }

      const insertedNodes = new Map();
      const insertedDuplicates = new Set();
      addNodeToIndex(operation.node, insertedNodes, insertedDuplicates);

      insertedDuplicates.forEach((id) => {
        errors.push(
          createError(
            ValidationErrorCode.PATCH,
            ValidationErrorKind.PATCH_NODE_DUPLICATE_ID,
            `${path}.node contains duplicate ID "${id}".`,
            `${path}.node`
          )
        );
      });

      insertedNodes.forEach((_, id) => {
        if (nodeIndex.has(id)) {
          errors.push(
            createError(
              ValidationErrorCode.PATCH,
              ValidationErrorKind.PATCH_NODE_ALREADY_EXISTS,
              `${path}.node ID "${id}" already exists.`,
              `${path}.node`
            )
          );
        }
      });

      if (!insertedDuplicates.size) {
        insertedNodes.forEach((node, id) => {
          if (!nodeIndex.has(id)) {
            nodeIndex.set(id, node);
          }
        });
      }
    }

    if (operation.type === "deleteNode") {
      if (targetId === componentTree.id) {
        errors.push(
          createError(
            ValidationErrorCode.PATCH,
            ValidationErrorKind.PATCH_CANNOT_DELETE_ROOT,
            `${path} cannot delete the root component.`,
            `${path}.targetId`
          )
        );
        continue;
      }

      if (terminalOperations.has(targetId)) {
        errors.push(
          createError(
            ValidationErrorCode.PATCH,
            ValidationErrorKind.PATCH_TERMINAL_CONFLICT,
            `${path} conflicts with an earlier terminal operation.`,
            path
          )
        );
        continue;
      }

      const targetNode = nodeIndex.get(targetId);
      const removedIds = getSubtreeIds(targetNode);

      removedIds.forEach((id) => {
        deletedIds.add(id);
      });
      removeSubtreeFromIndex(targetNode, nodeIndex);
      terminalOperations.add(targetId);
    }

    if (operation.type === "replaceNode") {
      if (terminalOperations.has(targetId)) {
        errors.push(
          createError(
            ValidationErrorCode.PATCH,
            ValidationErrorKind.PATCH_TERMINAL_CONFLICT,
            `${path} conflicts with an earlier terminal operation.`,
            path
          )
        );
        continue;
      }

      const replacementNodes = new Map();
      const replacementDuplicates = new Set();
      addNodeToIndex(operation.node, replacementNodes, replacementDuplicates);

      replacementDuplicates.forEach((id) => {
        errors.push(
          createError(
            ValidationErrorCode.PATCH,
            ValidationErrorKind.PATCH_NODE_DUPLICATE_ID,
            `${path}.node contains duplicate ID "${id}".`,
            `${path}.node`
          )
        );
      });

      const replacedNode = nodeIndex.get(targetId);
      const replacedIds = getSubtreeIds(replacedNode);

      replacementNodes.forEach((_, id) => {
        if (nodeIndex.has(id) && !replacedIds.has(id)) {
          errors.push(
            createError(
              ValidationErrorCode.PATCH,
              ValidationErrorKind.PATCH_REPLACEMENT_ID_EXISTS,
              `${path}.node ID "${id}" already exists.`,
              `${path}.node`
            )
          );
        }
      });

      if (!replacementDuplicates.size) {
        removeSubtreeFromIndex(replacedNode, nodeIndex);
        replacementNodes.forEach((node, id) => {
          nodeIndex.set(id, node);
        });
      }

      terminalOperations.add(targetId);
    }
  }

  return errors;
}

function normalizeNode(node) {
  if (!node || typeof node !== "object") return node;
  return {
    id: String(node.id || `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    type: normalizeComponentType(node.type),
    props: isObject(node.props) ? node.props : {},
    styles: isObject(node.styles) ? node.styles : {},
    children: Array.isArray(node.children) ? node.children.map(normalizeNode) : [],
  };
}

function convertJsonPatchOpFields(op) {
  if (typeof op.path !== "string" || op.path === "") return op;
  if (!("value" in op) && op.op !== "remove") return op;

  const segments = op.path.split("/").filter(Boolean);
  let childIndex = null;
  let propType = null;
  let propKey = null;
  const childIndices = [];

  for (let i = 0; i < segments.length; i++) {
    if (segments[i] === "children" && i + 1 < segments.length && /^\d+$/.test(segments[i + 1])) {
      childIndices.push(parseInt(segments[i + 1], 10));
      i++;
    } else if (segments[i] === "styles" && i + 1 < segments.length) {
      propType = "styles";
      propKey = segments[i + 1];
      break;
    } else if (segments[i] === "props" && i + 1 < segments.length) {
      propType = "props";
      propKey = segments[i + 1];
      break;
    }
  }

  if (childIndices.length > 0) {
    childIndex = childIndices[childIndices.length - 1];
  }

  const result = { ...op };
  delete result.path;

  if (childIndex !== null && !result.targetId) {
    result.targetId = `node-${childIndex}`;
  }

  if (propType && propKey && "value" in result) {
    if (propType === "styles") {
      result.type = "updateStyles";
      result.styles = { [propKey]: result.value };
      delete result.value;
    } else {
      result.type = "updateProps";
      result.props = { [propKey]: result.value };
      delete result.value;
    }
  } else if (result.op === "remove" || result.type === "remove" || result.type === "deleteNode") {
    result.type = "deleteNode";
  }

  if (result.op) {
    delete result.op;
  }

  return result;
}

function normalizeOperation(op) {
  const normalized = { ...op };

  if (typeof normalized.nodeId === "string" && !normalized.targetId) {
    normalized.targetId = normalized.nodeId;
    delete normalized.nodeId;
  }

  if (typeof normalized.operation === "string" && !normalized.type) {
    normalized.type = normalized.operation;
    delete normalized.operation;
  }

  if (!normalized.type && normalized.op) {
    normalized.type = normalized.op;
    delete normalized.op;
  }

  if (normalized.component && !normalized.node && (normalized.type === "insertNode" || normalized.type === "replaceNode")) {
    normalized.node = normalized.component;
    delete normalized.component;
  }

  if (typeof normalized.path === "string" && normalized.path.includes("/")) {
    Object.assign(normalized, convertJsonPatchOpFields(normalized));
  }

  const typeMap = {
    removeNode: "deleteNode",
    addNode: "insertNode",
    addChild: "insertNode",
    add_child: "insertNode",
    child: "insertNode",
    add: "insertNode",
    create: "insertNode",
    create_component: "insertNode",
    addComponent: "insertNode",
    component: "insertNode",
    update: "updateProps",
    modify: "updateStyles",
    replace: "replaceNode",
    delete: "deleteNode",
    remove: "deleteNode",
    style: "updateStyles",
    change: "updateStyles",
    set: "updateProps",
    edit: "updateProps",
    updateStyle: "updateStyles",
    updateStyles: "updateStyles",
    updateProp: "updateProps",
    updateProps: "updateProps",
    changeStyle: "updateStyles",
    changeStyles: "updateStyles",
    setStyle: "updateStyles",
    setStyles: "updateStyles",
    insert: "insertNode",
    destroy: "deleteNode",
    patch: "replaceNode",
    replace_tree: "replaceNode",
    replaceTree: "replaceNode",
  };

  if (typeMap[normalized.type]) {
    normalized.type = typeMap[normalized.type];
  }

  if (normalized.type === "insertNode") {
    if (normalized.component && !normalized.node) {
      normalized.node = normalized.component;
      delete normalized.component;
    }

    if (normalized.target && !normalized.parentId) {
      normalized.parentId = normalized.target;
      delete normalized.target;
    }
    if (normalized.targetId && !normalized.parentId) {
      normalized.parentId = normalized.targetId;
      delete normalized.targetId;
    }
    if (!normalized.position) {
      normalized.position = "end";
    }
    if (normalized.position === "inside") {
      normalized.position = "end";
    }
    if (normalized.node) {
      normalized.node = normalizeNode(normalized.node);
    }
  } else {
    if (!normalized.targetId) {
      if (normalized.id && normalized.type !== "insertNode") {
        normalized.targetId = normalized.id;
        delete normalized.id;
      } else if (normalized.target) {
        normalized.targetId = normalized.target;
        delete normalized.target;
      }
    }
  }

  if (normalized.type === "insertNode" && normalized.index !== undefined) {
    delete normalized.index;
    if (!normalized.position) {
      normalized.position = "end";
    }
  }

  const allowedOps = {
    insertNode: ["type", "parentId", "position", "node"],
    updateProps: ["type", "targetId", "props"],
    updateStyles: ["type", "targetId", "styles"],
    deleteNode: ["type", "targetId"],
    replaceNode: ["type", "targetId", "node"],
  };

  if (allowedOps[normalized.type]) {
    const clean = {};
    for (const key of allowedOps[normalized.type]) {
      if (normalized[key] !== undefined) {
        clean[key] = normalized[key];
      }
    }
    return clean;
  }

  return normalized;
}

function looksLikeFlatOperation(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const hasOp = typeof obj.operation === "string" || typeof obj.type === "string";
  const hasContent = isObject(obj.styles) || isObject(obj.props) || obj.node || obj.component;
  const hasId = typeof obj.nodeId === "string" || typeof obj.targetId === "string" || typeof obj.id === "string" || typeof obj.target === "string";
  const noOpsArray = !Array.isArray(obj.operations);
  return hasOp && hasContent && noOpsArray;
}

function normalizeResponse(response) {
  if (!response || typeof response !== "object") {
    return response;
  }

  if (Array.isArray(response)) {
    const ops = response.map(normalizeOperation);
    return { version: "1.0", operations: ops };
  }

  if (typeof response.op === "string" && typeof response.path === "string") {
    return { version: "1.0", operations: [normalizeOperation(response)] };
  }

  if (Array.isArray(response.operation)) {
    const ops = response.operation.map(normalizeOperation);
    return { version: "1.0", operations: ops };
  }

  if (typeof response.operation === "string" || looksLikeFlatOperation(response)) {
    return { version: "1.0", operations: [normalizeOperation(response)] };
  }

  if (typeof response.nodeId === "string" || typeof response.targetId === "string") {
    if (!Array.isArray(response.operations)) {
      return { version: "1.0", operations: [normalizeOperation(response)] };
    }
  }

  const normalized = { ...response };

  if (!normalized.version) {
    normalized.version = "1.0";
  }

  if (Array.isArray(normalized.operations)) {
    normalized.operations = normalized.operations.map(normalizeOperation);
  }

  return normalized;
}

export function validateResponse(response, { componentTree, registry, strategy } = {}) {
  const normalized = normalizeResponse(response);

  console.log("[Validator] validateResponse - normalized operations:", normalized?.operations?.length, "types:", normalized?.operations?.map(op => op?.type));

  const errors = [
    ...validateSchema(normalized),
    ...validateBusinessRules(normalized),
  ];

  if (errors.length > 0) {
    console.log("[Validator] Schema/business errors:", errors.map(e => `${e.kind}: ${e.message}`));
    return {
      success: false,
      patch: null,
      errors,
    };
  }

  if (registry) {
    const registryErrors = validateRegistry(normalized, registry);
    if (registryErrors.length > 0) {
      console.log("[Validator] Registry errors:", registryErrors.map(e => `${e.kind}: ${e.message}`));
    }
    errors.push(...registryErrors);
  }

  const patchErrors = validatePatch(normalized, componentTree, strategy);
  if (patchErrors.length > 0) {
    console.log("[Validator] Patch errors:", patchErrors.map(e => `${e.kind}: ${e.message}`));
  }
  errors.push(...patchErrors);

  console.log("[Validator] Final result:", { success: errors.length === 0, errorsCount: errors.length });

  return {
    success: errors.length === 0,
    patch: errors.length === 0 ? normalized : null,
    errors,
  };
}
