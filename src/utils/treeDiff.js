export function diffTrees(oldTree, newTree) {
  const deltas = [];
  diffNodes(oldTree, newTree, deltas);
  return deltas;
}

function diffNodes(oldNode, newNode, deltas) {
  if (!oldNode && !newNode) return;

  if (!oldNode && newNode) {
    deltas.push({ type: "add", node: newNode });
    return;
  }

  if (oldNode && !newNode) {
    deltas.push({ type: "remove", id: oldNode.id });
    return;
  }

  if (oldNode.id !== newNode.id) {
    deltas.push({ type: "replace", oldId: oldNode.id, node: newNode });
    return;
  }

  if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props)) {
    deltas.push({
      type: "updateProps",
      id: oldNode.id,
      props: newNode.props,
      oldProps: oldNode.props,
    });
  }

  if (JSON.stringify(oldNode.styles) !== JSON.stringify(newNode.styles)) {
    deltas.push({
      type: "updateStyles",
      id: oldNode.id,
      styles: newNode.styles,
      oldStyles: oldNode.styles,
    });
  }

  if (oldNode.type !== newNode.type) {
    deltas.push({
      type: "updateType",
      id: oldNode.id,
      newType: newNode.type,
      oldType: oldNode.type,
    });
  }

  const oldChildren = oldNode.children || [];
  const newChildren = newNode.children || [];

  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    diffNodes(oldChildren[i], newChildren[i], deltas);
  }
}

export function applyDeltas(tree, deltas) {
  if (!deltas || deltas.length === 0) return tree;

  let result = JSON.parse(JSON.stringify(tree));

  for (const delta of deltas) {
    result = applyDelta(result, delta);
  }

  return result;
}

function applyDelta(tree, delta) {
  switch (delta.type) {
    case "add":
      return addNode(tree, delta.node);

    case "remove":
      return removeNode(tree, delta.id);

    case "replace":
      return replaceNode(tree, delta.oldId, delta.node);

    case "updateProps":
      return updateNodeProps(tree, delta.id, delta.props);

    case "updateStyles":
      return updateNodeStyles(tree, delta.id, delta.styles);

    case "updateType":
      return updateNodeType(tree, delta.id, delta.newType);

    default:
      return tree;
  }
}

function addNode(tree, node) {
  if (tree.id === node.id) return tree;

  if (tree.children) {
    const existing = tree.children.find((c) => c.id === node.id);
    if (existing) return tree;

    return {
      ...tree,
      children: [...tree.children, node],
    };
  }

  return tree;
}

function removeNode(tree, id) {
  if (!tree.children) return tree;

  return {
    ...tree,
    children: tree.children
      .filter((c) => c.id !== id)
      .map((c) => removeNode(c, id)),
  };
}

function replaceNode(tree, oldId, newNode) {
  if (tree.id === oldId) return newNode;

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((c) =>
        c.id === oldId ? newNode : replaceNode(c, oldId, newNode)
      ),
    };
  }

  return tree;
}

function updateNodeProps(tree, id, newProps) {
  if (tree.id === id) {
    return { ...tree, props: { ...(tree.props || {}), ...newProps } };
  }

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((c) => updateNodeProps(c, id, newProps)),
    };
  }

  return tree;
}

function updateNodeStyles(tree, id, newStyles) {
  if (tree.id === id) {
    return { ...tree, styles: { ...(tree.styles || {}), ...newStyles } };
  }

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((c) => updateNodeStyles(c, id, newStyles)),
    };
  }

  return tree;
}

function updateNodeType(tree, id, newType) {
  if (tree.id === id) {
    return { ...tree, type: newType };
  }

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((c) => updateNodeType(c, id, newType)),
    };
  }

  return tree;
}

export function deltasToSnapshot(deltas) {
  return {
    timestamp: Date.now(),
    deltas,
    size: JSON.stringify(deltas).length,
  };
}

export function snapshotToDeltas(snapshot) {
  return snapshot.deltas || [];
}
