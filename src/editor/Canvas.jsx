import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useNewComponentTracker } from "@/hooks/useNewComponentTracker";
import { getDeviceWidth } from "@/components/ui/DevicePreview";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Renderer from "@/renderer/Renderer";
import EmptyState from "@/editor/EmptyState";

const DEVICE_FRAME_COLORS = {
  tablet: "border-border-default",
  mobile: "border-border-default",
};

const DEVICE_LABELS = {
  tablet: "768px",
  mobile: "375px",
};

export default function Canvas() {
  const componentTree = useAppStore((state) => state.componentTree);
  const aiPhase = useAppStore((state) => state.aiPhase);
  const previewDevice = useAppStore((state) => state.previewDevice);
  const editorMode = useAppStore((state) => state.editorMode);
  const hasChildren = (componentTree?.children?.length ?? 0) > 0;
  const reduced = useReducedMotion();
  const newIds = useNewComponentTracker(componentTree);

  const [showRipple, setShowRipple] = useState(false);
  const [showSweep, setShowSweep] = useState(false);
  const prevPhaseRef = useRef(aiPhase);

  useEffect(() => {
    if (prevPhaseRef.current === "applying" && aiPhase === "success" && !reduced) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 500);
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = aiPhase;
  }, [aiPhase, reduced]);

  useEffect(() => {
    if (aiPhase === "applying" && !reduced) {
      setShowSweep(true);
      const timer = setTimeout(() => setShowSweep(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [aiPhase, reduced]);

  const isProcessing = aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying";

  const deviceWidth = getDeviceWidth(previewDevice);
  const hasDeviceFrame = deviceWidth !== null;

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-0 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--glow-color)_0%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 55%, var(--canvas-vignette) 100%)` }} />
      <div className="pointer-events-none absolute inset-0 opacity-100 dark:opacity-60" style={{ backgroundImage: `radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

      <div
        className={`relative flex min-h-0 flex-1 flex-col overflow-y-auto ${
          isProcessing && !reduced ? "animate-canvas-glow" : ""
        }`}
      >
        {showRipple && !reduced && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 size-40 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-0 rounded-full bg-purple-500/25 animate-success-burst" />
            <div className="absolute inset-2 rounded-full bg-violet-400/15 animate-success-burst" style={{ animationDelay: "100ms" }} />
          </div>
        )}

        {hasChildren ? (
          <div className={`mx-auto w-full px-6 pt-8 pb-40 ${hasDeviceFrame ? "flex flex-col items-center" : "max-w-5xl"}`}>
            {hasDeviceFrame && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  {previewDevice.replace("-", " ")}
                </span>
                <span className="text-[10px] text-text-muted">
                  {DEVICE_LABELS[previewDevice]}
                </span>
              </div>
            )}
            <div
              className={`relative overflow-hidden ${
                hasDeviceFrame
                  ? `rounded-2xl border-2 ${DEVICE_FRAME_COLORS[previewDevice] || "border-border-default"} shadow-theme-xl`
                  : "rounded-xl shadow-theme-lg"
              }`}
              style={hasDeviceFrame ? { width: deviceWidth, maxWidth: "100%" } : undefined}
            >
              {showSweep && !reduced && (
                <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[light-sweep_1.2s_ease-in-out] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                </div>
              )}
              <div
                className="bg-white"
                style={hasDeviceFrame ? { minHeight: deviceWidth === 375 ? 667 : deviceWidth === 768 ? 1024 : 400 } : undefined}
              >
                <Renderer tree={componentTree} newIds={newIds} />
              </div>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-10">
            <div className="w-full max-w-2xl space-y-4">
              <SkeletonCard className="animate-pulse-ring" />
              <div className="grid grid-cols-2 gap-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
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
