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
import ColorPicker from "@/components/ui/ColorPicker";
import Slider from "@/components/ui/Slider";
import Select from "@/components/ui/Select";
import NumberInput from "@/components/ui/NumberInput";
import { useAppStore } from "@/store/useAppStore";
import { findComponentById } from "@/ai/contextBuilder";

const textComponents = new Set(["heading", "text", "button", "input", "textarea"]);

const FONT_WEIGHT_OPTIONS = [
  { label: "Thin (100)", value: "100" },
  { label: "Extra Light (200)", value: "200" },
  { label: "Light (300)", value: "300" },
  { label: "Normal (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semi Bold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extra Bold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
];

const TEXT_ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
];

const WIDTH_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "100%", value: "100%" },
  { label: "Fit Content", value: "fit-content" },
  { label: "Fill Available", value: "-webkit-fill-available" },
];

const HEIGHT_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "100%", value: "100%" },
  { label: "Fit Content", value: "fit-content" },
  { label: "Fill Available", value: "-webkit-fill-available" },
  { label: "100vh", value: "100vh" },
];

const HEADING_LEVEL_OPTIONS = [
  { label: "H1", value: "1" },
  { label: "H2", value: "2" },
  { label: "H3", value: "3" },
  { label: "H4", value: "4" },
  { label: "H5", value: "5" },
  { label: "H6", value: "6" },
];

const BORDER_STYLE_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
];

const CURSOR_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Pointer", value: "pointer" },
  { label: "Text", value: "text" },
  { label: "Move", value: "move" },
  { label: "Not Allowed", value: "not-allowed" },
  { label: "Grab", value: "grab" },
];

function PropertyField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="block w-full">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-7 min-w-0 border-border-subtle bg-surface-1 px-2.5 text-xs text-text-primary placeholder:text-text-muted transition-all duration-150 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20"
      />
    </div>
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
        className="h-7 border-primary/40 bg-surface-2 px-2.5 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-primary/20"
        autoFocus
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex h-7 cursor-pointer items-center rounded-md border border-border-subtle bg-surface-1 px-2.5 text-xs text-text-primary transition-all duration-150 hover:border-border-default hover:bg-surface-2"
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
        className="flex w-full items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-muted transition-colors hover:text-text-secondary"
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

