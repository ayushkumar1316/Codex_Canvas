import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#000000", "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1",
  "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

function isValidColor(value) {
  if (!value) return false;
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return true;
  if (/^rgb\(/.test(value) || /^hsl\(/.test(value)) return true;
  return false;
}

export default function ColorPicker({ value = "", onChange, label }) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const nativeRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setInputValue(val);
      if (isValidColor(val)) {
        onChange(val);
      }
    },
    [onChange]
  );

  const handlePresetClick = useCallback(
    (color) => {
      setInputValue(color);
      onChange(color);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleNativeChange = useCallback(
    (e) => {
      const color = e.target.value;
      setInputValue(color);
      onChange(color);
    },
    [onChange]
  );

  return (
    <div className="block w-full">
      {label && (
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
      )}
      <div className="relative" ref={panelRef}>
        <div className={`flex h-7 items-center gap-2 rounded-lg border px-2 transition-all duration-200 ${
          isOpen
            ? "border-primary/40 bg-surface-0 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
            : "border-border-subtle bg-surface-1 hover:border-border-default"
        }`}>
          <button
            type="button"
            className="size-5 shrink-0 rounded-md border border-border-default shadow-sm cursor-pointer transition-transform hover:scale-110"
            style={{ backgroundColor: inputValue || "transparent" }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Choose color"
          />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="#000000"
            className="h-full min-w-0 flex-1 bg-transparent text-xs font-medium text-text-primary outline-none placeholder:text-text-muted"
          />
          <input
            ref={nativeRef}
            type="color"
            value={inputValue || "#000000"}
            onChange={handleNativeChange}
            className="absolute opacity-0 size-0 pointer-events-none"
            tabIndex={-1}
          />
          <button
            type="button"
            onClick={() => nativeRef.current?.click?.()}
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-text-secondary"
          >
            pick
          </button>
        </div>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-border-subtle bg-surface-1 p-3 shadow-theme-lg">
            <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
              Presets
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`size-6 rounded-lg border-2 transition-all duration-150 hover:scale-110 hover:shadow-sm ${
                    inputValue === color
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-transparent hover:border-border-default"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
