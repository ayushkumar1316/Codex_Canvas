import { useState, useRef, useEffect, useCallback } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "light", label: "Light", icon: Sun, description: "Bright background" },
  { id: "dark", label: "Dark", icon: Moon, description: "Dim background" },
  { id: "system", label: "System", icon: Monitor, description: "Match OS setting" },
];

export default function ThemeSelector({ value = "dark", onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = THEMES.find((t) => t.id === value) || THEMES[1];
  const Icon = current.icon;

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSelect = useCallback((id) => {
    onChange(id);
    setOpen(false);
  }, [onChange]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
          open
            ? "border-primary/30 bg-primary/5 text-text-primary"
            : "border-border-subtle dark:border-[rgba(139,92,246,0.12)] bg-surface-1 dark:bg-surface-2/50 text-text-secondary hover:border-border-default hover:bg-surface-2 hover:text-text-primary"
        )}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <Icon className="size-3.5" strokeWidth={1.8} />
        <span className="hidden sm:inline">Theme</span>
        <ChevronDown className={cn("size-3 text-text-muted transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-border-subtle dark:border-[rgba(139,92,246,0.12)] bg-surface-1 dark:bg-surface-2 p-1 shadow-theme-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {THEMES.map((theme) => {
            const ThemeIcon = theme.icon;
            const isActive = value === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-primary hover:bg-hover-surface"
                )}
              >
                <ThemeIcon className="size-3.5 shrink-0" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">{theme.label}</div>
                  <div className="text-[10px] text-text-muted">{theme.description}</div>
                </div>
                {isActive && (
                  <div className="size-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
