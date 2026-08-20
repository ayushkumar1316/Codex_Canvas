import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = "",
  showValue = true,
}) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const percent = Math.min(Math.max(((localValue - min) / (max - min)) * 100, 0), 100);

  const handleChange = useCallback(
    (e) => {
      const val = Number(e.target.value);
      setLocalValue(val);
      onChange(val + unit);
    },
    [onChange, unit]
  );

  return (
    <div className="block w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label}
          </span>
          {showValue && (
            <span className="text-[11px] font-medium text-text-secondary tabular-nums">
              {localValue}{unit}
            </span>
          )}
        </div>
      )}
      <div className="group relative flex h-5 items-center" ref={trackRef}>
        {/* Track background */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-3">
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Visible thumb */}
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface-0 shadow-sm transition-all duration-150",
            isDragging ? "scale-110 shadow-md" : "group-hover:scale-110"
          )}
          style={{ left: `${percent}%` }}
        />

        {/* Invisible range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
