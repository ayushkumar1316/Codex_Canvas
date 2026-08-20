import {
  PROVIDER_LIST,
  getProvider,
  getCapabilities,
  getDefaultModel,
  hasApiKey as registryHasApiKey,
} from "./providerRegistry";
import { modelCatalog } from "./models/modelCatalog";

let _storeRef = null;

export function setStoreRef(store) {
  _storeRef = store;
}

const providerModules = {};
const providerLoaders = {
  gemini: () => import("./providers/gemini"),
  groq: () => import("./providers/groq"),
  openrouter: () => import("./providers/openrouter"),
  openai: () => import("./providers/openai"),
};

const PROVIDER_MAP = {};

async function loadProvider(name) {
  if (providerModules[name]) return providerModules[name];
  const loader = providerLoaders[name];
  if (!loader) return null;
  try {
    const mod = await loader();
    providerModules[name] = mod.default;
    PROVIDER_MAP[name] = mod.default;
    return mod.default;
  } catch (e) {
    console.error(`[ProviderManager] Failed to load ${name}:`, e);
    return null;
  }
}

function buildProviderMeta(name) {
  const provider = getProvider(name);
  if (!provider) return null;
  return {
    name: provider.displayName,
    model: provider.defaultModel,
    capabilities: provider.capabilities,
    envKey: provider.envKey,
    priority: provider.priority,
  };
}

const COOLDOWN_MS = 60_000;
const FAILURE_THRESHOLD = 3;
const HEALTH_CACHE_TTL = 5 * 60 * 1000;

const health = {};
for (const name of PROVIDER_LIST) {
  health[name] = {
    status: "unknown",
    lastSuccess: 0,
    lastFailure: 0,
    lastChecked: 0,
    failureCount: 0,
    cooldownUntil: 0,
    avgResponseTime: 0,
    totalRequests: 0,
    retryCount: 0,
    lastError: null,
  };
}

let healthCache = { timestamp: 0, results: {} };

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
    msg.includes("unsupported")
  );
}

function isCooldownActive(name) {
  const h = health[name];
  return Date.now() < h.cooldownUntil;
}

function recordSuccess(name, responseTime) {
  const h = health[name];
  h.lastSuccess = Date.now();
  h.lastChecked = Date.now();
  h.failureCount = 0;
  h.cooldownUntil = 0;
  h.totalRequests += 1;
  h.status = "ready";
  h.lastError = null;
  h.avgResponseTime = h.totalRequests === 1
    ? responseTime
    : h.avgResponseTime * 0.8 + responseTime * 0.2;
}

function recordFailure(name, error) {
  const h = health[name];
  h.lastFailure = Date.now();
  h.lastChecked = Date.now();
  h.failureCount += 1;
  h.totalRequests += 1;
  h.lastError = error?.message || "Unknown error";

  if (h.failureCount >= FAILURE_THRESHOLD) {
    h.cooldownUntil = Date.now() + COOLDOWN_MS;
    h.status = "rate_limited";
  } else {
    h.status = "offline";
  }
}

function getPreferredProvider() {
  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      const pref = (state.aiProvider || "auto").toLowerCase();
      if (pref !== "auto") {
        if (providerLoaders[pref]) return pref;
      }
    } catch { /* fallback to env */ }
  }
  const pref = (import.meta.env.VITE_AI_PROVIDER || "gemini").toLowerCase();
  if (providerLoaders[pref]) return pref;
  return "gemini";
}

function getOrderedProviders() {
  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      const selected = (state.aiProvider || "auto").toLowerCase();

      if (selected !== "auto" && providerLoaders[selected]) {
        const priority = state.providerPriority || PROVIDER_LIST;
        const rest = priority.filter((n) => n !== selected && providerLoaders[n]);
        return [selected, ...rest];
      }

      if (state.providerPriority && state.providerPriority.length > 0) {
        return [...state.providerPriority].filter((n) => providerLoaders[n]);
      }
    } catch { /* fallback */ }
  }

  const preferred = getPreferredProvider();
  const rest = PROVIDER_LIST.filter((n) => n !== preferred)
    .sort((a, b) => (getProvider(a)?.priority ?? 99) - (getProvider(b)?.priority ?? 99));
  return [preferred, ...rest];
}

function getAvailableProviders() {
  return getOrderedProviders().filter((n) => !isCooldownActive(n));
}

