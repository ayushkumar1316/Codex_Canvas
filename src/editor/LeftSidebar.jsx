import {
  Box,
  Boxes,
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

function SidebarSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ComponentTreeNode({
  node,
  depth,
  selectedComponentId,
  setSelectedComponent,
}) {
  const Icon = componentIcons[node.type] ?? Box;
  const isSelected = node.id === selectedComponentId;

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setSelectedComponent(node.id)}
        className={`group h-8 w-full justify-start gap-2 rounded-lg px-2 text-xs font-normal transition-all duration-150 ${
          isSelected
            ? "bg-violet-500/[0.12] text-violet-200 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.15)] hover:bg-violet-500/[0.16] hover:text-violet-100"
            : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <Icon className="size-3.5 shrink-0" strokeWidth={1.8} />
        <span className="capitalize">{node.type}</span>
        <span className="ml-auto max-w-[76px] truncate font-mono text-[10px] text-zinc-600">
          {node.id}
        </span>
      </Button>
      {(node.children ?? []).map((child) => (
        <ComponentTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedComponentId={selectedComponentId}
          setSelectedComponent={setSelectedComponent}
        />
      ))}
    </div>
  );
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

  return (
    <aside className="flex h-[calc(100vh-4rem)] w-full max-w-[16rem] flex-col border-r border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl md:w-[16rem]">
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
        <SidebarSection title="Components">
          <div className="space-y-0.5">
            {components.map(({ name, type, icon: Icon }) => (
              <Button
                key={type}
                type="button"
                variant="ghost"
                onClick={() => addComponent(type)}
                className="group h-8 w-full justify-start gap-2.5 rounded-lg px-2.5 text-xs font-normal text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-zinc-100"
              >
                <span className="flex size-5 items-center justify-center text-zinc-600 transition-colors duration-150 group-hover:text-violet-300">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                </span>
                {name}
              </Button>
            ))}
          </div>
        </SidebarSection>

        <div className="my-4 h-px bg-white/[0.06]" />

        <SidebarSection title="Component tree">
          <div className="space-y-0.5">
            {componentTree && (
              <ComponentTreeNode
                node={componentTree}
                depth={0}
                selectedComponentId={selectedComponentId}
                setSelectedComponent={setSelectedComponent}
              />
            )}
          </div>
        </SidebarSection>

        <div className="my-4 h-px bg-white/[0.06]" />
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-violet-400/[0.08] text-violet-300">
              <PanelTop className="size-3" />
            </span>
            <p className="text-[11px] leading-5 text-zinc-500">
              More components coming soon.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
