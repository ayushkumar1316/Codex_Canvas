import { useState, useRef, useCallback } from "react";
import {
  SlidersHorizontal,
  Trash2,
  ChevronDown,
  ChevronRight,
  Type,
  Palette,
  Layout,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { findComponentById } from "@/ai/contextBuilder";

const textComponents = new Set(["heading", "text", "button", "input", "textarea"]);

function PropertyField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-8 border-white/[0.05] bg-white/[0.03] px-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 transition-all duration-150 focus-visible:border-violet-400/40 focus-visible:ring-1 focus-visible:ring-violet-400/20"
      />
    </label>
  );
}

function InlineTextEdit({ value, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  const handleDoubleClick = useCallback(() => {
    setEditValue(value);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [value]);

  const handleConfirm = useCallback(() => {
    if (editValue !== value) {
      onChange(editValue);
    }
    setIsEditing(false);
  }, [editValue, value, onChange]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        handleConfirm();
      } else if (event.key === "Escape") {
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleConfirm}
        onKeyDown={handleKeyDown}
        className="h-8 border-violet-400/40 bg-white/[0.06] px-2.5 text-xs text-zinc-200 focus-visible:ring-1 focus-visible:ring-violet-400/20"
        autoFocus
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex h-8 cursor-pointer items-center rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 text-xs text-zinc-200 transition-all duration-150 hover:border-white/[0.08] hover:bg-white/[0.04]"
      title="Double-click to edit"
    >
      <span className="truncate">{value || "Double-click to edit"}</span>
    </div>
  );
}

function StyleSection({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <Icon className="size-3" strokeWidth={1.8} />
        {open ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        {title}
      </button>
      {open && <div className="space-y-2.5">{children}</div>}
    </div>
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
  const isContainer = selectedComponent?.type === "container";
  const isCard = selectedComponent?.type === "card";

  const handleTextChange = useCallback(
    (value) => {
      if (selectedComponent) {
        updateComponentProps(selectedComponent.id, { text: value });
      }
    },
    [selectedComponent, updateComponentProps]
  );

  const handleStyleChange = useCallback(
    (property, value) => {
      if (selectedComponent) {
        updateComponentStyles(selectedComponent.id, { [property]: value });
      }
    },
    [selectedComponent, updateComponentStyles]
  );

  return (
    <aside className="flex h-full w-full max-w-[16rem] flex-col border-l border-white/[0.05] bg-[#0a0a0e]/90 backdrop-blur-xl md:w-[16rem]">
      <header className="border-b border-white/[0.05] px-4 py-4">
        <h2 className="text-xs font-semibold tracking-[-0.02em] text-zinc-100">
          Inspector
        </h2>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          Edit the selected component
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-5">
        <section className="flex min-h-[200px] flex-col items-center justify-center px-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.03] text-violet-300 shadow-lg shadow-black/10">
            <SlidersHorizontal className="size-4.5" strokeWidth={1.7} />
          </div>

          {selectedComponent ? (
            <>
              <h3 className="mt-3.5 text-xs font-medium text-zinc-200">
                Selected component
              </h3>
              <div className="mt-3.5 w-full max-w-[200px] rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Component ID
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-zinc-300">
                    {selectedComponent.id}
                  </p>
                </div>
                <div className="my-2.5 h-px bg-white/[0.05]" />
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
            <div className="my-4 h-px bg-white/[0.05]" />

            <div className="space-y-5">
              {/* Content Section */}
              {canEditText && (
                <StyleSection title="Content" icon={Type}>
                  <div className="space-y-2.5">
                    <InlineTextEdit
                      value={selectedComponent.props?.text ?? ""}
                      onChange={handleTextChange}
                    />
                    {selectedComponent.type === "input" && (
                      <PropertyField
                        label="Placeholder"
                        value={selectedComponent.props?.placeholder ?? ""}
                        onChange={(e) =>
                          handleStyleChange("placeholder", e.target.value)
                        }
                        placeholder="Enter placeholder..."
                      />
                    )}
                    {selectedComponent.type === "textarea" && (
                      <PropertyField
                        label="Placeholder"
                        value={selectedComponent.props?.placeholder ?? ""}
                        onChange={(e) =>
                          handleStyleChange("placeholder", e.target.value)
                        }
                        placeholder="Enter placeholder..."
                      />
                    )}
                    {selectedComponent.type === "image" && (
                      <>
                        <PropertyField
                          label="Image URL"
                          value={selectedComponent.props?.src ?? ""}
                          onChange={(e) =>
                            handleStyleChange("src", e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                        />
                        <PropertyField
                          label="Alt Text"
                          value={selectedComponent.props?.alt ?? ""}
                          onChange={(e) =>
                            handleStyleChange("alt", e.target.value)
                          }
                          placeholder="Image description"
                        />
                      </>
                    )}
                  </div>
                </StyleSection>
              )}

              {/* Layout Section */}
              {(isContainer || isCard || isRootComponent) && (
                <StyleSection title="Layout" icon={Layout}>
                  <div className="space-y-2.5">
                    <PropertyField
                      label="Padding"
                      value={selectedComponent.styles?.padding ?? ""}
                      onChange={(e) =>
                        handleStyleChange("padding", e.target.value)
                      }
                      placeholder="24px"
                    />
                    {(isContainer || isRootComponent) && (
                      <PropertyField
                        label="Gap"
                        value={selectedComponent.styles?.gap ?? ""}
                        onChange={(e) =>
                          handleStyleChange("gap", e.target.value)
                        }
                        placeholder="16px"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-2.5">
                      <PropertyField
                        label="Width"
                        value={selectedComponent.styles?.width ?? ""}
                        onChange={(e) =>
                          handleStyleChange("width", e.target.value)
                        }
                        placeholder="Auto"
                      />
                      <PropertyField
                        label="Height"
                        value={selectedComponent.styles?.height ?? ""}
                        onChange={(e) =>
                          handleStyleChange("height", e.target.value)
                        }
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </StyleSection>
              )}

              {/* Appearance Section */}
              <StyleSection title="Appearance" icon={Palette}>
                <div className="space-y-2.5">
                  <PropertyField
                    label="Background Color"
                    value={selectedComponent.styles?.backgroundColor ?? ""}
                    onChange={(e) =>
                      handleStyleChange("backgroundColor", e.target.value)
                    }
                    placeholder="#FFFFFF"
                  />
                  <PropertyField
                    label="Text Color"
                    value={selectedComponent.styles?.color ?? ""}
                    onChange={(e) =>
                      handleStyleChange("color", e.target.value)
                    }
                    placeholder="#18181B"
                  />
                  <PropertyField
                    label="Border Radius"
                    value={selectedComponent.styles?.borderRadius ?? ""}
                    onChange={(e) =>
                      handleStyleChange("borderRadius", e.target.value)
                    }
                    placeholder="8px"
                  />
                  <PropertyField
                    label="Font Size"
                    value={selectedComponent.styles?.fontSize ?? ""}
                    onChange={(e) =>
                      handleStyleChange("fontSize", e.target.value)
                    }
                    placeholder="16px"
                  />
                  <PropertyField
                    label="Font Weight"
                    value={selectedComponent.styles?.fontWeight ?? ""}
                    onChange={(e) =>
                      handleStyleChange("fontWeight", e.target.value)
                    }
                    placeholder="400"
                  />
                </div>
              </StyleSection>

              {/* Typography Section (for text components) */}
              {canEditText && (
                <StyleSection title="Typography" icon={Type} defaultOpen={false}>
                  <div className="space-y-2.5">
                    <PropertyField
                      label="Line Height"
                      value={selectedComponent.styles?.lineHeight ?? ""}
                      onChange={(e) =>
                        handleStyleChange("lineHeight", e.target.value)
                      }
                      placeholder="1.5"
                    />
                    <PropertyField
                      label="Letter Spacing"
                      value={selectedComponent.styles?.letterSpacing ?? ""}
                      onChange={(e) =>
                        handleStyleChange("letterSpacing", e.target.value)
                      }
                      placeholder="0"
                    />
                    <PropertyField
                      label="Text Align"
                      value={selectedComponent.styles?.textAlign ?? ""}
                      onChange={(e) =>
                        handleStyleChange("textAlign", e.target.value)
                      }
                      placeholder="left"
                    />
                  </div>
                </StyleSection>
              )}

              {/* Spacing Section */}
              <StyleSection title="Spacing" icon={Box} defaultOpen={false}>
                <div className="space-y-2.5">
                  <PropertyField
                    label="Margin"
                    value={selectedComponent.styles?.margin ?? ""}
                    onChange={(e) =>
                      handleStyleChange("margin", e.target.value)
                    }
                    placeholder="0"
                  />
                  <PropertyField
                    label="Padding Top"
                    value={selectedComponent.styles?.paddingTop ?? ""}
                    onChange={(e) =>
                      handleStyleChange("paddingTop", e.target.value)
                    }
                    placeholder="0"
                  />
                  <PropertyField
                    label="Padding Bottom"
                    value={selectedComponent.styles?.paddingBottom ?? ""}
                    onChange={(e) =>
                      handleStyleChange("paddingBottom", e.target.value)
                    }
                    placeholder="0"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <PropertyField
                      label="Padding Left"
                      value={selectedComponent.styles?.paddingLeft ?? ""}
                      onChange={(e) =>
                        handleStyleChange("paddingLeft", e.target.value)
                      }
                      placeholder="0"
                    />
                    <PropertyField
                      label="Padding Right"
                      value={selectedComponent.styles?.paddingRight ?? ""}
                      onChange={(e) =>
                        handleStyleChange("paddingRight", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </StyleSection>

              {/* Delete Button */}
              <div className="pt-2">
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
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-white/[0.05] px-4 py-3">
        <p className="text-[11px] leading-5 text-zinc-600">
          {selectedComponent ? "Editing component" : "Select a component to edit"}
        </p>
      </footer>
    </aside>
  );
}