export function getProviderStatus(name) {
  const h = health[name];
  if (!h) return "unknown";
  if (isCooldownActive(name)) return "rate_limited";
  if (h.status === "rate_limited" && !isCooldownActive(name)) {
    h.status = "ready";
  }
  if (!hasApiKey(name)) return "api_key_missing";
  return h.status === "unknown" ? "ready" : h.status;
}

export function hasApiKey(name) {
  return registryHasApiKey(name);
}

export function getProviderCapabilities(name) {
  return getCapabilities(name);
}

export function getProviderMeta(name) {
  return buildProviderMeta(name);
}

export function getProviderModel(name) {
  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      const selected = state.aiProvider;
      const model = state.aiModel;
      if (selected === name && model) {
        const caps = getCapabilities(name);
        if (caps.length > 0) return model;
      }
    } catch { /* fallback */ }
  }
  return getDefaultModel(name) || "Unknown";
}

export function getPriorityList() {
  return getOrderedProviders();
}

export function setPriorityList(order) {
  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      if (state.setProviderPriority) {
        state.setProviderPriority(order);
      }
    } catch { /* noop */ }
  }
}

export function getDiagnostics(name) {
  const h = health[name];
  if (!h) return null;
  return {
    provider: name,
    status: getProviderStatus(name),
    responseTime: Math.round(h.avgResponseTime),
    lastError: h.lastError,
    retryCount: h.retryCount,
    currentModel: getProviderModel(name),
    requestCount: h.totalRequests,
    lastChecked: h.lastChecked,
    lastSuccess: h.lastSuccess,
    lastFailure: h.lastFailure,
    failureCount: h.failureCount,
    cooldownActive: isCooldownActive(name),
    cooldownUntil: h.cooldownUntil,
    hasApiKey: hasApiKey(name),
    capabilities: getProviderCapabilities(name),
  };
}

export function getAllDiagnostics() {
  return PROVIDER_LIST.map((name) => getDiagnostics(name)).filter(Boolean);
}

export function isHealthCacheValid() {
  return Date.now() - healthCache.timestamp < HEALTH_CACHE_TTL;
}

export function getCachedHealth() {
  if (isHealthCacheValid()) {
    return { ...healthCache.results };
  }
  return null;
}

export async function runHealthCheck(force = false) {
  if (!force && isHealthCacheValid()) {
    return { ...healthCache.results };
  }

  const results = {};

  for (const name of PROVIDER_LIST) {
    const hasKey = hasApiKey(name);
    if (!hasKey) {
      health[name].status = "api_key_missing";
      health[name].lastChecked = Date.now();
      results[name] = {
        status: "api_key_missing",
        hasApiKey: false,
        capabilities: getProviderCapabilities(name),
        model: getProviderModel(name),
        lastChecked: Date.now(),
      };
      continue;
    }

    if (isCooldownActive(name)) {
      results[name] = {
        status: "rate_limited",
        hasApiKey: true,
        capabilities: getProviderCapabilities(name),
        model: getProviderModel(name),
        lastChecked: health[name].lastChecked,
        cooldownUntil: health[name].cooldownUntil,
      };
      continue;
    }

    health[name].status = "ready";
    health[name].lastChecked = Date.now();
    results[name] = {
      status: "ready",
      hasApiKey: true,
      capabilities: getProviderCapabilities(name),
      model: getProviderModel(name),
      lastChecked: Date.now(),
    };
  }

  healthCache = { timestamp: Date.now(), results };
  return { ...results };
}

