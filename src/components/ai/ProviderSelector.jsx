import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  ChevronDown,
  Check,
  Circle,
  Zap,
  Globe,
  Cpu,
  Bolt,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  getProviderIds,
  getProviderTheme,
  CAPABILITY_COLORS,
  CAPABILITY_LABELS,
} from "@/ai/providerRegistry";
import {
  getProviderStatus,
  getProviderModel,
  hasApiKey,
  runHealthCheck,
  testConnection,
  getCachedHealth,
  getAllDiagnostics,
} from "@/ai/providerManager";

const ICONS = {
  auto: Sparkles,
  gemini: Zap,
  groq: Bolt,
  openrouter: Globe,
  openai: Cpu,
};

const STATUS_THEME = {
  ready: { label: "Ready", color: "bg-emerald-400", textColor: "text-emerald-400" },
  busy: { label: "Busy", color: "bg-amber-400", textColor: "text-amber-400" },
  rate_limited: { label: "Rate Limited", color: "bg-orange-400", textColor: "text-orange-400" },
  offline: { label: "Offline", color: "bg-red-400", textColor: "text-red-400" },
  api_key_missing: { label: "API Key Missing", color: "bg-red-400", textColor: "text-red-400" },
  disabled: { label: "Disabled", color: "bg-zinc-500", textColor: "text-zinc-500" },
  unknown: { label: "Unknown", color: "bg-zinc-500", textColor: "text-zinc-500" },
};

function getStatusForSelector(providerId) {
  if (providerId === "auto") {
    return { status: "ready", color: "bg-amber-400" };
  }
  try {
    const status = getProviderStatus(providerId);
    const config = STATUS_THEME[status] || STATUS_THEME.unknown;
    return { status, color: config.color };
  } catch {
    return { status: "unknown", color: "bg-zinc-500" };
  }
}

