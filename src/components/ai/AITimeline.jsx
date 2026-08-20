import { useEffect, useReducer, useRef, useState } from "react";
import { Check, Circle, Sparkles, Zap, Bolt, Globe, Cpu } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getProviderTheme } from "@/ai/providerRegistry";
import { getModel } from "@/ai/models";

const phases = [
  { key: "understanding", label: "Understanding Prompt" },
  { key: "planning", label: "Planning Changes" },
  { key: "applying", label: "Generating Components" },
];

const ICONS = {
  auto: Sparkles,
  gemini: Zap,
  groq: Bolt,
  openrouter: Globe,
  openai: Cpu,
};

function timelineReducer(state, action) {
  switch (action.type) {
    case "PROCESSING":
      return { visible: true, exiting: false };
    case "EXIT_START":
      return { ...state, exiting: true };
    case "EXIT_DONE":
      return { visible: false, exiting: false };
    case "ERROR":
      return { visible: false, exiting: false };
    default:
      return state;
  }
}

export default function AITimeline() {
  const aiPhase = useAppStore((state) => state.aiPhase);
  const aiActiveProvider = useAppStore((s) => s.aiActiveProvider);
  const aiProvider = useAppStore((s) => s.aiProvider);
  const aiModel = useAppStore((s) => s.aiModel);
  const reduced = useReducedMotion();
  const pillRef = useRef(null);
  const [offset, setOffset] = useState(140);
  const [state, dispatch] = useReducer(timelineReducer, {
    visible: false,
    exiting: false,
  });

  useEffect(() => {
    const pill = document.querySelector("[data-ai-pill]");
    if (!pill) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        setOffset(rect.height + 24);
      }
    });
    obs.observe(pill);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying") {
      dispatch({ type: "PROCESSING" });
    } else if (aiPhase === "success") {
      dispatch({ type: "EXIT_START" });
      const timer = setTimeout(() => dispatch({ type: "EXIT_DONE" }), 600);
      return () => clearTimeout(timer);
    } else if (aiPhase === "error") {
      dispatch({ type: "ERROR" });
    }
  }, [aiPhase]);

  if (!state.visible) return null;

  const activeIndex = phases.findIndex((p) => p.key === aiPhase);
  const activeId = aiActiveProvider || (aiProvider === "auto" ? "gemini" : aiProvider);
  const activeTheme = getProviderTheme(activeId);
  const ActiveIcon = ICONS[activeId] || Sparkles;
  const modelInfo = getModel(aiModel);
  const modelName = modelInfo?.displayName || aiModel || null;

  return (
    <div
      ref={pillRef}
      className={`fixed left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-subtle dark:border-[rgba(139,92,246,0.15)] bg-surface-1/90 dark:bg-surface-2/90 px-4 py-3 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        state.exiting && !reduced ? "opacity-0 translate-y-2 scale-95" : "opacity-100"
      }`}
      style={{ bottom: offset }}
    >
      <div className="flex items-center gap-3">
        {phases.map((phase, i) => {
          const isComplete = i < activeIndex || aiPhase === "success";
          const isCurrent = i === activeIndex && aiPhase !== "success";

          return (
            <div key={phase.key} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {isComplete ? (
                  <Check className="size-3 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-40" />
                    <span className="relative inline-flex size-3 rounded-full bg-violet-500" />
                  </span>
                ) : (
                  <Circle className="size-3 text-text-muted" />
                )}
                <span
                  className={`text-xs font-medium ${
                    isComplete
                      ? "text-emerald-400"
                      : isCurrent
                        ? "text-violet-300"
                        : "text-text-muted"
                  }`}
                >
                  {phase.label}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div className={`h-px w-4 ${isComplete ? "bg-emerald-500/30" : "bg-zinc-700/50"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
        <ActiveIcon className={`size-3 ${activeTheme.colorClass}`} />
        <span className="font-medium text-text-primary">{activeTheme.name}</span>
        {modelName && (
          <>
            <span className="text-text-muted">&middot;</span>
            <span className="text-text-secondary">{modelName}</span>
          </>
        )}
        {!reduced && (
          <>
            <span className="text-text-muted">&middot;</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-3 bg-violet-400 animate-[cursor-blink_1s_infinite]" />
              Generating...
            </span>
          </>
        )}
      </div>
    </div>
  );
}
