import { getComponentByType } from "@/registry/componentRegistry";
import { useAppStore } from "@/store/useAppStore";

function renderNode(node, selectedComponentId) {
  if (!node) {
    return null;
  }

  const Component = getComponentByType(node.type);
  if (!Component) {
    return null;
  }

  const isSelected = node.id === selectedComponentId;

  const componentNode = {
    ...node,
    props: {
      ...(node.props ?? {}),
      "data-component-id": node.id,
      className: [
        node.props?.className,
        isSelected &&
          "outline outline-2 outline-violet-500/80 outline-offset-2 shadow-[0_0_0_4px_rgba(139,92,246,0.12)]",
      ]
        .filter(Boolean)
        .join(" "),
    },
  };

  const children = (node.children ?? []).map((child) =>
    renderNode(child, selectedComponentId)
  );

  return (
    <Component key={node.id} node={componentNode}>
      {children}
    </Component>
  );
}

export default function Renderer({ tree }) {
  const editorMode = useAppStore((state) => state.editorMode);
  const selectedComponentId = useAppStore(
    (state) => state.selectedComponentId
  );
  const setSelectedComponent = useAppStore(
    (state) => state.setSelectedComponent
  );
  const resetSelection = useAppStore((state) => state.resetSelection);

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

  return (
    <div
      className="h-full w-full"
      onClick={editorMode === "editor" ? handleCanvasClick : undefined}
    >
      {renderNode(tree, selectedComponentId)}
    </div>
  );
}
