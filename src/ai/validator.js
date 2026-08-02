import aiPatchSchema from "./patchSchema";

const supportedOperationTypes = new Set(
  aiPatchSchema.schema.properties.operations.items.oneOf.map(
    (operation) => operation.properties.type.const
  )
);

const supportedComponentTypes = new Set(
  aiPatchSchema.schema.$defs.componentNode.properties.type.enum
);

export const ValidationErrorCode = Object.freeze({
  SCHEMA: "VALIDATION_SCHEMA_ERROR",
  BUSINESS: "VALIDATION_BUSINESS_ERROR",
  REGISTRY: "VALIDATION_REGISTRY_ERROR",
  PATCH: "VALIDATION_PATCH_ERROR",
});

function createError(code, message) {
  return { code, message };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateNodeSchema(node, path, errors) {
  if (!isObject(node)) {
    errors.push(createError(ValidationErrorCode.SCHEMA, `${path} must be an object.`));
    return;
  }

  const allowedKeys = new Set(["id", "type", "props", "styles", "children"]);
  Object.keys(node).forEach((key) => {
    if (!allowedKeys.has(key)) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.${key} is not allowed.`));
    }
  });

  if (typeof node.id !== "string") {
    errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.id must be a string.`));
  }

  if (!supportedComponentTypes.has(node.type)) {
    errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.type is not supported.`));
  }

  if (!isObject(node.props)) {
    errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.props must be an object.`));
  }

  if (!isObject(node.styles)) {
    errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.styles must be an object.`));
  }

  if (!Array.isArray(node.children)) {
    errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.children must be an array.`));
    return;
  }

  node.children.forEach((child, index) => {
    validateNodeSchema(child, `${path}.children[${index}]`, errors);
  });
}

export function validateSchema(response) {
  const errors = [];
  const rootSchema = aiPatchSchema.schema;

  if (!isObject(response) && typeof response !== "object") {
    return [createError(ValidationErrorCode.SCHEMA, "Response must be an object.")];
  }

  if (!isObject(response)) {
    return [createError(ValidationErrorCode.SCHEMA, "Response must be an object.")];
  }

  Object.keys(response).forEach((key) => {
    if (!(key in rootSchema.properties)) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `Response property "${key}" is not allowed.`));
    }
  });

  if (response.version !== rootSchema.properties.version.const) {
    errors.push(createError(ValidationErrorCode.SCHEMA, `Response.version must be "${rootSchema.properties.version.const}".`));
  }

  if (!Array.isArray(response.operations)) {
    errors.push(createError(ValidationErrorCode.SCHEMA, "Response.operations must be an array."));
    return errors;
  }

  const operationSchemas = rootSchema.properties.operations.items.oneOf;

  response.operations.forEach((operation, index) => {
    const path = `operations[${index}]`;

    if (!isObject(operation)) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path} must be an object.`));
      return;
    }

    const operationSchema = operationSchemas.find(
      (schema) => schema.properties.type.const === operation.type
    );

    if (!operationSchema) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.type is not supported.`));
      return;
    }

    Object.keys(operation).forEach((key) => {
      if (!(key in operationSchema.properties)) {
        errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.${key} is not allowed.`));
      }
    });

    operationSchema.required.forEach((key) => {
      if (!(key in operation)) {
        errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.${key} is required.`));
      }
    });

    if ("targetId" in operation && typeof operation.targetId !== "string") {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.targetId must be a string.`));
    }

    if ("parentId" in operation && typeof operation.parentId !== "string") {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.parentId must be a string.`));
    }

    if ("props" in operation && !isObject(operation.props)) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.props must be an object.`));
    }

    if ("styles" in operation && !isObject(operation.styles)) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.styles must be an object.`));
    }

    if (
      "position" in operation &&
      !["start", "end"].includes(operation.position)
    ) {
      errors.push(createError(ValidationErrorCode.SCHEMA, `${path}.position must be "start" or "end".`));
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
    errors.push(createError(ValidationErrorCode.BUSINESS, "Patch version is required."));
  }

  if (!("operations" in (patch ?? {}))) {
    errors.push(createError(ValidationErrorCode.BUSINESS, "Patch operations are required."));
  } else if (!Array.isArray(patch.operations)) {
    errors.push(createError(ValidationErrorCode.BUSINESS, "Patch operations must be an array."));
  }

  for (const operation of patch?.operations ?? []) {
    if (!supportedOperationTypes.has(operation.type)) {
      errors.push(createError(ValidationErrorCode.BUSINESS, `Unsupported operation type: ${operation.type}.`));
    }
  }

  return errors;
}

function getRegistryTypes(registry) {
  if (Array.isArray(registry)) {
    return new Set(registry);
  }
  return new Set(Object.keys(registry ?? {}));
}

