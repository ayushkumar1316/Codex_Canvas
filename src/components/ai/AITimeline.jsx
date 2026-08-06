import { useEffect, useReducer } from "react";
import { Check, Circle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const phases = [
  { key: "understanding", label: "Understanding Prompt" },
  { key: "planning", label: "Planning Changes" },
  { key: "applying", label: "Generating Components" },
];

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
  const reduced = useReducedMotion();
  const [state, dispatch] = useReducer(timelineReducer, {
    visible: false,
    exiting: false,
  });

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

  return (
    <div
      className={`fixed bottom-[140px] left-1/2 z-40 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0a0a0e]/90 px-4 py-3 shadow-xl backdrop-blur-xl transition-all duration-300 ${
        state.exiting && !reduced ? "opacity-0 translate-y-2 scale-95" : "opacity-100"
      }`}
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
                  <Circle className="size-3 text-zinc-600" />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    isComplete
                      ? "text-emerald-400"
                      : isCurrent
                        ? "text-violet-300"
                        : "text-zinc-600"
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

      {!reduced && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span className="inline-block w-1.5 h-3 bg-violet-400 animate-[cursor-blink_1s_infinite]" />
          Generating...
        </div>
      )}
    </div>
  );
}
