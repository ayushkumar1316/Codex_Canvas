import { Check, AlertCircle, Sparkles, Activity, Zap, Bolt, Globe, Cpu } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getProviderTheme } from "@/ai/providerRegistry";
import { getFriendlyErrorMessage } from "@/ai/providerManager";
import { getModel } from "@/ai/models";
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

const ICON_COMPONENTS = {
  auto: Sparkles,
  gemini: Zap,
  groq: Bolt,
  openrouter: Globe,
  openai: Cpu,
};

export default function AIStatus({ phase = "idle", error = null }) {
  const config = phaseConfig[phase];
  const aiActiveProvider = useAppStore((s) => s.aiActiveProvider);
  const aiProvider = useAppStore((s) => s.aiProvider);
  const aiModel = useAppStore((s) => s.aiModel);

  if (!config) return null;

  const Icon = config.icon;
  const isThinking = phase === "understanding" || phase === "planning" || phase === "applying";

  const activeId = aiActiveProvider || (aiProvider === "auto" ? "gemini" : aiProvider);
  const activeTheme = getProviderTheme(activeId);
  const ProviderIcon = ICON_COMPONENTS[activeId] || Sparkles;

  const modelInfo = getModel(aiModel);
  const modelName = modelInfo?.displayName || aiModel || activeTheme.name;

  let displayText;
  if (phase === "error") {
    displayText = getFriendlyErrorMessage(error, activeId);
  } else {
    displayText = config.text;
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${config.className}`}
      role="status"
      aria-live="polite"
    >
      {isThinking && <ThinkingIndicator />}
      {isThinking ? (
        <>
          <ProviderIcon className={`size-3 ${activeTheme.colorClass}`} />
          <span className="font-medium">{modelName}</span>
          <span className="text-text-muted">{" "}&middot;{" "}</span>
          <span>{displayText}</span>
          <Activity className="size-3 animate-pulse text-purple-400" />
        </>
      ) : Icon ? (
        <>
          <Icon className="size-3" />
          <span>{displayText}</span>
        </>
      ) : null}
    </div>
  );
}
