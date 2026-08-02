import {
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { findComponentById } from "@/ai/contextBuilder";

const textComponents = new Set(["heading", "text", "button"]);

function PropertyField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-8 border-white/[0.06] bg-white/[0.03] px-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 transition-colors duration-150 focus-visible:border-violet-400/40 focus-visible:ring-1 focus-visible:ring-violet-400/20"
      />
    </label>
  );
}

export default function RightPanel() {
  const selectedComponentId = useAppStore(
    (state) => state.selectedComponentId
  );
  const componentTree = useAppStore((state) => state.componentTree);
  const updateComponentProps = useAppStore(
    (state) => state.updateComponentProps
  );
  const updateComponentStyles = useAppStore(
    (state) => state.updateComponentStyles
  );
  const deleteComponent = useAppStore((state) => state.deleteComponent);

  const selectedComponent = findComponentById(
    componentTree,
    selectedComponentId
  );

  const canEditText = selectedComponent
    ? textComponents.has(selectedComponent.type)
    : false;

  const isRootComponent = selectedComponent?.type === "root";

  return (
    <aside className="flex h-[calc(100vh-4rem)] w-full max-w-[16rem] flex-col border-l border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl md:w-[16rem]">
      <header className="border-b border-white/[0.06] px-4 py-4">
        <h2 className="text-xs font-semibold tracking-[-0.02em] text-zinc-100">
          Inspector
        </h2>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          Edit the selected component
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-5">
        <section className="flex min-h-[200px] flex-col items-center justify-center px-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-violet-300 shadow-lg shadow-black/10">
            <SlidersHorizontal className="size-4.5" strokeWidth={1.7} />
          </div>

          {selectedComponent ? (
            <>
              <h3 className="mt-3.5 text-xs font-medium text-zinc-200">
                Selected component
              </h3>
              <div className="mt-3.5 w-full max-w-[200px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Component ID
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-zinc-300">
                    {selectedComponent.id}
                  </p>
                </div>
                <div className="my-2.5 h-px bg-white/[0.06]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Component Type
                  </p>
                  <p className="mt-1 text-[11px] font-medium capitalize text-violet-300">
                    {selectedComponent.type}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-3.5 text-xs font-medium text-zinc-200">
                No element selected
              </h3>
              <p className="mt-1.5 max-w-[180px] text-[11px] leading-5 text-zinc-500">
                Select an element from the canvas to inspect and edit its
                properties.
              </p>
            </>
          )}
        </section>

        {selectedComponent && (
          <>
            <div className="my-4 h-px bg-white/[0.06]" />

            <section className="space-y-3.5">
              {canEditText && (
                <PropertyField
                  label="Text Content"
                  value={selectedComponent.props?.text ?? ""}
                  onChange={(event) =>
                    updateComponentProps(selectedComponent.id, {
                      text: event.target.value,
                    })
                  }
                  placeholder="Add text"
                />
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <PropertyField
                  label="Width"
                  value={selectedComponent.styles?.width ?? ""}
                  onChange={(event) =>
                    updateComponentStyles(selectedComponent.id, {
                      width: event.target.value,
                    })
                  }
                  placeholder="Auto"
                />
                <PropertyField
                  label="Height"
                  value={selectedComponent.styles?.height ?? ""}
                  onChange={(event) =>
                    updateComponentStyles(selectedComponent.id, {
                      height: event.target.value,
                    })
                  }
                  placeholder="Auto"
                />
              </div>

              <PropertyField
                label="Background Color"
                value={selectedComponent.styles?.backgroundColor ?? ""}
                onChange={(event) =>
                  updateComponentStyles(selectedComponent.id, {
                    backgroundColor: event.target.value,
                  })
                }
                placeholder="#FFFFFF"
              />

              <PropertyField
                label="Text Color"
                value={selectedComponent.styles?.color ?? ""}
                onChange={(event) =>
                  updateComponentStyles(selectedComponent.id, {
                    color: event.target.value,
                  })
                }
                placeholder="#18181B"
              />

              <Button
                type="button"
                variant="outline"
                disabled={isRootComponent}
                onClick={() => deleteComponent(selectedComponent.id)}
                className="h-8 w-full gap-2 rounded-lg border-red-400/[0.12] bg-red-400/[0.04] text-xs font-medium text-red-300 transition-all duration-150 hover:border-red-400/20 hover:bg-red-400/[0.08] hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="size-3.5" />
                Delete component
              </Button>
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-white/[0.06] px-4 py-3">
        <p className="text-[11px] leading-5 text-zinc-600">
          {selectedComponent ? "Editing component" : "Select a component to edit"}
        </p>
      </footer>
    </aside>
  );
}
