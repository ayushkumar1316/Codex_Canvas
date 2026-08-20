import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Select({ value = "", onChange, options = [], label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (val) => {
      onChange(val);
      setIsOpen(false);
      setIsFocused(false);
    },
    [onChange]
  );

  const displayLabel =
    options.find((o) => (typeof o === "string" ? o : o.value) === value)?.label ||
    options.find((o) => (typeof o === "string" ? o : o.value) === value) ||
    value ||
    "Select...";

  return (
    <div className="block w-full">
      {label && (
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
      )}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(!isOpen);
          }}
          className={cn(
            "flex h-7 w-full items-center justify-between gap-2 rounded-lg border px-2.5 text-xs transition-all duration-200",
            isFocused || isOpen
              ? "border-primary/40 bg-surface-0 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
              : "border-border-subtle bg-surface-1 hover:border-border-default hover:bg-surface-2"
          )}
        >
          <span className="truncate text-text-primary">{displayLabel}</span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-text-muted transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1.5 max-h-48 w-full min-w-[10rem] overflow-y-auto rounded-xl border border-border-subtle bg-surface-1 py-1 shadow-theme-lg">
            {options.map((option) => {
              const optValue = typeof option === "string" ? option : option.value;
              const optLabel =
                typeof option === "string" ? option : option.label;
              const isSelected = value === optValue;
              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => handleSelect(optValue)}
                  className={cn(
                    "flex w-full items-center gap-2 px-2.5 py-2 text-xs transition-colors duration-150",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-text-primary hover:bg-hover-surface"
                  )}
                >
                  <span className="flex-1 text-left truncate">{optLabel}</span>
                  {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
