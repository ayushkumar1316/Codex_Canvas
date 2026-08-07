import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  ChevronDown,
  Check,
  Circle,
  Zap,
  Globe,
  Cpu,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getProviderHealth } from "@/ai/providerManager";

const PROVIDERS = [
  {
    id: "auto",
    name: "Auto",
    description: "Recommended",
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    models: [],
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Fast \u00B7 Native Vision",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    models: [
      { id: "gemini-3.5-flash-lite", name: "Gemini Flash Lite" },
      { id: "gemini-2.0-flash", name: "Gemini Flash" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Multiple Free Models",
    icon: Globe,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    models: [
      { id: "qwen-vl", name: "Qwen VL" },
      { id: "llama-vision", name: "Llama Vision" },
      { id: "deepseek", name: "DeepSeek" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "High-quality generation",
    icon: Cpu,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
    ],
  },
];

function getStatusColor(providerId) {
  if (providerId === "auto") return "bg-purple-400";
  try {
    const h = getProviderHealth();
    const info = h[providerId];
    if (!info) return "bg-zinc-500";
    if (Date.now() < info.cooldownUntil) return "bg-amber-400";
    if (info.failureCount >= 3) return "bg-amber-400";
    if (info.lastSuccess > 0) return "bg-emerald-400";
    return "bg-zinc-500";
  } catch {
    return "bg-zinc-500";
  }
}

export default function ProviderSelector({ variant = "landing" }) {
  const [open, setOpen] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState(null);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  const aiProvider = useAppStore((s) => s.aiProvider);
  const aiModel = useAppStore((s) => s.aiModel);
  const aiActiveProvider = useAppStore((s) => s.aiActiveProvider);
  const aiPhase = useAppStore((s) => s.aiPhase);
  const setAIProvider = useAppStore((s) => s.setAIProvider);
  const setAIModel = useAppStore((s) => s.setAIModel);

  const selected = PROVIDERS.find((p) => p.id === aiProvider) || PROVIDERS[0];
  const activeProviderId = aiActiveProvider || (aiProvider === "auto" ? "gemini" : aiProvider);
  const activeProvider = PROVIDERS.find((p) => p.id === activeProviderId);

  const isGenerating = aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying";

  const close = useCallback(() => {
    setOpen(false);
    setHoveredProvider(null);
    setFocusIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        close();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setFocusIndex(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => (i + 1) % PROVIDERS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => (i - 1 + PROVIDERS.length) % PROVIDERS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusIndex >= 0) {
        const p = PROVIDERS[focusIndex];
        setAIProvider(p.id);
        if (p.models.length > 0 && !p.models.find((m) => m.id === aiModel)) {
          setAIModel(p.models[0].id);
        }
        close();
      }
    }
  };

  const pillBase = variant === "landing"
    ? "flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]"
    : "flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-[11px] font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]";

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        aria-label={`AI Provider: ${selected.name}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${pillBase} min-w-[100px] h-9 justify-center ${open ? "border-purple-500/30 bg-purple-500/10" : ""}`}
      >
        {isGenerating ? (
          <>
            {activeProvider && <activeProvider.icon className={`size-3.5 ${activeProvider.color}`} />}
            <span className="hidden sm:inline">
              {aiProvider === "auto" ? "Auto" : activeProvider?.name || "AI"}
            </span>
          </>
        ) : (
          <>
            <selected.icon className={`size-3.5 ${selected.color}`} />
            <span className="hidden sm:inline">{selected.name}</span>
          </>
        )}
        <span className={`size-1.5 rounded-full ${getStatusColor(activeProviderId)} transition-colors duration-300`} />
        <ChevronDown className={`size-3.5 text-zinc-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select AI provider"
          className="absolute bottom-full left-0 z-50 mb-2 w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          onKeyDown={handleKeyDown}
        >
          <div className="border-b border-white/[0.05] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              AI Provider
            </p>
          </div>

          <div className="p-1.5">
            {PROVIDERS.map((provider, idx) => {
              const Icon = provider.icon;
              const isSelected = aiProvider === provider.id;
              const isHovered = hoveredProvider === provider.id;
              const isFocused = focusIndex === idx;
              const statusColor = getStatusColor(provider.id);

              return (
                <div key={provider.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setAIProvider(provider.id);
                      if (provider.models.length > 0 && !provider.models.find((m) => m.id === aiModel)) {
                        setAIModel(provider.models[0].id);
                      }
                      close();
                    }}
                    onMouseEnter={() => {
                      setHoveredProvider(provider.id);
                      setFocusIndex(idx);
                    }}
                    onMouseLeave={() => setHoveredProvider(null)}
                    onFocus={() => setFocusIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      isSelected || isFocused
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${provider.bg} border ${provider.border}`}>
                      <Icon className={`size-4 ${provider.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-zinc-200">
                          {provider.name}
                        </span>
                        <span className={`size-1.5 rounded-full ${statusColor}`} />
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {provider.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-purple-400" />
                    )}
                  </button>

                  {isSelected && provider.models.length > 0 && (isHovered || isSelected) && (
                    <div className="ml-11 mt-0.5 mb-1 space-y-0.5">
                      {provider.models.map((model) => {
                        const isModelSelected = aiModel === model.id || (!aiModel && model === provider.models[0]);
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAIModel(model.id);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-all duration-150 ${
                              isModelSelected
                                ? "bg-purple-500/10 text-purple-300"
                                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-300"
                            }`}
                          >
                            <Circle className={`size-1.5 ${isModelSelected ? "fill-purple-400 text-purple-400" : "text-zinc-600"}`} />
                            <span className="text-[12px]">{model.name}</span>
                            {isModelSelected && (
                              <Check className="ml-auto size-3 text-purple-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
