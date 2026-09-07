import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Streaming progress indicator component
 * Shows real-time progress during AI generation
 */
export function StreamingProgress() {
  const streamingProgress = useAppStore((state) => state.streamingProgress);
  const aiPhase = useAppStore((state) => state.aiPhase);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (streamingProgress?.status === "streaming") {
      setIsVisible(true);
    } else if (streamingProgress?.status === "complete") {
      setTimeout(() => setIsVisible(false), 1500);
    }
  }, [streamingProgress]);

  if (!isVisible) return null;

  const operationCount = streamingProgress?.operationCount || 0;
  const isComplete = streamingProgress?.status === "complete";

  return (
    <div
      className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 transform transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {!isComplete && (
            <div className="flex gap-1">
              <span className="inline-block size-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
              <span className="inline-block size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
              <span className="inline-block size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">
              {isComplete ? "Generation complete" : "Generating..."}{" "}
              <span className="text-primary">{operationCount} operations</span>
            </span>

            {streamingProgress?.lastOperation && (
              <span className="text-xs text-text-muted">
                Last: {streamingProgress.lastOperation.type}
                {streamingProgress.lastOperation.targetId &&
                  ` on ${streamingProgress.lastOperation.targetId}`}
              </span>
            )}
          </div>

          {isComplete && (
            <div className="ml-2 flex size-5 items-center justify-center rounded-full bg-green-500/20">
              <div className="size-2 rounded-full bg-green-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreamingProgress;