function validateRegistryNode(node, registryTypes, path, errors) {
  if (!registryTypes.has(node.type)) {
    errors.push(createError(ValidationErrorCode.REGISTRY, `${path}.type "${node.type}" is not registered.`));
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
    if (operation.type === "insertNode" || operation.type === "replaceNode") {
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

  return Object.keys(propertyGroup).filter((property) => {
    const propertyKey = `${groupName}:${operation.targetId}:${property}`;

    if (updatedProperties.has(propertyKey)) {
      return true;
    }

    updatedProperties.add(propertyKey);
    return false;
  });
}

export function validatePatch(patch, componentTree) {
  const errors = [];

  if (!componentTree) {
    return [createError(ValidationErrorCode.PATCH, "A component tree is required for patch validation.")];
  }

  const nodeIndex = new Map();
  const existingDuplicates = new Set();
  addNodeToIndex(componentTree, nodeIndex, existingDuplicates);

  existingDuplicates.forEach((id) => {
    errors.push(createError(ValidationErrorCode.PATCH, `Component tree contains duplicate ID "${id}".`));
  });

  const deletedIds = new Set();
  const updatedProperties = new Set();
  const terminalOperations = new Set();

  for (const [index, operation] of (patch?.operations ?? []).entries()) {
    const path = `operations[${index}]`;
    const targetId = operation.targetId;
    const requiresTarget = [
      "updateProps",
      "updateStyles",
      "deleteNode",
      "replaceNode",
    ].includes(operation.type);

    if (requiresTarget && !nodeIndex.has(targetId)) {
      const reason = deletedIds.has(targetId)
        ? "was deleted by an earlier operation"
        : "does not exist";
      errors.push(createError(ValidationErrorCode.PATCH, `${path}.targetId "${targetId}" ${reason}.`));
      continue;
    }

    if (operation.type === "updateProps" || operation.type === "updateStyles") {
      const duplicateProperties = hasDuplicateProperties(
        operation,
        updatedProperties
      );

      duplicateProperties.forEach((property) => {
        errors.push(createError(
          ValidationErrorCode.PATCH,
          `${path} duplicates an earlier update for "${property}" on "${targetId}".`
        ));
      });
    }

    if (operation.type === "insertNode") {
      if (!nodeIndex.has(operation.parentId)) {
        errors.push(createError(
          ValidationErrorCode.PATCH,
          `${path}.parentId "${operation.parentId}" does not exist.`
        ));
        continue;
      }

      const insertedNodes = new Map();
      const insertedDuplicates = new Set();
      addNodeToIndex(operation.node, insertedNodes, insertedDuplicates);

      insertedDuplicates.forEach((id) => {
        errors.push(createError(ValidationErrorCode.PATCH, `${path}.node contains duplicate ID "${id}".`));
      });

      insertedNodes.forEach((_, id) => {
        if (nodeIndex.has(id)) {
          errors.push(createError(ValidationErrorCode.PATCH, `${path}.node ID "${id}" already exists.`));
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
        errors.push(createError(ValidationErrorCode.PATCH, `${path} cannot delete the root component.`));
        continue;
      }

      if (terminalOperations.has(targetId)) {
        errors.push(createError(ValidationErrorCode.PATCH, `${path} conflicts with an earlier terminal operation.`));
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
        errors.push(createError(ValidationErrorCode.PATCH, `${path} conflicts with an earlier terminal operation.`));
        continue;
      }

      const replacementNodes = new Map();
      const replacementDuplicates = new Set();
      addNodeToIndex(operation.node, replacementNodes, replacementDuplicates);

      replacementDuplicates.forEach((id) => {
        errors.push(createError(ValidationErrorCode.PATCH, `${path}.node contains duplicate ID "${id}".`));
      });

      const replacedNode = nodeIndex.get(targetId);
      const replacedIds = getSubtreeIds(replacedNode);

      replacementNodes.forEach((_, id) => {
        if (nodeIndex.has(id) && !replacedIds.has(id)) {
          errors.push(createError(ValidationErrorCode.PATCH, `${path}.node ID "${id}" already exists.`));
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

function normalizeOperation(op) {
  const normalized = { ...op };

  if (!normalized.type && normalized.op) {
    normalized.type = normalized.op;
    delete normalized.op;
  }

  if (normalized.type === "removeNode") {
    normalized.type = "deleteNode";
  }

  if (!normalized.targetId) {
    if (normalized.id && normalized.type !== "insertNode") {
      normalized.targetId = normalized.id;
      delete normalized.id;
    } else if (normalized.target) {
      normalized.targetId = normalized.target;
      delete normalized.target;
    }
  }

  if (normalized.type === "insertNode" && normalized.index !== undefined) {
    delete normalized.index;
    if (!normalized.position) {
      normalized.position = "end";
    }
  }

  return normalized;
}

function normalizeResponse(response) {
  if (!response || typeof response !== "object") {
    return response;
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

export function validateResponse(response, { componentTree, registry } = {}) {
  const normalized = normalizeResponse(response);

  const errors = [
    ...validateSchema(normalized),
    ...validateBusinessRules(normalized),
  ];

  if (errors.length > 0) {
    return {
      success: false,
      patch: null,
      errors,
    };
  }

  errors.push(
    ...validateRegistry(normalized, registry),
    ...validatePatch(normalized, componentTree)
  );

  return {
    success: errors.length === 0,
    patch: errors.length === 0 ? normalized : null,
    errors,
  };
}
