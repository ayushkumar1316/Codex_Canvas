import { Check, AlertCircle, Zap, Globe, Cpu, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
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

const PROVIDER_ICONS = {
  auto: Sparkles,
  gemini: Zap,
  openrouter: Globe,
  openai: Cpu,
};

const PROVIDER_COLORS = {
  auto: "text-purple-400",
  gemini: "text-blue-400",
  openrouter: "text-violet-400",
  openai: "text-emerald-400",
};

function getErrorText(error) {
  if (!error?.message) return "Something went wrong";
  const msg = error.message;
  if (error.type === "all_providers_unavailable") return msg;
  if (error.type === "all_providers_failed") return msg;
  if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "Rate limited. Switching provider...";
  }
  if (msg.includes("quota")) return "Daily quota exceeded";
  if (msg.includes("503") || msg.includes("UNAVAILABLE")) return "Provider temporarily unavailable";
  if (msg.includes("timeout") || msg.includes("Timeout")) return "Request timed out";
  if (error.type === "provider_error") return msg;
  if (error.type === "validation") return "AI response could not be applied";
  if (error.type === "request") return msg;
  return "Something went wrong. Please try again.";
}

export default function AIStatus({ phase = "idle", error = null }) {
  const config = phaseConfig[phase];
  const aiActiveProvider = useAppStore((s) => s.aiActiveProvider);
  const aiProvider = useAppStore((s) => s.aiProvider);

  if (!config) return null;

  const Icon = config.icon;
  const isThinking = phase === "understanding" || phase === "planning" || phase === "applying";
  const displayText = phase === "error" ? getErrorText(error) : config.text;

  const activeId = aiActiveProvider || (aiProvider === "auto" ? "gemini" : aiProvider);
  const ProviderIcon = PROVIDER_ICONS[activeId] || Sparkles;
  const providerColor = PROVIDER_COLORS[activeId] || "text-zinc-400";
  const providerName = activeId === "auto" ? "Auto" : activeId.charAt(0).toUpperCase() + activeId.slice(1);

  return (
    <div
      className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${config.className}`}
      role="status"
      aria-live="polite"
    >
      {isThinking && <ThinkingIndicator />}
      {isThinking ? (
        <ProviderIcon className={`size-3 ${providerColor}`} />
      ) : Icon ? (
        <Icon className="size-3" />
      ) : null}
      <span>
        {isThinking ? `${providerName} \u00B7 ` : ""}{displayText}
      </span>
    </div>
  );
}
