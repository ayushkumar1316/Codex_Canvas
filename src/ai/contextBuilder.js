function cloneNode(node) {
  if (!node) {
    return null;
  }
  return {
    ...node,
    props: { ...(node.props ?? {}) },
    styles: { ...(node.styles ?? {}) },
    children: (node.children ?? []).map(cloneNode),
  };
}

export function findComponentById(node, componentId) {
  if (!node || !componentId) {
    return null;
  }
  if (node.id === componentId) {
    return node;
  }
  for (const child of node.children ?? []) {
    const component = findComponentById(child, componentId);
    if (component) {
      return component;
    }
  }
  return null;
}

export function findParent(node, componentId) {
  if (!node || !componentId) {
    return null;
  }
  for (const child of node.children ?? []) {
    if (child.id === componentId) {
      return node;
    }
    const parent = findParent(child, componentId);
    if (parent) {
      return parent;
    }
  }
  return null;
}

export function findSiblings(componentTree, componentId) {
  const parent = findParent(componentTree, componentId);
  if (!parent) {
    return [];
  }
  return (parent.children ?? []).filter((child) => child.id !== componentId);
}

export function findChildren(node) {
  return node?.children ?? [];
}

export function getRegistryMetadata(registry) {
  if (Array.isArray(registry)) {
    return [...registry];
  }
  return Object.keys(registry ?? {});
}

export function buildContext({
  componentTree,
  selectedComponentId,
  editorMode,
  registry,
  userPrompt,
}) {
  const registryMetadata = getRegistryMetadata(registry);

  if (!selectedComponentId) {
    return {
      scope: "page",
      selectedComponent: null,
      parentComponent: null,
      siblingComponents: [],
      childComponents: [],
      componentTree: cloneNode(componentTree),
      registry: registryMetadata,
      editorMode,
      userPrompt,
    };
  }

  const selectedComponent = findComponentById(
    componentTree,
    selectedComponentId
  );
  const parentComponent = findParent(componentTree, selectedComponentId);
  const siblingComponents = findSiblings(componentTree, selectedComponentId);
  const childComponents = findChildren(selectedComponent);

  return {
    scope: "component",
    selectedComponent: cloneNode(selectedComponent),
    parentComponent: cloneNode(parentComponent),
    siblingComponents: siblingComponents.map(cloneNode),
    childComponents: childComponents.map(cloneNode),
    registry: registryMetadata,
    editorMode,
    userPrompt,
  };
}
