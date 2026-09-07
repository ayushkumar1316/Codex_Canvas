import { useAppStore } from "@/store/useAppStore";
import { Zap, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Token Usage & Cost Indicator
 * Shows real-time API usage during generation
 */
export function TokenUsageIndicator() {
  const streamingProgress = useAppStore((state) => state.streamingProgress);
  const aiPhase = useAppStore((state) => state.aiPhase);

  if (!streamingProgress) return null;

  // Rough estimation: ~1 token per 4 characters average
  const estimatedTokens = streamingProgress.operationCount * 150;
  const estimatedCost = (estimatedTokens / 1000000) * 0.5; // $0.50 per 1M tokens (Groq pricing)

  return (
    <div className="fixed top-6 right-6 z-40 rounded-lg border border-primary/20 bg-surface-1 px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Zap className="size-4 text-primary" />
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-text-primary">
            ~{estimatedTokens.toLocaleString()} tokens
          </div>
          <div className="text-xs text-text-muted">
            Est. ${estimatedCost.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Confidence Indicator
 * Shows when AI is uncertain about a request
 */
export function ConfidenceIndicator() {
  const aiPhase = useAppStore((state) => state.aiPhase);
  const aiError = useAppStore((state) => state.aiError);

  if (aiPhase !== "error" || !aiError) return null;

  const confidence =
    aiError.type === "validation"
      ? { level: "low", message: "Could not apply changes. Try rephrasing." }
      : { level: "medium", message: "Something went wrong. Please try again." };

  return (
    <div className="fixed top-6 right-6 z-40 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="size-4 text-amber-500" />
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Confidence: {confidence.level}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-300">
            {confidence.message}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Success Feedback Badge
 * Confirms successful edits
 */
export function SuccessIndicator() {
  const aiPhase = useAppStore((state) => state.aiPhase);
  const streamingProgress = useAppStore((state) => state.streamingProgress);

  if (
    aiPhase !== "success" ||
    streamingProgress?.status !== "complete"
  ) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-40 animate-in fade-in slide-in-from-top-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-4 text-green-500" />
        <div className="text-sm font-medium text-green-700 dark:text-green-400">
          Changes applied successfully
        </div>
      </div>
    </div>
  );
}

export default function FeedbackIndicators() {
  return (
    <>
      <TokenUsageIndicator />
      <ConfidenceIndicator />
      <SuccessIndicator />
    </>
  );
}