export async function testConnection(name) {
  const provider = await loadProvider(name);
  if (!provider) {
    return { success: false, status: "offline", message: "Provider not found" };
  }

  if (!hasApiKey(name)) {
    const meta = buildProviderMeta(name);
    return {
      success: false,
      status: "api_key_missing",
      message: `${meta?.name || name} API key missing. Add ${meta?.envKey || "API key"} to your .env file.`,
    };
  }

  if (isCooldownActive(name)) {
    const remaining = Math.ceil((health[name].cooldownUntil - Date.now()) / 1000);
    return {
      success: false,
      status: "rate_limited",
      message: `Rate limited. Try again in ${remaining}s.`,
    };
  }

  const start = Date.now();
  try {
    const meta = buildProviderMeta(name);
    const apiKey = import.meta.env[meta.envKey];
    let testUrl, testBody, testHeaders;

    if (name === "gemini") {
      testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${getProviderModel(name)}:generateContent?key=${apiKey}`;
      testBody = JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] });
      testHeaders = { "Content-Type": "application/json" };
    } else if (name === "groq") {
      testUrl = "https://api.groq.com/openai/v1/chat/completions";
      testBody = JSON.stringify({ model: getProviderModel(name), messages: [{ role: "user", content: "Hi" }], max_tokens: 1 });
      testHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    } else if (name === "openrouter") {
      testUrl = "https://openrouter.ai/api/v1/chat/completions";
      testBody = JSON.stringify({ model: getProviderModel(name), messages: [{ role: "user", content: "Hi" }], max_tokens: 1 });
      testHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    } else if (name === "openai") {
      testUrl = "https://api.openai.com/v1/chat/completions";
      testBody = JSON.stringify({ model: getProviderModel(name), messages: [{ role: "user", content: "Hi" }], max_tokens: 1 });
      testHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    } else {
      throw new Error("Unknown provider");
    }

    const res = await fetch(testUrl, {
      method: "POST",
      headers: testHeaders,
      body: testBody,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${res.status}`);
    }

    const elapsed = Date.now() - start;
    recordSuccess(name, elapsed);
    return {
      success: true,
      status: "ready",
      message: `Connection successful (${elapsed}ms)`,
      responseTime: elapsed,
    };
  } catch (error) {
    const elapsed = Date.now() - start;
    recordFailure(name, error);

    let message = `Connection failed: ${error.message}`;
    if (elapsed > 10_000) {
      message = "Connection timed out.";
    }

    return {
      success: false,
      status: health[name].status,
      message,
      responseTime: elapsed,
    };
  }
}