function parseNumeric(value) {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^0-9.\-]/g, "")) || 0;
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
  const isHeading = selectedComponent?.type === "heading";
  const isButton = selectedComponent?.type === "button";
  const isImage = selectedComponent?.type === "image";

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

  const handlePropsChange = useCallback(
    (property, value) => {
      if (selectedComponent) {
        const updates = { [property]: value };
        if (property === "level" && selectedComponent.type === "heading") {
          const headingSizes = { 1: "36px", 2: "30px", 3: "24px", 4: "20px", 5: "18px", 6: "16px" };
          const newSize = headingSizes[value];
          if (newSize) {
            updateComponentStyles(selectedComponent.id, { fontSize: newSize });
          }
        }
        updateComponentProps(selectedComponent.id, updates);
      }
    },
    [selectedComponent, updateComponentProps, updateComponentStyles]
  );

  const styles = selectedComponent?.styles ?? {};
  const props = selectedComponent?.props ?? {};

  return (
    <aside className="flex h-full w-full max-w-[16rem] flex-col overflow-hidden border-l border-border-subtle bg-surface-0/90 transition-colors duration-300 dark:panel-glass dark:border-[rgba(139,92,246,0.08)] md:w-[16rem]">
      <header className="border-b border-border-subtle px-4 py-4">
        <h2 className="text-xs font-semibold tracking-[-0.02em] text-text-primary">
          Inspector
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Edit the selected component
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
        <section className="flex min-h-[200px] flex-col items-center justify-center px-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-primary shadow-theme-sm">
            <SlidersHorizontal className="size-4.5" strokeWidth={1.7} />
          </div>

          {selectedComponent ? (
            <>
              <h3 className="mt-3.5 text-xs font-medium text-text-primary">
                Selected component
              </h3>
              <div className="mt-3.5 w-full max-w-[200px] rounded-xl border border-border-subtle bg-surface-1 p-3 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Component ID
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-text-secondary">
                    {selectedComponent.id}
                  </p>
                </div>
                <div className="my-2.5 h-px bg-border-subtle" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Component Type
                  </p>
                  <p className="mt-1 text-xs font-medium capitalize text-primary">
                    {selectedComponent.type}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-3.5 text-xs font-medium text-text-primary">
                No element selected
              </h3>
              <p className="mt-1.5 max-w-[180px] text-xs leading-5 text-text-muted">
                Select an element from the canvas to inspect and edit its
                properties.
              </p>
            </>
          )}
        </section>

        {selectedComponent && (
          <>
            <div className="my-4 h-px bg-border-subtle" />

            <div className="space-y-5">
              {canEditText && (
                <StyleSection title="Content" icon={Type}>
                  <div className="space-y-2.5">
                    <InlineTextEdit
                      value={props.text ?? ""}
                      onChange={handleTextChange}
                    />
                    {(selectedComponent.type === "input" || selectedComponent.type === "textarea") && (
                      <PropertyField
                        label="Placeholder"
                        value={props.placeholder ?? ""}
                        onChange={(e) =>
                          handlePropsChange("placeholder", e.target.value)
                        }
                        placeholder="Enter placeholder..."
                      />
                    )}
                    {isHeading && (
                      <Select
                        label="Heading Level"
                        value={String(props.level ?? "2")}
                        onChange={(val) => handlePropsChange("level", parseInt(val))}
                        options={HEADING_LEVEL_OPTIONS}
                      />
                    )}
                    {isImage && (
                      <>
                        <PropertyField
                          label="Image URL"
                          value={props.src ?? ""}
                          onChange={(e) =>
                            handlePropsChange("src", e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                        />
                        <PropertyField
                          label="Alt Text"
                          value={props.alt ?? ""}
                          onChange={(e) =>
                            handlePropsChange("alt", e.target.value)
                          }
                          placeholder="Image description"
                        />
                      </>
                    )}
                  </div>
                </StyleSection>
              )}

              {(isContainer || isCard || isRootComponent) && (
                <StyleSection title="Layout" icon={Layout}>
                  <div className="space-y-2.5">
                    <NumberInput
                      label="Padding"
                      value={parseNumeric(styles.padding)}
                      onChange={(val) => handleStyleChange("padding", val)}
                      min={0}
                      max={200}
                      step={4}
                      unit="px"
                    />
                    <NumberInput
                      label="Gap"
                      value={parseNumeric(styles.gap)}
                      onChange={(val) => handleStyleChange("gap", val)}
                      min={0}
                      max={100}
                      step={4}
                      unit="px"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="min-w-0">
                        <Select
                          label="Width"
                          value={styles.width ?? "auto"}
                          onChange={(val) => handleStyleChange("width", val)}
                          options={WIDTH_OPTIONS}
                        />
                      </div>
                      <div className="min-w-0">
                        <Select
                          label="Height"
                          value={styles.height ?? "auto"}
                          onChange={(val) => handleStyleChange("height", val)}
                          options={HEIGHT_OPTIONS}
                        />
                      </div>
                    </div>
                  </div>
                </StyleSection>
              )}

              <StyleSection title="Appearance" icon={Palette}>
                <div className="space-y-2.5">
                  <ColorPicker
                    label="Background Color"
                    value={styles.backgroundColor ?? ""}
                    onChange={(val) => handleStyleChange("backgroundColor", val)}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={styles.color ?? ""}
                    onChange={(val) => handleStyleChange("color", val)}
                  />
                  <Slider
                    label="Border Radius"
                    value={parseNumeric(styles.borderRadius)}
                    onChange={(val) => handleStyleChange("borderRadius", val)}
                    min={0}
                    max={60}
                    step={1}
                    unit="px"
                  />
                  <Slider
                    label="Font Size"
                    value={parseNumeric(styles.fontSize)}
                    onChange={(val) => handleStyleChange("fontSize", val)}
                    min={8}
                    max={72}
                    step={1}
                    unit="px"
                  />
                  <Select
                    label="Font Weight"
                    value={styles.fontWeight ?? "400"}
                    onChange={(val) => handleStyleChange("fontWeight", val)}
                    options={FONT_WEIGHT_OPTIONS}
                  />
                  {(isButton || isContainer || isCard) && (
                    <Select
                      label="Cursor"
                      value={styles.cursor ?? "default"}
                      onChange={(val) => handleStyleChange("cursor", val)}
                      options={CURSOR_OPTIONS}
                    />
                  )}
                  {(isButton || isCard) && (
                    <>
                      <ColorPicker
                        label="Border Color"
                        value={styles.borderColor ?? ""}
                        onChange={(val) => handleStyleChange("borderColor", val)}
                      />
                      <Select
                        label="Border Style"
                        value={styles.borderStyle ?? "solid"}
                        onChange={(val) => handleStyleChange("borderStyle", val)}
                        options={BORDER_STYLE_OPTIONS}
                      />
                      <NumberInput
                        label="Border Width"
                        value={parseNumeric(styles.borderWidth)}
                        onChange={(val) => handleStyleChange("borderWidth", val)}
                        min={0}
                        max={10}
                        step={1}
                        unit="px"
                      />
                    </>
                  )}
                </div>
              </StyleSection>

              {canEditText && (
                <StyleSection title="Typography" icon={Type} defaultOpen={false}>
                  <div className="space-y-2.5">
                    <Slider
                      label="Line Height"
                      value={parseNumeric(styles.lineHeight)}
                      onChange={(val) => handleStyleChange("lineHeight", val)}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                    <Slider
                      label="Letter Spacing"
                      value={parseNumeric(styles.letterSpacing)}
                      onChange={(val) => handleStyleChange("letterSpacing", val)}
                      min={-5}
                      max={10}
                      step={0.1}
                      unit="px"
                    />
                    <Select
                      label="Text Align"
                      value={styles.textAlign ?? "left"}
                      onChange={(val) => handleStyleChange("textAlign", val)}
                      options={TEXT_ALIGN_OPTIONS}
                    />
                  </div>
                </StyleSection>
              )}

              <StyleSection title="Spacing" icon={Box} defaultOpen={false}>
                <div className="space-y-2.5">
                  <NumberInput
                    label="Margin"
                    value={parseNumeric(styles.margin)}
                    onChange={(val) => handleStyleChange("margin", val)}
                    min={-100}
                    max={200}
                    step={4}
                    unit="px"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <NumberInput
                        label="Pad Top"
                        value={parseNumeric(styles.paddingTop)}
                        onChange={(val) => handleStyleChange("paddingTop", val)}
                        min={0}
                        max={200}
                        step={4}
                        unit="px"
                      />
                    </div>
                    <div className="min-w-0">
                      <NumberInput
                        label="Pad Bottom"
                        value={parseNumeric(styles.paddingBottom)}
                        onChange={(val) => handleStyleChange("paddingBottom", val)}
                        min={0}
                        max={200}
                        step={4}
                        unit="px"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <NumberInput
                        label="Pad Left"
                        value={parseNumeric(styles.paddingLeft)}
                        onChange={(val) => handleStyleChange("paddingLeft", val)}
                        min={0}
                        max={200}
                        step={4}
                        unit="px"
                      />
                    </div>
                    <div className="min-w-0">
                      <NumberInput
                        label="Pad Right"
                        value={parseNumeric(styles.paddingRight)}
                        onChange={(val) => handleStyleChange("paddingRight", val)}
                        min={0}
                        max={200}
                        step={4}
                        unit="px"
                      />
                    </div>
                  </div>
                </div>
              </StyleSection>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRootComponent}
                  onClick={() => deleteComponent(selectedComponent.id)}
                  className="h-8 w-full gap-2 rounded-lg border-red-500/15 dark:border-red-500/20 bg-red-500/5 dark:bg-red-500/10 text-xs font-medium text-red-500 transition-all duration-150 hover:border-red-500/25 dark:hover:border-red-500/30 hover:bg-red-500/10 dark:hover:bg-red-500/15 hover:text-red-600 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Trash2 className="size-3.5" />
                  Delete component
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-border-subtle px-4 py-3">
        <p className="text-xs leading-5 text-text-muted">
          {selectedComponent ? "Editing component" : "Select a component to edit"}
        </p>
      </footer>
    </aside>
  );
}
