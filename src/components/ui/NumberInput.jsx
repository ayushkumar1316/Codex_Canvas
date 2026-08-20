import { useState, useCallback, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NumberInput({
  value = "",
  onChange,
  label,
  min,
  max,
  step = 1,
  placeholder = "0",
  unit = "",
  className,
}) {
  const numericPart = parseFloat(String(value).replace(/[^0-9.\-]/g, "")) || 0;
  const [localValue, setLocalValue] = useState(String(numericPart));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(String(numericPart));
  }, [numericPart]);

  const handleInputChange = useCallback(
    (e) => {
      const raw = e.target.value;
      setLocalValue(raw);
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onChange(num + unit);
      }
    },
    [onChange, unit]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const num = parseFloat(localValue);
    if (isNaN(num)) {
      setLocalValue(String(numericPart));
      return;
    }
    let clamped = num;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    setLocalValue(String(clamped));
    if (clamped !== num) {
      onChange(clamped + unit);
    }
  }, [localValue, numericPart, min, max, onChange, unit]);

  const handleIncrement = useCallback(() => {
    let next = numericPart + step;
    if (max !== undefined) next = Math.min(max, next);
    setLocalValue(String(next));
    onChange(next + unit);
  }, [numericPart, step, max, onChange, unit]);

  const handleDecrement = useCallback(() => {
    let next = numericPart - step;
    if (min !== undefined) next = Math.max(min, next);
    setLocalValue(String(next));
    onChange(next + unit);
  }, [numericPart, step, min, onChange, unit]);

  return (
    <div className={cn("block w-full", className)}>
      {label && (
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex h-7 items-center overflow-hidden rounded-lg border transition-all duration-200",
          isFocused
            ? "border-primary/40 bg-surface-0 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
            : "border-border-subtle bg-surface-1 hover:border-border-default"
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          className="flex size-7 shrink-0 items-center justify-center text-text-muted transition-all duration-150 hover:bg-surface-3 hover:text-text-primary active:scale-90"
          tabIndex={-1}
          aria-label="Decrease"
        >
          <Minus className="size-3" strokeWidth={2} />
        </button>
        <div className="h-3.5 w-px bg-border-subtle" />
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-center text-[11px] font-medium text-text-primary outline-none placeholder:text-text-muted tabular-nums"
        />
        <div className="h-3.5 w-px bg-border-subtle" />
        <button
          type="button"
          onClick={handleIncrement}
          className="flex size-7 shrink-0 items-center justify-center text-text-muted transition-all duration-150 hover:bg-surface-3 hover:text-text-primary active:scale-90"
          tabIndex={-1}
          aria-label="Increase"
        >
          <Plus className="size-3" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
