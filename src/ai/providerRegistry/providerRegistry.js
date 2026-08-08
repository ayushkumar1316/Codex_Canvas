export const CAPABILITIES = {
  VISION: "vision",
  VOICE: "voice",
  STREAMING: "streaming",
  JSON_MODE: "jsonMode",
  EDITING: "editing",
  GENERATION: "generation",
  REASONING: "reasoning",
  LONG_CONTEXT: "longContext",
};

export const CAPABILITY_LABELS = {
  vision: "Vision",
  voice: "Voice",
  streaming: "Streaming",
  jsonMode: "JSON",
  editing: "Editing",
  generation: "Generation",
  reasoning: "Reasoning",
  longContext: "Long Context",
};

export const CAPABILITY_COLORS = {
  vision: "text-blue-400 bg-blue-400/10",
  voice: "text-pink-400 bg-pink-400/10",
  streaming: "text-cyan-400 bg-cyan-400/10",
  jsonMode: "text-emerald-400 bg-emerald-400/10",
  editing: "text-amber-400 bg-amber-400/10",
  generation: "text-purple-400 bg-purple-400/10",
  reasoning: "text-indigo-400 bg-indigo-400/10",
  longContext: "text-teal-400 bg-teal-400/10",
};

export const PROVIDERS = {
  gemini: {
    id: "gemini",
    displayName: "Gemini",
    icon: "gemini",
    brandColor: "#34A853",
    colorClass: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    statusDot: "bg-emerald-400",
    description: "Fast · Native Vision",
    priority: 1,
    envKey: "VITE_GEMINI_API_KEY",
    defaultModel: "gemini-3.6-flash",
    capabilities: ["vision", "voice", "streaming", "jsonMode", "generation", "editing"],
    performance: {
      speed: "fast",
      estimatedLatency: 800,
      contextWindow: 1_000_000,
      recommendedFor: ["generation", "vision", "general"],
    },
    models: [
      { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite" },
      { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    ],
  },

  groq: {
    id: "groq",
    displayName: "Groq",
    icon: "groq",
    brandColor: "#F97316",
    colorClass: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    statusDot: "bg-orange-400",
    description: "Fastest · JSON",
    priority: 2,
    envKey: "VITE_GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    capabilities: ["jsonMode", "generation", "editing", "streaming"],
    performance: {
      speed: "fastest",
      estimatedLatency: 200,
      contextWindow: 128_000,
      recommendedFor: ["speed", "jsonMode", "editing"],
    },
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant" },
    ],
  },

  openrouter: {
    id: "openrouter",
    displayName: "OpenRouter",
    icon: "openrouter",
    brandColor: "#8B5CF6",
    colorClass: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    statusDot: "bg-violet-400",
    description: "Multiple Free Models",
    priority: 3,
    envKey: "VITE_OPENROUTER_API_KEY",
    defaultModel: "openai/gpt-5",
    capabilities: ["vision", "jsonMode", "generation", "editing", "reasoning", "longContext"],
    performance: {
      speed: "medium",
      estimatedLatency: 1500,
      contextWindow: 128_000,
      recommendedFor: ["variety", "free", "generation"],
    },
    models: [
      { id: "openai/gpt-5", name: "GPT-5 (via OpenRouter)" },
      { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B (Free)" },
      { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B (Free)" },
      { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B (Free)" },
      { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B Vision (Free)" },
      { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Free)" },
    ],
  },

  openai: {
    id: "openai",
    displayName: "OpenAI",
    icon: "openai",
    brandColor: "#10B981",
    colorClass: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    statusDot: "bg-teal-400",
    description: "High-quality generation",
    priority: 4,
    envKey: "VITE_OPENAI_API_KEY",
    defaultModel: "gpt-4o",
    capabilities: ["vision", "voice", "jsonMode", "generation", "editing", "reasoning"],
    performance: {
      speed: "fast",
      estimatedLatency: 1000,
      contextWindow: 128_000,
      recommendedFor: ["premium", "reasoning", "generation"],
    },
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ],
  },
};

export const PROVIDER_LIST = ["gemini", "groq", "openrouter", "openai"];

export const PROVIDER_PRIORITY = ["gemini", "groq", "openrouter", "openai"];

export function getProvider(id) {
  return PROVIDERS[id] || null;
}

export function getAllProviders() {
  return PROVIDER_LIST.map((id) => PROVIDERS[id]).filter(Boolean);
}

export function getCapabilities(id) {
  const provider = PROVIDERS[id];
  if (!provider) return [];
  return [...provider.capabilities];
}

export function supportsCapability(providerId, capability) {
  const provider = PROVIDERS[providerId];
  if (!provider) return false;
  return provider.capabilities.includes(capability);
}

export function getProviderByCapability(capability) {
  return PROVIDER_LIST.filter((id) => PROVIDERS[id]?.capabilities.includes(capability));
}

export function getDefaultModel(id) {
  const provider = PROVIDERS[id];
  if (!provider) return null;
  return provider.defaultModel;
}

export function getModels(id) {
  const provider = PROVIDERS[id];
  if (!provider) return [];
  return [...provider.models];
}

export function getEnvKey(id) {
  const provider = PROVIDERS[id];
  if (!provider) return null;
  return provider.envKey;
}

export function hasApiKey(id) {
  const envKey = getEnvKey(id);
  if (!envKey) return false;
  const key = import.meta.env[envKey];
  return !!key && key.length > 0;
}

export function getProviderIds() {
  return [...PROVIDER_LIST];
}

export function getProvidersByPriority() {
  return [...PROVIDER_PRIORITY].map((id) => PROVIDERS[id]).filter(Boolean);
}

export function getProviderTheme(id) {
  const provider = PROVIDERS[id];
  if (!provider) {
    return {
      id: "auto",
      name: "Auto",
      description: "Recommended",
      color: "#F59E0B",
      colorClass: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      statusDot: "bg-amber-400",
      icon: "auto",
      capabilities: [],
      models: [],
    };
  }
  return {
    id: provider.id,
    name: provider.displayName,
    description: provider.description,
    color: provider.brandColor,
    colorClass: provider.colorClass,
    bg: provider.bg,
    border: provider.border,
    statusDot: provider.statusDot,
    icon: provider.icon,
    capabilities: provider.capabilities,
    models: provider.models,
  };
}
