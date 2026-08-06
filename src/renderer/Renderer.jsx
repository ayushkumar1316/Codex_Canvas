import { getComponentByType } from "@/registry/componentRegistry";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function renderNode(node, selectedComponentId, newIds, reduced, depth) {
  if (!node) {
    return null;
  }

  const Component = getComponentByType(node.type);
  if (!Component) {
    return null;
  }

  const isSelected = node.id === selectedComponentId;
  const isNew = newIds.has(node.id);
  const staggerDelay = isNew && !reduced ? `${depth * 50}ms` : undefined;

  const componentNode = {
    ...node,
    props: {
      ...(node.props ?? {}),
      "data-component-id": node.id,
      "data-component-type": node.type,
      "tabIndex": node.type !== "root" ? 0 : undefined,
      "role": node.type !== "root" ? "button" : undefined,
      "aria-label": node.type !== "root" ? `${node.type} component` : undefined,
      className: [
        node.props?.className,
        "relative transition-all duration-150 ease-out",
        isSelected &&
          "outline outline-2 outline-violet-500/80 outline-offset-2 shadow-[0_0_0_4px_rgba(139,92,246,0.12)]",
      ]
        .filter(Boolean)
        .join(" "),
      style: {
        ...(node.props?.style ?? {}),
        ...(node.type !== "root"
          ? {
              cursor: "pointer",
            }
          : {}),
      },
    },
  };

  const children = (node.children ?? []).map((child) =>
    renderNode(child, selectedComponentId, newIds, reduced, depth + 1)
  );

  const wrapperStyle = isNew && !reduced
    ? { animation: `canvas-entry 300ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay} both` }
    : undefined;

  if (isNew && !reduced) {
    return (
      <div style={wrapperStyle}>
        <Component key={node.id} node={componentNode}>
          {children}
        </Component>
      </div>
    );
  }

  return (
    <Component key={node.id} node={componentNode}>
      {children}
    </Component>
  );
}

export default function Renderer({ tree, newIds = new Set() }) {
  const editorMode = useAppStore((state) => state.editorMode);
  const selectedComponentId = useAppStore(
    (state) => state.selectedComponentId
  );
  const setSelectedComponent = useAppStore(
    (state) => state.setSelectedComponent
  );
  const resetSelection = useAppStore((state) => state.resetSelection);
  const reduced = useReducedMotion();

  const handleCanvasClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target.closest("[data-component-id]");

    if (target) {
      setSelectedComponent(target.dataset.componentId);
      return;
    }

    resetSelection();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      resetSelection();
    }
  };

  return (
    <div
      className="w-full"
      onClick={editorMode === "editor" ? handleCanvasClick : undefined}
      onKeyDown={editorMode === "editor" ? handleKeyDown : undefined}
    >
      {renderNode(tree, selectedComponentId, newIds, reduced, 0)}
    </div>
  );
}
