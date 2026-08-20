import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Boxes,
  ChevronRight,
  CreditCard,
  Heading1,
  Image,
  MousePointer2,
  PanelTop,
  Pilcrow,
  TextCursorInput,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useNewComponentTracker } from "@/hooks/useNewComponentTracker";

const components = [
  { name: "Button", type: "button", icon: MousePointer2 },
  { name: "Text", type: "text", icon: Type },
  { name: "Heading", type: "heading", icon: Heading1 },
  { name: "Input", type: "input", icon: TextCursorInput },
  { name: "Textarea", type: "textarea", icon: Pilcrow },
  { name: "Image", type: "image", icon: Image },
  { name: "Card", type: "card", icon: CreditCard },
  { name: "Container", type: "container", icon: Box },
];

const componentIcons = {
  root: Boxes,
  ...Object.fromEntries(
    components.map(({ type, icon }) => [type, icon])
  ),
};

const typeColors = {
  root: "text-text-muted",
  container: "text-blue-500",
  button: "text-emerald-500",
  text: "text-text-secondary",
  heading: "text-amber-500",
  input: "text-cyan-500",
  textarea: "text-cyan-500",
  image: "text-pink-500",
  card: "text-purple-500",
};

function SidebarSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-1.5 flex w-full items-center gap-1 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text-secondary"
      >
        <ChevronRight
          className={`size-3 shrink-0 transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
        {title}
      </button>
      {open && children}
    </section>
  );
}

function ComponentTreeNode({
  node,
  depth,
  selectedComponentId,
  setSelectedComponent,
  collapsedIds,
  toggleCollapse,
  newIds,
  reduced,
  animIndex,
  isLast,
}) {
  const Icon = componentIcons[node.type] ?? Box;
  const isSelected = node.id === selectedComponentId;
  const isNew = newIds.has(node.id);
  const staggerDelay = isNew && !reduced ? `${animIndex * 40}ms` : undefined;
  const hasChildren = (node.children?.length ?? 0) > 0;
  const colorClass = typeColors[node.type] ?? "text-text-muted";
  const isCollapsed = collapsedIds.has(node.id);

  const wrapperStyle = isNew && !reduced
    ? { animation: `tree-slide-in 250ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay} both` }
    : undefined;

  const childEntries = useMemo(() => {
    const entries = [];
    let idx = animIndex + 1;
    for (const child of node.children ?? []) {
      entries.push({ child, startIdx: idx });
      idx += countDescendants(child) + 1;
    }
    return entries;
  }, [node.children, animIndex]);

  return (
    <div style={wrapperStyle}>
      <button
        type="button"
        onClick={() => setSelectedComponent(node.id)}
        className={`group flex h-7 w-full items-center gap-1.5 rounded-md px-1.5 text-xs font-medium transition-all duration-150 ${
          isSelected
            ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.18)]"
            : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedComponent(node.id);
          }
        }}
      >
        {hasChildren ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
            className="mr-0.5 flex size-3 shrink-0 items-center justify-center rounded hover:bg-surface-3"
            tabIndex={-1}
          >
            <ChevronRight
              className={`size-3 transition-transform duration-150 ${
                isCollapsed ? "" : "rotate-90"
              } ${isLast ? "text-text-muted" : "text-text-secondary"}`}
            />
          </span>
        ) : (
          <span className="mr-0.5 size-3 shrink-0" />
        )}
        <Icon className={`size-3.5 shrink-0 ${colorClass}`} strokeWidth={1.8} />
        <span className="truncate capitalize">{node.type}</span>
      </button>
      {hasChildren && !isCollapsed && (
        <div className="relative">
          {depth > 0 && (
            <div
              className="absolute bottom-0 top-0 w-px bg-border-subtle"
              style={{ left: `${depth * 16 + 14}px` }}
            />
          )}
          {childEntries.map(({ child, startIdx }) => (
              <ComponentTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedComponentId={selectedComponentId}
                setSelectedComponent={setSelectedComponent}
                collapsedIds={collapsedIds}
                toggleCollapse={toggleCollapse}
                newIds={newIds}
                reduced={reduced}
                animIndex={startIdx}
                isLast={child === node.children[node.children.length - 1]}
              />
          ))}
        </div>
      )}
    </div>
  );
}

function countDescendants(node) {
  let count = 0;
  for (const child of node.children ?? []) {
    count += 1 + countDescendants(child);
  }
  return count;
}

export default function LeftSidebar() {
  const addComponent = useAppStore((state) => state.addComponent);
  const componentTree = useAppStore((state) => state.componentTree);
  const selectedComponentId = useAppStore(
    (state) => state.selectedComponentId
  );
  const setSelectedComponent = useAppStore(
    (state) => state.setSelectedComponent
  );

  const reduced = useReducedMotion();
  const newIds = useNewComponentTracker(componentTree);
  const [collapsedIds, setCollapsedIds] = useState(new Set());

  const toggleCollapse = useCallback((id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddComponent = useCallback(
    (type) => {
      addComponent(type);
    },
    [addComponent]
  );

  return (
    <aside className="flex h-full w-full max-w-[16rem] flex-col border-r border-border-subtle bg-surface-0/90 transition-colors duration-300 dark:panel-glass dark:border-[rgba(139,92,246,0.08)] md:w-[16rem]">
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
        <SidebarSection title="Components">
          <div className="space-y-0.5">
            {components.map(({ name, type, icon: Icon }) => (
              <Button
                key={type}
                type="button"
                variant="ghost"
                onClick={() => handleAddComponent(type)}
                className="group h-8 w-full justify-start gap-2.5 rounded-lg px-2.5 text-xs font-normal text-text-secondary transition-all duration-150 hover:bg-hover-surface hover:text-text-primary hover:translate-x-0.5 active:scale-[0.98]"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAddComponent(type);
                  }
                }}
              >
                <span className="flex size-5 items-center justify-center text-text-muted transition-colors duration-150 group-hover:text-primary">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                </span>
                {name}
              </Button>
            ))}
          </div>
        </SidebarSection>

        <div className="my-4 h-px bg-border-subtle" />

        <SidebarSection title="Component tree">
          <div>
            {componentTree && (
              <ComponentTreeNode
                node={componentTree}
                depth={0}
                selectedComponentId={selectedComponentId}
                setSelectedComponent={setSelectedComponent}
                collapsedIds={collapsedIds}
                toggleCollapse={toggleCollapse}
                newIds={newIds}
                reduced={reduced}
                animIndex={0}
                isLast={true}
              />
            )}
          </div>
        </SidebarSection>
      </div>

      <div className="border-t border-border-subtle p-3">
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
              <PanelTop className="size-3" />
            </span>
            <p className="text-xs leading-5 text-text-muted">
              More components coming soon.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
