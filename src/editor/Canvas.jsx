import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useNewComponentTracker } from "@/hooks/useNewComponentTracker";
import Renderer from "@/renderer/Renderer";
import EmptyState from "@/editor/EmptyState";

export default function Canvas() {
  const componentTree = useAppStore((state) => state.componentTree);
  const aiPhase = useAppStore((state) => state.aiPhase);
  const hasChildren = (componentTree?.children?.length ?? 0) > 0;
  const reduced = useReducedMotion();
  const newIds = useNewComponentTracker(componentTree);

  const [showRipple, setShowRipple] = useState(false);
  const prevPhaseRef = useRef(aiPhase);

  useEffect(() => {
    if (prevPhaseRef.current === "applying" && aiPhase === "success" && !reduced) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 400);
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = aiPhase;
  }, [aiPhase, reduced]);

  const isProcessing = aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying";

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0a0a0e]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.05)_0%,transparent_50%)]" />

      <div
        className={`relative flex min-h-0 flex-1 flex-col overflow-y-auto ${
          isProcessing && !reduced ? "animate-canvas-glow" : ""
        }`}
      >
        {showRipple && !reduced && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 animate-success-ripple" />
        )}

        {hasChildren ? (
          <div className="mx-auto w-full max-w-5xl px-6 pt-8 pb-40">
            <div className="overflow-hidden rounded-xl shadow-[0_4px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
              <Renderer tree={componentTree} newIds={newIds} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-10">
            <EmptyState />
          </div>
        )}
      </div>
    </main>
  );
}