function formatTime(ts) {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ProviderSelector({ variant = "landing" }) {
  const [open, setOpen] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [testing, setTesting] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [healthData, setHealthData] = useState({});
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  const aiProvider = useAppStore((s) => s.aiProvider);
  const aiModel = useAppStore((s) => s.aiModel);
  const aiActiveProvider = useAppStore((s) => s.aiActiveProvider);
  const aiPhase = useAppStore((s) => s.aiPhase);
  const aiError = useAppStore((s) => s.aiError);
  const setAIProvider = useAppStore((s) => s.setAIProvider);
  const setAIModel = useAppStore((s) => s.setAIModel);

  const selectedTheme = getProviderTheme(aiProvider);
  const activeProviderId = aiActiveProvider || (aiProvider === "auto" ? "gemini" : aiProvider);
  const activeTheme = getProviderTheme(activeProviderId);
  const ActiveIcon = ICONS[activeProviderId] || Sparkles;

  const isGenerating = aiPhase === "understanding" || aiPhase === "planning" || aiPhase === "applying";

  const fallbackInfo = (() => {
    if (aiError && aiProvider === "auto") {
      const msg = aiError.message || "";
      if (msg.includes("rate") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        return {
          message: `${activeTheme.name} became rate limited.`,
          switchingTo: null,
        };
      }
    }
    return null;
  })();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cached = getCachedHealth();
        if (cached) {
          if (!cancelled) setHealthData(cached);
          return;
        }
        const data = await runHealthCheck();
        if (!cancelled) setHealthData(data);
      } catch { /* noop */ }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRefreshHealth = useCallback(async (e) => {
    e.stopPropagation();
    const data = await runHealthCheck(true);
    setHealthData(data);
  }, []);

  const handleTestConnection = useCallback(async (providerId, e) => {
    e.stopPropagation();
    setTesting(providerId);
    setTestResults((prev) => ({ ...prev, [providerId]: null }));
    try {
      const result = await testConnection(providerId);
      setTestResults((prev) => ({ ...prev, [providerId]: result }));
      const data = await runHealthCheck(true);
      setHealthData(data);
    } finally {
      setTesting(null);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setHoveredProvider(null);
    setFocusIndex(-1);
    setExpandedCard(null);
    setShowDiagnostics(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        close();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  const handleKeyDown = (e) => {
    const allProviders = ["auto", ...getProviderIds()];
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setFocusIndex(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => (i + 1) % allProviders.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => (i - 1 + allProviders.length) % allProviders.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusIndex >= 0) {
        const id = allProviders[focusIndex];
        const theme = getProviderTheme(id);
        setAIProvider(id);
        if (theme.models.length > 0 && !theme.models.find((m) => m.id === aiModel)) {
          setAIModel(theme.models[0].id);
        }
        close();
      }
    }
  };

  const pillBase = variant === "landing"
    ? "flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]"
    : "flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-[11px] font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]";

  const allProviders = ["auto", ...getProviderIds()];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        aria-label={`AI Provider: ${selectedTheme.name}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${pillBase} min-w-[100px] h-9 justify-center ${open ? "border-purple-500/30 bg-purple-500/10" : ""}`}
      >
        {isGenerating ? (
          <>
            <ActiveIcon className={`size-3.5 ${activeTheme.colorClass}`} />
            <span className="hidden sm:inline">
              {aiProvider === "auto" ? "Auto" : activeTheme.name}
            </span>
          </>
        ) : (
          <>
            {(() => { const SelIcon = ICONS[aiProvider] || Sparkles; return <SelIcon className={`size-3.5 ${selectedTheme.colorClass}`} />; })()}
            <span className="hidden sm:inline">{selectedTheme.name}</span>
          </>
        )}
        <span className={`size-1.5 rounded-full ${getStatusForSelector(activeProviderId).color} transition-colors duration-300`} />
        <ChevronDown className={`size-3.5 text-zinc-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select AI provider"
          className="absolute bottom-full left-0 z-50 mb-2 w-80 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              AI Provider
            </p>
            <button
              type="button"
              onClick={handleRefreshHealth}
              className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
              title="Refresh health status"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>

          {isGenerating && (
            <div className="flex items-center gap-2 border-b border-white/[0.05] bg-purple-500/5 px-4 py-2.5">
              <ActiveIcon className={`size-3.5 ${activeTheme.colorClass}`} />
              <span className="text-[11px] text-zinc-300">
                Generating with <span className="font-medium text-zinc-200">{activeTheme.name}...</span>
              </span>
              <Activity className="ml-auto size-3 animate-pulse text-purple-400" />
            </div>
          )}

          {fallbackInfo && (
            <div className="flex items-center gap-2 border-b border-white/[0.05] bg-amber-500/5 px-4 py-2.5">
              <AlertTriangle className="size-3.5 text-amber-400" />
              <span className="text-[11px] text-zinc-300">{fallbackInfo.message}</span>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto p-1.5">
            {allProviders.map((providerId, idx) => {
              const theme = getProviderTheme(providerId);
              const Icon = ICONS[providerId] || Sparkles;
              const isSelected = aiProvider === providerId;
              const isHovered = hoveredProvider === providerId;
              const isFocused = focusIndex === idx;
              const statusInfo = getStatusForSelector(providerId);
              const statusConfig = STATUS_THEME[statusInfo.status] || STATUS_THEME.unknown;
              const capabilities = theme.capabilities;
              const providerHealth = healthData[providerId];
              const isExpanded = expandedCard === providerId;
              const testResult = testResults[providerId];
              const isTesting = testing === providerId;

              return (
                <div key={providerId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setAIProvider(providerId);
                      if (theme.models.length > 0 && !theme.models.find((m) => m.id === aiModel)) {
                        setAIModel(theme.models[0].id);
                      }
                      close();
                    }}
                    onMouseEnter={() => {
                      setHoveredProvider(providerId);
                      setFocusIndex(idx);
                    }}
                    onMouseLeave={() => setHoveredProvider(null)}
                    onFocus={() => setFocusIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      isSelected || isFocused
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${theme.bg} border ${theme.border}`}>
                      <Icon className={`size-4 ${theme.colorClass}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-zinc-200">
                          {theme.name}
                        </span>
                        <span className={`size-1.5 rounded-full ${statusInfo.color}`} />
                        {providerId !== "auto" && providerHealth && (
                          <span className={`text-[9px] font-medium ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1">
                        {providerId === "auto" ? (
                          <span className="text-[11px] text-zinc-500">{theme.description}</span>
                        ) : (
                          capabilities.slice(0, 4).map((cap) => {
                            const label = CAPABILITY_LABELS[cap];
                            const color = CAPABILITY_COLORS[cap];
                            if (!label || !color) return null;
                            return (
                              <span
                                key={cap}
                                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${color}`}
                              >
                                {label}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-purple-400" />
                    )}
                  </button>

                  {isSelected && theme.models.length > 0 && (isHovered || isSelected) && (
                    <div className="ml-11 mt-0.5 mb-1 space-y-0.5">
                      {theme.models.map((model) => {
                        const isModelSelected = aiModel === model.id || (!aiModel && model === theme.models[0]);
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAIModel(model.id);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-all duration-150 ${
                              isModelSelected
                                ? "bg-purple-500/10 text-purple-300"
                                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-300"
                            }`}
                          >
                            <Circle className={`size-1.5 ${isModelSelected ? "fill-purple-400 text-purple-400" : "text-zinc-600"}`} />
                            <span className="text-[12px]">{model.name}</span>
                            {isModelSelected && (
                              <Check className="ml-auto size-3 text-purple-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isSelected && providerId !== "auto" && (
                    <div className="mx-3 mb-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleTestConnection(providerId, e)}
                          disabled={isTesting}
                          className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-300 disabled:opacity-50"
                        >
                          {isTesting ? (
                            <RefreshCw className="size-2.5 animate-spin" />
                          ) : (
                            <Activity className="size-2.5" />
                          )}
                          {isTesting ? "Testing..." : "Test Connection"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCard(isExpanded ? null : providerId);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-300"
                        >
                          Details
                          <ChevronRight className={`size-2.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                      </div>

                      {testResult && (
                        <div className={`rounded-lg px-2.5 py-1.5 text-[10px] ${testResult.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                          {testResult.message}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="space-y-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="text-zinc-500">Provider</div>
                            <div className="text-zinc-300">{theme.name}</div>
                            <div className="text-zinc-500">Model</div>
                            <div className="text-zinc-300">{getProviderModel(providerId)}</div>
                            <div className="text-zinc-500">Status</div>
                            <div className={statusConfig.textColor}>{statusConfig.label}</div>
                            <div className="text-zinc-500">API Key</div>
                            <div className={hasApiKey(providerId) ? "text-emerald-400" : "text-red-400"}>
                              {hasApiKey(providerId) ? "Configured" : "Missing"}
                            </div>
                            <div className="text-zinc-500">Last Checked</div>
                            <div className="text-zinc-300">{formatTime(providerHealth?.lastChecked)}</div>
                            {providerHealth && (
                              <>
                                <div className="text-zinc-500">Response Time</div>
                                <div className="text-zinc-300">{Math.round(providerHealth.avgResponseTime || 0)}ms</div>
                                <div className="text-zinc-500">Requests</div>
                                <div className="text-zinc-300">{providerHealth.totalRequests || 0}</div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/[0.05] px-4 py-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDiagnostics(!showDiagnostics);
              }}
              className="flex items-center gap-1.5 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <Activity className="size-2.5" />
              Developer Diagnostics
              <ChevronRight className={`size-2.5 transition-transform ${showDiagnostics ? "rotate-90" : ""}`} />
            </button>
            {showDiagnostics && (
              <div className="mt-2 space-y-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                {getAllDiagnostics().map((diag) => {
                  const statusCfg = STATUS_THEME[diag.status] || STATUS_THEME.unknown;
                  const diagTheme = getProviderTheme(diag.provider);
                  return (
                    <div key={diag.provider} className="space-y-1 border-b border-white/[0.03] pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${statusCfg.color}`} />
                        <span className="text-[10px] font-medium text-zinc-300">{diagTheme.name}</span>
                        <span className={`text-[9px] ${statusCfg.textColor}`}>{statusCfg.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[9px]">
                        <div className="text-zinc-500">Model: <span className="text-zinc-400">{diag.currentModel}</span></div>
                        <div className="text-zinc-500">RT: <span className="text-zinc-400">{diag.responseTime}ms</span></div>
                        <div className="text-zinc-500">Reqs: <span className="text-zinc-400">{diag.requestCount}</span></div>
                        {diag.lastError && (
                          <div className="col-span-3 text-zinc-500">Error: <span className="text-red-400">{diag.lastError}</span></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
