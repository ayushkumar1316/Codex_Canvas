import openAIProvider from "./providers/openai";
import openRouterProvider from "./providers/openrouter";
import geminiProvider from "./providers/gemini";

let _storeRef = null;

export function setStoreRef(store) {
  _storeRef = store;
}

const PROVIDER_LIST = ["gemini", "openrouter", "openai"];

const PROVIDER_MAP = {
  gemini: geminiProvider,
  openrouter: openRouterProvider,
  openai: openAIProvider,
};

const COOLDOWN_MS = 60_000;
const FAILURE_THRESHOLD = 3;

const health = {};
for (const name of PROVIDER_LIST) {
  health[name] = {
    lastSuccess: 0,
    lastFailure: 0,
    failureCount: 0,
    cooldownUntil: 0,
    avgResponseTime: 0,
    totalRequests: 0,
  };
}

function isFatalError(error) {
  const msg = error?.message || "";
  return (
    msg.includes("API key") ||
    msg.includes("invalid_key") ||
    msg.includes("Invalid API key") ||
    msg.includes("authentication") ||
    msg.includes("401") ||
    msg.includes("403") ||
    msg.includes("invalid request") ||
    msg.includes("bad request") ||
    msg.includes("400") ||
    msg.includes("unsupported") ||
    msg.includes("not found") ||
    msg.includes("404")
  );
}

function isCooldownActive(name) {
  const h = health[name];
  return Date.now() < h.cooldownUntil;
}

function recordSuccess(name, responseTime) {
  const h = health[name];
  h.lastSuccess = Date.now();
  h.failureCount = 0;
  h.cooldownUntil = 0;
  h.totalRequests += 1;
  h.avgResponseTime = h.totalRequests === 1
    ? responseTime
    : h.avgResponseTime * 0.8 + responseTime * 0.2;
}

function recordFailure(name) {
  const h = health[name];
  h.lastFailure = Date.now();
  h.failureCount += 1;
  h.totalRequests += 1;
  if (h.failureCount >= FAILURE_THRESHOLD) {
    h.cooldownUntil = Date.now() + COOLDOWN_MS;
    console.log(`[ProviderManager] ${name} entered cooldown for ${COOLDOWN_MS / 1000}s after ${h.failureCount} failures`);
  }
}

function getPreferredProvider() {
  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      const pref = (state.aiProvider || "auto").toLowerCase();
      if (pref !== "auto") {
        if (PROVIDER_MAP[pref]) return pref;
      }
    } catch { /* fallback to env */ }
  }
  const pref = (import.meta.env.VITE_AI_PROVIDER || "gemini").toLowerCase();
  if (PROVIDER_MAP[pref]) return pref;
  return "gemini";
}

function getOrderedProviders() {
  const preferred = getPreferredProvider();
  const rest = PROVIDER_LIST.filter((n) => n !== preferred);
  return [preferred, ...rest];
}

function getAvailableProviders() {
  return getOrderedProviders().filter((n) => !isCooldownActive(n));
}

function getErrorMessage(error) {
  const msg = error?.message || "";
  if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "rate_limited";
  }
  if (msg.includes("quota")) {
    return "quota_exceeded";
  }
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("Server Error")) {
    return "server_error";
  }
  if (msg.includes("timeout") || msg.includes("Timeout")) {
    return "timeout";
  }
  if (isFatalError(error)) {
    return "fatal";
  }
  return "unknown";
}

export async function executeWithFallback({ systemPrompt, context, userPrompt, schema }) {
  const candidates = getAvailableProviders();
  if (candidates.length === 0) {
    const allCooldown = PROVIDER_LIST.every((n) => isCooldownActive(n));
    if (allCooldown) {
      return {
        success: false,
        error: { type: "all_providers_unavailable", message: "All providers are temporarily rate limited. Please wait a moment and try again." },
        provider: null,
      };
    }
    candidates.push(...getOrderedProviders());
  }

  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      if (state.setAIActiveProvider) {
        state.setAIActiveProvider(candidates[0]);
      }
    } catch { /* noop */ }
  }

  for (const providerName of candidates) {
    const provider = PROVIDER_MAP[providerName];
    if (!provider) continue;

    const start = Date.now();
    try {
      console.log(`[ProviderManager] Trying ${providerName}...`);
      const response = await provider.execute({ systemPrompt, context, userPrompt, schema });
      const elapsed = Date.now() - start;
      recordSuccess(providerName, elapsed);
      console.log(`[ProviderManager] ${providerName} succeeded in ${elapsed}ms`);
      return { success: true, response, provider: providerName, error: null };
    } catch (error) {
      const elapsed = Date.now() - start;
      recordFailure(providerName);
      const errorCategory = getErrorMessage(error);
      console.warn(`[ProviderManager] ${providerName} failed (${elapsed}ms):`, errorCategory, error.message);

      if (isFatalError(error)) {
        console.log(`[ProviderManager] ${providerName} has fatal error, not falling back`);
        return {
          success: false,
          error: {
            type: "provider_error",
            message: `Provider ${providerName} encountered an error: ${error.message}`,
            provider: providerName,
          },
          provider: providerName,
        };
      }

      const remaining = candidates.filter((n) => n !== providerName);
      if (remaining.length > 0) {
        const nextName = remaining[0];
        console.log(`[ProviderManager] Falling back to ${nextName}...`);
      }
    }
  }

  return {
    success: false,
    error: {
      type: "all_providers_failed",
      message: "All providers failed. Please try again in a moment.",
    },
    provider: null,
  };
}

export function getProviderHealth() {
  return { ...health };
}

export function resetProviderHealth(name) {
  if (health[name]) {
    health[name].failureCount = 0;
    health[name].cooldownUntil = 0;
  }
}