export function getFriendlyErrorMessage(error, providerName) {
  if (!error) return "Something went wrong. Please try again.";

  const type = error.type || "";
  const msg = error.message || "";

  if (type === "all_providers_unavailable") {
    return "All providers are temporarily rate limited. Please wait a moment and try again.";
  }

  if (type === "all_providers_failed") {
    return "All providers failed. Please check your API keys and try again.";
  }

  if (type === "validation") {
    const detail = msg || "The response format was invalid.";
    return `AI response could not be applied. ${detail}`;
  }

  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
    const p = providerName ? getProvider(providerName) : null;
    const name = p?.displayName || providerName || "Provider";
    return `${name} quota exceeded. Switching to another provider...`;
  }

  if (msg.includes("quota")) {
    const p = providerName ? getProvider(providerName) : null;
    const name = p?.displayName || providerName || "Provider";
    return `${name} daily quota exceeded.`;
  }

  if (msg.includes("API key") || msg.includes("invalid_key") || msg.includes("401")) {
    const p = providerName ? getProvider(providerName) : null;
    const name = p?.displayName || providerName || "Provider";
    return `${name} API key is invalid or missing.`;
  }

  if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
    const p = providerName ? getProvider(providerName) : null;
    const name = p?.displayName || providerName || "Provider";
    return `${name} is temporarily unavailable. Retrying...`;
  }

  if (msg.includes("timeout")) {
    return "Request timed out. The model may be overloaded.";
  }

  if (msg.includes("Network") || msg.includes("network") || msg.includes("fetch")) {
    return "Network connection lost. Please check your internet connection.";
  }

  if (type === "provider_error") {
    return msg;
  }

  if (type === "request") {
    return msg;
  }

  return "Something went wrong. Please try again.";
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

  for (let i = 0; i < candidates.length; i++) {
    const providerName = candidates[i];
    const provider = await loadProvider(providerName);
    if (!provider) continue;

    health[providerName].retryCount = i;
    health[providerName].status = "busy";

    const start = Date.now();
    try {
      const response = await provider.execute({ systemPrompt, context, userPrompt, schema });
      const elapsed = Date.now() - start;
      recordSuccess(providerName, elapsed);
      return { success: true, response, provider: providerName, error: null };
    } catch (error) {
      recordFailure(providerName, error);

      if (isFatalError(error)) {
        return {
          success: false,
          error: {
            type: "provider_error",
            message: getFriendlyErrorMessage({ type: "provider_error", message: error.message }, providerName),
            provider: providerName,
          },
          provider: providerName,
        };
      }

      if (i < candidates.length - 1) {
        const nextName = candidates[i + 1];
        const nextMeta = getProvider(nextName);
        if (_storeRef) {
          try {
            const state = _storeRef.getState();
            if (state.setAIActiveProvider) {
              state.setAIActiveProvider(nextName);
            }
          } catch { /* noop */ }
        }
        console.log(`[ProviderManager] Falling back to ${nextMeta?.displayName || nextName}...`);
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

export function modelToProvider(modelId) {
  if (!modelId || typeof modelId !== "string") return null;
  const catalogEntry = modelCatalog.find((m) => m.id === modelId);
  if (catalogEntry) {
    const providerType = catalogEntry.providerType;
    if (providerLoaders[providerType]) return providerType;
    if (providerType === "openrouter") return "openrouter";
    if (providerType === "direct") {
      const providerSlug = modelId.split("/")[0];
      if (providerLoaders[providerSlug]) return providerSlug;
    }
  }
  const slashIdx = modelId.indexOf("/");
  if (slashIdx > 0) {
    const slug = modelId.substring(0, slashIdx);
    if (providerLoaders[slug]) return slug;
  }
  return null;
}

export async function executeWithResolution(resolution, { systemPrompt, context, userPrompt, schema }) {
  if (!resolution || !resolution.primary) {
    return executeWithFallback({ systemPrompt, context, userPrompt, schema });
  }

  const candidateModelIds = [
    resolution.primary,
    ...(resolution.fallbacks || []),
    ...(resolution.emergency || []),
  ];

  const candidates = [];
  const seen = new Set();
  for (const modelId of candidateModelIds) {
    const providerName = modelToProvider(modelId);
    if (providerName && !seen.has(providerName)) {
      seen.add(providerName);
      candidates.push({ providerName, modelId });
    }
  }

  if (candidates.length === 0) {
    return executeWithFallback({ systemPrompt, context, userPrompt, schema });
  }

  const availableCandidates = candidates.filter((c) => !isCooldownActive(c.providerName));
  const orderedCandidates = availableCandidates.length > 0 ? availableCandidates : candidates;

  if (_storeRef) {
    try {
      const state = _storeRef.getState();
      if (state.setAIActiveProvider) {
        state.setAIActiveProvider(orderedCandidates[0].providerName);
      }
    } catch { /* noop */ }
  }

  for (let i = 0; i < orderedCandidates.length; i++) {
    const { providerName, modelId } = orderedCandidates[i];
    const provider = await loadProvider(providerName);
    if (!provider) continue;

    health[providerName].retryCount = i;
    health[providerName].status = "busy";

    const start = Date.now();
    try {
      const response = await provider.execute({ systemPrompt, context, userPrompt, schema, model: modelId });
      const elapsed = Date.now() - start;
      recordSuccess(providerName, elapsed);
      return { success: true, response, provider: providerName, error: null };
    } catch (error) {
      recordFailure(providerName, error);

      if (isFatalError(error)) {
        return {
          success: false,
          error: {
            type: "provider_error",
            message: getFriendlyErrorMessage({ type: "provider_error", message: error.message }, providerName),
            provider: providerName,
          },
          provider: providerName,
        };
      }

      if (i < orderedCandidates.length - 1) {
        const nextName = orderedCandidates[i + 1].providerName;
        const nextMeta = getProvider(nextName);
        if (_storeRef) {
          try {
            const state = _storeRef.getState();
            if (state.setAIActiveProvider) {
              state.setAIActiveProvider(nextName);
            }
          } catch { /* noop */ }
        }
        console.log(`[ProviderManager] Resolution fallback: ${nextMeta?.displayName || nextName}...`);
      }
    }
  }

  const remainingProviders = getOrderedProviders().filter(
    (name) => !orderedCandidates.some((c) => c.providerName === name)
  );
  for (const providerName of remainingProviders) {
    if (isCooldownActive(providerName)) continue;
    const provider = await loadProvider(providerName);
    if (!provider) continue;

    health[providerName].status = "busy";
    const start = Date.now();
    try {
      const response = await provider.execute({ systemPrompt, context, userPrompt, schema });
      const elapsed = Date.now() - start;
      recordSuccess(providerName, elapsed);
      return { success: true, response, provider: providerName, error: null };
    } catch (error) {
      recordFailure(providerName, error);
      if (isFatalError(error)) {
        return {
          success: false,
          error: {
            type: "provider_error",
            message: getFriendlyErrorMessage({ type: "provider_error", message: error.message }, providerName),
            provider: providerName,
          },
          provider: providerName,
        };
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

export function resetProviderHealth(name) {
  if (health[name]) {
    health[name].failureCount = 0;
    health[name].cooldownUntil = 0;
    health[name].status = "ready";
    health[name].lastError = null;
    health[name].retryCount = 0;
  }
}

export function refreshHealthCache() {
  return runHealthCheck(true);
}
