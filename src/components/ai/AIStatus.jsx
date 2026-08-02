import { Check, AlertCircle } from "lucide-react";
import ThinkingIndicator from "./ThinkingIndicator";

const phaseConfig = {
  idle: null,
  understanding: {
    text: "Understanding your request",
    className: "text-violet-300",
  },
  planning: {
    text: "Planning the required changes",
    className: "text-fuchsia-300",
  },
  applying: {
    text: "Applying changes to your canvas",
    className: "text-sky-300",
  },
  success: {
    icon: Check,
    text: "Changes applied successfully",
    className: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    text: "Something went wrong",
    className: "text-red-400",
  },
};

export default function AIStatus({ phase = "idle" }) {
  const config = phaseConfig[phase];

  if (!config) return null;

  const Icon = config.icon;
  const isThinking = phase === "understanding" || phase === "planning" || phase === "applying";

  return (
    <div
      className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${config.className}`}
      role="status"
      aria-live="polite"
    >
      {isThinking && <ThinkingIndicator />}
      {Icon && <Icon className="size-3" />}
      <span>{config.text}</span>
    </div>
  );
}
