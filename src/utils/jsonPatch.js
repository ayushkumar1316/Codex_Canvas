function cloneNode(node) {
  return {
    ...node,
    props: { ...(node.props ?? {}) },
    styles: { ...(node.styles ?? {}) },
    children: (node.children ?? []).map(cloneNode),
  };
}

function updateNodeById(node, targetId, update) {
  if (node.id === targetId) {
    return update(node);
  }

  let hasChanged = false;
  const children = (node.children ?? []).map((child) => {
    const updatedChild = updateNodeById(child, targetId, update);
    if (updatedChild !== child) {
      hasChanged = true;
    }
    return updatedChild;
  });

  return hasChanged ? { ...node, children } : node;
}

function insertNodeByParentId(node, parentId, position, newNode) {
  if (node.id === parentId) {
    const children = node.children ?? [];
    return {
      ...node,
      children:
        position === "start"
          ? [newNode, ...children]
          : [...children, newNode],
    };
  }

  let hasChanged = false;
  const children = (node.children ?? []).map((child) => {
    const updatedChild = insertNodeByParentId(
      child,
      parentId,
      position,
      newNode
    );
    if (updatedChild !== child) {
      hasChanged = true;
    }
    return updatedChild;
  });

  return hasChanged ? { ...node, children } : node;
}

function deleteNodeById(node, targetId) {
  let hasChanged = false;
  const children = [];

  for (const child of node.children ?? []) {
    if (child.id === targetId) {
      hasChanged = true;
      continue;
    }

    const updatedChild = deleteNodeById(child, targetId);

    if (updatedChild !== child) {
      hasChanged = true;
    }

    children.push(updatedChild);
  }

  return hasChanged ? { ...node, children } : node;
}

function applyOperation(tree, operation) {
  switch (operation.type) {
    case "updateProps":
      return updateNodeById(tree, operation.targetId, (node) => ({
        ...node,
        props: {
          ...(node.props ?? {}),
          ...operation.props,
        },
      }));

    case "updateStyles":
      return updateNodeById(tree, operation.targetId, (node) => ({
        ...node,
        styles: {
          ...(node.styles ?? {}),
          ...operation.styles,
        },
      }));

    case "insertNode":
      return insertNodeByParentId(
        tree,
        operation.parentId,
        operation.position,
        cloneNode(operation.node)
      );

    case "deleteNode":
      return deleteNodeById(tree, operation.targetId);

    case "replaceNode":
      return updateNodeById(tree, operation.targetId, () =>
        cloneNode(operation.node)
      );

    default:
      return tree;
  }
}

function applyOperationTracked(tree, operation, index, diagnostics) {
  console.log(`[JsonPatch] Applying operation ${index}:`, {
    type: operation.type,
    targetId: operation.targetId,
    parentId: operation.parentId,
    nodeType: operation.node?.type,
    nodeId: operation.node?.id,
  });
  const before = tree;
  const result = applyOperation(tree, operation);
  const changed = result !== before;

  if (!changed) {
    console.log(`[JsonPatch] Operation ${index} skipped - target/parent not found`);
    diagnostics.skipped.push({
      index,
      operation: {
        type: operation.type,
        targetId: operation.targetId,
        parentId: operation.parentId,
      },
      reason:
        operation.type === "insertNode"
          ? `parentId "${operation.parentId}" not found in tree`
          : `targetId "${operation.targetId}" not found in tree`,
    });
  } else {
    console.log(`[JsonPatch] Operation ${index} applied successfully`);
  }

  return result;
}

export function applyJsonPatchWithDiagnostics(tree, patch) {
  console.log("[JsonPatch] Starting patch application with", patch.operations.length, "operations");
  const diagnostics = {
    total: patch.operations.length,
    applied: 0,
    skipped: [],
    tree: null,
  };

  let current = tree;
  for (let i = 0; i < patch.operations.length; i++) {
    const before = current;
    current = applyOperationTracked(current, patch.operations[i], i, diagnostics);
    if (current !== before) {
      diagnostics.applied++;
    }
  }

  console.log("[JsonPatch] Patch application complete:", {
    total: diagnostics.total,
    applied: diagnostics.applied,
    skippedCount: diagnostics.skipped.length,
  });

  diagnostics.tree = current;
  return diagnostics;
}

export function applyJsonPatch(tree, patch) {
  return patch.operations.reduce(applyOperation, tree);
}
