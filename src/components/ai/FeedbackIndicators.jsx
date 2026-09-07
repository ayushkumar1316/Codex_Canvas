import { useAppStore } from "@/store/useAppStore";
import { AlertCircle } from "lucide-react";

/**
 * Confidence Indicator
 * Shows when AI is uncertain about a request
 */
export function ConfidenceIndicator() {
  const aiPhase = useAppStore((state) => state.aiPhase);
  const aiError = useAppStore((state) => state.aiError);

  if (aiPhase !== "error" || !aiError) return null;

  const message =
    aiError.type === "validation"
      ? "Could not apply changes. Try rephrasing."
      : "Something went wrong. Please try again.";

  return (
    <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="size-4 text-amber-500" />
        <span className="text-sm text-amber-700 dark:text-amber-400">
          {message}
        </span>
      </div>
    </div>
  );
}

export default function FeedbackIndicators() {
  return <ConfidenceIndicator />;
}
