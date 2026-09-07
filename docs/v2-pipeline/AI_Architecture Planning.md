# Phase OR-2 — Codex Canvas AI Architecture Planning

*Based exclusively on Phase OR-1 inventory (August 2026 snapshot). No external lookups.*

---

## 1. Capability → Model Mapping

### 1.1 Intent Classification
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `inclusionai/ling-3.0-flash:free` | 262K ctx, MoE → fast instruction following, 3.6B active params, designed for responsive agents | Limited reasoning depth; may misclassify complex multi-intent prompts |
| **Fallback** | `nvidia/nemotron-nano-9b-v2:free` | 128K ctx, very fast (9B), lightweight | Smaller context; less nuanced classification |
| **Emergency** | `openrouter/free` (router) | Auto-selects any available fast model | Non-deterministic; adds latency for routing |

---

### 1.2 Website Generation (Full Page)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `nvidia/nemotron-3-ultra-550b-a55b:free` | **1M context** (critical for full-page generation), strong reasoning, structured JSON, tool calling, orchestration capability | Higher latency (550B MoE); rate limit pressure on flagship free model |
| **Fallback** | `google/gemma-4-31b-it:free` | 262K ctx, multimodal, native function calling, structured output, Apache 2.0 | Shorter context; weaker long-range coherence for very large pages |
| **Emergency** | `nvidia/nemotron-3-super-120b-a12b:free` | 262K ctx, strong general reasoning, structured output | No vision; shorter context than Ultra |

---

### 1.3 React / Frontend Code Generation
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `poolside/laguna-s-2.1:free` | **70.2% Terminal-Bench**, 40.4% DeepSWE — strongest free coding model; 262K ctx; structured JSON; tool calling | No vision; higher latency; Poolside free tier historically volatile (Laguna M.1 delisted) |
| **Fallback** | `cohere/north-mini-code:free` | Agentic coding (OpenCode/SWE-Agent), JSON schema tool calling, 64K output, 256K ctx, fast (3B active MoE) | Smaller model; less raw coding power than Laguna S |
| **Emergency** | `poolside/laguna-xs-2.1:free` | Compact (33B-A3B), FP8 quantized → fast; strong coding for size | 32K output limit; less capable on complex React architectures |

---

### 1.4 JSON Patch Generation (Strict Schema)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `cohere/north-mini-code:free` | **Native JSON schema interleaved reasoning + tool use**; 64K output; designed for structured agentic output | Smaller model; may need examples for complex patch schemas |
| **Fallback** | `google/gemma-4-31b-it:free` | Native function calling + structured output; multimodal (can patch from screenshots) | Larger but less specialized for code-as-JSON |
| **Emergency** | `nvidia/nemotron-3-ultra-550b-a55b:free` | Strong structured output, 1M ctx for complex patches | Overkill latency; rate limit risk |

---

### 1.5 UI Editing (Incremental Changes)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `poolside/laguna-s-2.1:free` | Best coding + 262K ctx for multi-file edits; structured output for precise patches | No vision (can't "see" current UI) |
| **Fallback** | `google/gemma-4-26b-a4b-it:free` | **Vision + coding + structured output**; 262K ctx; can see screenshot + edit | Weaker pure coding than Laguna; MoE 3.8B active |
| **Emergency** | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | Multimodal (image/audio/video) + extended thinking (16K budget) | 16K output cap; smaller context |

---

### 1.6 Image / Screenshot Understanding
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `google/gemma-4-31b-it:free` | **Image + video (≤60s @1fps)**, native function calling, structured output, 262K ctx, Apache 2.0 | No audio; video limited to 60s |
| **Fallback** | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | **Image + audio + video**, extended thinking (16K budget), 256K ctx | 16K output cap; smaller active params |
| **Emergency** | `google/gemma-4-26b-a4b-it:free` | Same capabilities as 31B variant, slightly smaller | Marginally lower quality |

---

### 1.7 Wireframe Understanding
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `nvidia/nemotron-nano-12b-v2-vl:free` | **Video understanding + document intelligence**, hybrid Transformer-Mamba → high throughput for visual docs, 128K ctx | 128K context; no audio; specialized for extraction not generation |
| **Fallback** | `google/gemma-4-31b-it:free` | General vision + reasoning, structured output, larger context | Less optimized for wireframe→code pipeline |
| **Emergency** | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | Multimodal reasoning with thinking budget | Output cap limits detailed wireframe analysis |

---

### 1.8 Long Context (≥256K)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `nvidia/nemotron-3-ultra-550b-a55b:free` | **1M tokens** — only free model with true 1M context | Flagship = highest contention; latency |
| **Fallback** | `google/gemma-4-31b-it:free` / `poolside/laguna-s-2.1:free` | 262K context — sufficient for most long docs | 4× less than Ultra |
| **Emergency** | `inclusionai/ling-3.0-flash:free` / `nvidia/nemotron-3-super-120b-a12b:free` | 262K context, fast | No vision (Ling); no vision (Nemotron Super) |

---

### 1.9 Strict Structured Output (JSON Schema)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `cohere/north-mini-code:free` | **Native JSON schema interleaved with reasoning**; designed for agentic structured output; 64K output | Smaller model; may need schema examples |
| **Fallback** | `google/gemma-4-31b-it:free` | Native function calling + structured output; vision bonus | Larger but less specialized |
| **Emergency** | `nvidia/nemotron-3-ultra-550b-a55b:free` | Strong structured output, 1M ctx | Rate limit contention on flagship |

---

### 1.10 Fast Response (Low Latency)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | `nvidia/nemotron-nano-9b-v2:free` | **9B params, very fast**, 128K ctx, text-only | Lightweight; limited reasoning/coding depth |
| **Fallback** | `openai/gpt-oss-20b:free` | **3.6B active (MoE)**, 131K ctx, fast inference, Harmony format | MoE routing overhead; 20B total |
| **Emergency** | `inclusionai/ling-3.0-flash:free` | MoE, fast instruction following, 262K ctx | Slightly slower than Nano 9B |

---

### 1.11 Reliable Production Behavior (Stability)
| Role | Model | Why | Trade-offs |
|---|---|---|---|
| **Primary** | **Capability Router** (see §3) — not a single model | No single free model is stable; architecture must absorb churn | Requires registry + fallback logic |
| **Fallback** | `openrouter/free` router | Auto-filters for capability + availability | Non-deterministic; adds routing latency |
| **Emergency** | Paid `:floor` variant of same capability | Guaranteed capacity, SLA | Costs money; defeats "free" goal |

> **Key Insight**: The Teamday Aug 3 snapshot showed **14 free models** down from 20 weeks prior. **No free model is reliable**. Stability comes from **architecture**, not model selection.

---

## 2. Provider Survival Strategy

### Threat Model
| Threat | Impact | Mitigation |
|---|---|---|
| **Model delisted** (e.g., Llama, Qwen, DeepSeek all lost free tier Jul 2026) | Hardcoded model ID fails | **Capability Registry** — resolve at runtime |
| **Free → Paid** (provider pulls free hosting) | 402/403 errors | **Variant fallback**: `:free` → `:floor` (cheapest paid) → `:nitro` (fastest) |
| **Rate limits** (20 req/min, 50–1000/day) | 429 errors, queue buildup | **Token bucket per capability**; exponential backoff; queue with priority |
| **Provider offline** (NVIDIA/Google/Poolside endpoint down) | All models from provider unavailable | **Multi-provider capability mapping**; cross-provider fallbacks |
| **Quality regression** (model swap behind same ID) | Silent degradation | **Canary requests** + **output validation** (schema + heuristic checks) |

### Survival Principles
1. **Never hardcode model IDs** — not even in config files. Use capability keys.
2. **Every capability has ≥3 providers** — NVIDIA, Google, Poolside, Cohere, OpenAI, Moonshot, inclusionAI.
3. **Free-first, paid-fallback** — `:free` variant → `:floor` (cheapest paid) → `:nitro` (if latency critical).
4. **Stateless routing** — no sticky sessions; each request resolves capability → model independently.
5. **Observability** — log `(capability, model_id, latency, status, tokens)` for every request.

---

## 3. Capability Registry Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPABILITY REGISTRY                          │
│  (Single source of truth — NO model IDs in application code)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  capability: "website_generation"                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ primary:                                                  │   │
│  │   - model: "nemotron-3-ultra"                             │   │
│  │   - providers: ["nvidia"]                                 │   │
│  │   - variants: [":free", ":floor", ":nitro"]               │   │
│  │   - required_capabilities:                                │   │
│  │       - context: 1000000                                  │   │
│  │       - structured_output: true                           │   │
│  │       - tool_calling: true                                │   │
│  │       - reasoning: true                                   │   │
│  │   - max_latency_ms: 30000                                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ fallbacks: [                                              │   │
│  │   { model: "gemma-4-31b", providers: ["google"],         │   │
│  │     variants: [":free", ":floor"],                        │   │
│  │     required_capabilities: {context: 262144, ...} },      │   │
│  │   { model: "nemotron-3-super", providers: ["nvidia"],    │   │
│  │     variants: [":free", ":floor"] }                       │   │
│  │ ]                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              RESOLUTION ENGINE (Runtime)                        │
│  1. Filter providers by:                                        │
│     - Capability match (vision, tools, structured, context)    │
│     - Current availability (health check cache)                │
│     - Rate limit headroom (per-account tracker)                │
│  2. Score candidates:                                           │
│     - Free variant preferred (cost = 0)                        │
│     - Latency history (p50)                                     │
│     - Success rate (last 100 requests)                         │
│  3. Select top candidate                                        │
│  4. Execute with timeout + retry policy                        │
│  5. On failure: mark provider degraded, try next fallback      │
└─────────────────────────────────────────────────────────────────┘
```

### Registry Data Model (JSON)
```json
{
  "capabilities": {
    "intent_classification": {
      "primary": { "model_key": "ling-3-flash", "providers": ["inclusionai"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "nemotron-nano-9b", "providers": ["nvidia"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "context_min": 32768, "speed_tier": "fast" }
    },
    "website_generation": {
      "primary": { "model_key": "nemotron-3-ultra", "providers": ["nvidia"], "variants": [":free", ":floor", ":nitro"] },
      "fallbacks": [
        { "model_key": "gemma-4-31b", "providers": ["google"], "variants": [":free", ":floor"] },
        { "model_key": "nemotron-3-super", "providers": ["nvidia"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "context_min": 262144, "structured_output": true, "tool_calling": true, "reasoning": true }
    },
    "react_code_generation": {
      "primary": { "model_key": "laguna-s-2.1", "providers": ["poolside"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "north-mini-code", "providers": ["cohere"], "variants": [":free", ":floor"] },
        { "model_key": "laguna-xs-2.1", "providers": ["poolside"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "context_min": 131072, "structured_output": true, "tool_calling": true, "coding_benchmark": "terminal_bench>65" }
    },
    "json_patch_generation": {
      "primary": { "model_key": "north-mini-code", "providers": ["cohere"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "gemma-4-31b", "providers": ["google"], "variants": [":free", ":floor"] },
        { "model_key": "nemotron-3-ultra", "providers": ["nvidia"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "structured_output": true, "schema_strict": true, "output_tokens_min": 32768 }
    },
    "ui_editing": {
      "primary": { "model_key": "laguna-s-2.1", "providers": ["poolside"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "gemma-4-26b", "providers": ["google"], "variants": [":free", ":floor"] },
        { "model_key": "nemotron-3-nano-omni", "providers": ["nvidia"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "vision": true, "structured_output": true, "context_min": 131072 }
    },
    "image_understanding": {
      "primary": { "model_key": "gemma-4-31b", "providers": ["google"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "nemotron-3-nano-omni", "providers": ["nvidia"], "variants": [":free", ":floor"] },
        { "model_key": "gemma-4-26b", "providers": ["google"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "vision": true, "image_input": true, "video_input": true }
    },
    "wireframe_understanding": {
      "primary": { "model_key": "nemotron-nano-12b-vl", "providers": ["nvidia"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "gemma-4-31b", "providers": ["google"], "variants": [":free", ":floor"] },
        { "model_key": "nemotron-3-nano-omni", "providers": ["nvidia"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "vision": true, "document_intelligence": true, "context_min": 128000 }
    },
    "long_context": {
      "primary": { "model_key": "nemotron-3-ultra", "providers": ["nvidia"], "variants": [":free", ":floor", ":nitro"] },
      "fallbacks": [
        { "model_key": "gemma-4-31b", "providers": ["google"], "variants": [":free", ":floor"] },
        { "model_key": "laguna-s-2.1", "providers": ["poolside"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "context_min": 262144 }
    },
    "structured_output": {
      "primary": { "model_key": "north-mini-code", "providers": ["cohere"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "gemma-4-31b", "providers": ["google"], "variants": [":free", ":floor"] },
        { "model_key": "nemotron-3-ultra", "providers": ["nvidia"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "structured_output": true, "json_schema_native": true }
    },
    "fast_response": {
      "primary": { "model_key": "nemotron-nano-9b", "providers": ["nvidia"], "variants": [":free", ":floor"] },
      "fallbacks": [
        { "model_key": "gpt-oss-20b", "providers": ["openai"], "variants": [":free", ":floor"] },
        { "model_key": "ling-3-flash", "providers": ["inclusionai"], "variants": [":free", ":floor"] }
      ],
      "requirements": { "speed_tier": "fast", "context_min": 65536 }
    }
  },
  "model_catalog": {
    "nemotron-3-ultra": { "id": "nvidia/nemotron-3-ultra-550b-a55b", "provider": "nvidia", "context": 1000000, "capabilities": ["reasoning", "tool_calling", "structured_output", "long_context"], "speed_tier": "medium" },
    "nemotron-3-super": { "id": "nvidia/nemotron-3-super-120b-a12b", "provider": "nvidia", "context": 262144, "capabilities": ["reasoning", "tool_calling", "structured_output"], "speed_tier": "medium" },
    "nemotron-3-nano-omni": { "id": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", "provider": "nvidia", "context": 256000, "capabilities": ["vision", "audio", "video", "reasoning", "tool_calling", "structured_output"], "speed_tier": "medium" },
    "nemotron-nano-9b": { "id": "nvidia/nemotron-nano-9b-v2", "provider": "nvidia", "context": 128000, "capabilities": ["fast"], "speed_tier": "very_fast" },
    "nemotron-nano-12b-vl": { "id": "nvidia/nemotron-nano-12b-v2-vl", "provider": "nvidia", "context": 128000, "capabilities": ["vision", "document_intelligence", "tool_calling", "structured_output"], "speed_tier": "fast" },
    "gemma-4-26b": { "id": "google/gemma-4-26b-a4b-it", "provider": "google", "context": 262144, "capabilities": ["vision", "video", "tool_calling", "structured_output", "reasoning"], "speed_tier": "medium" },
    "gemma-4-31b": { "id": "google/gemma-4-31b-it", "provider": "google", "context": 262144, "capabilities": ["vision", "video", "tool_calling", "structured_output", "reasoning"], "speed_tier": "medium" },
    "laguna-s-2.1": { "id": "poolside/laguna-s-2.1", "provider": "poolside", "context": 262144, "capabilities": ["coding", "tool_calling", "structured_output", "reasoning"], "speed_tier": "medium", "coding_benchmark": 70.2 },
    "laguna-xs-2.1": { "id": "poolside/laguna-xs-2.1", "provider": "poolside", "context": 262144, "capabilities": ["coding", "tool_calling", "structured_output", "reasoning"], "speed_tier": "fast", "coding_benchmark": "compact" },
    "north-mini-code": { "id": "cohere/north-mini-code", "provider": "cohere", "context": 256000, "capabilities": ["coding", "tool_calling", "structured_output", "reasoning", "json_schema_native"], "speed_tier": "fast" },
    "ling-3-flash": { "id": "inclusionai/ling-3.0-flash", "provider": "inclusionai", "context": 262144, "capabilities": ["fast", "tool_calling", "structured_output", "reasoning"], "speed_tier": "fast" },
    "gpt-oss-20b": { "id": "openai/gpt-oss-20b", "provider": "openai", "context": 131072, "capabilities": ["fast", "tool_calling", "structured_output", "reasoning"], "speed_tier": "fast" }
  }
}
```

---

## 4. Dynamic Model Selection (Zero Coupling)

### Application Code → Capability Key Only
```typescript
// ❌ NEVER do this anywhere in app code:
const model = "nvidia/nemotron-3-ultra-550b-a55b:free";

// ✅ ONLY this:
const result = await ai.execute({
  capability: "website_generation",
  prompt: userPrompt,
  context: { componentTree, registry, screenshot }
});
```

### Resolution Flow
```
ai.execute({ capability, ... })
       │
       ▼
CapabilityRegistry.resolve(capability)
       │
       ▼
ProviderHealth.check(providers[])     ← Cached 30s; tracks 429/5xx/latency
       │
       ▼
RateLimiter.check(account, model)     ← Token bucket per model
       │
       ▼
ScoreCandidates(candidates[])         ← Free > Paid; Latency; Success Rate
       │
       ▼
SELECT top candidate
       │
       ▼
OpenRouter API call with resolved model_id
       │
       ▼
ResponseValidator.validate(capability, response)
       │
       ├── PASS → Return
       │
       └── FAIL → Mark candidate degraded → Retry with next fallback
```

### Key Interfaces
```typescript
interface CapabilityRequest {
  capability: CapabilityKey;
  prompt: string;
  context?: any;
  options?: {
    timeoutMs?: number;
    maxRetries?: number;
    requireFree?: boolean;        // If true, never fall back to paid
    preferredProvider?: string;   // Optional hint
  };
}

interface CapabilityResponse<T = any> {
  data: T;
  meta: {
    modelId: string;              // Actual model used (for debugging)
    provider: string;
    variant: ":free" | ":floor" | ":nitro";
    latencyMs: number;
    tokens: { prompt: number; completion: number };
    capability: CapabilityKey;
  };
}
```

### Health & Rate Limit Tracking
```typescript
// Per-account, per-model (not per-request)
class RateLimitTracker {
  private buckets = new Map<string, TokenBucket>();
  
  async check(modelId: string): Promise<{ allowed: boolean; retryAfterMs?: number }>
  async record(modelId: string, tokens: number): void
  async on429(modelId: string, retryAfterMs: number): void
}

// Provider health (shared across capabilities)
class ProviderHealth {
  private cache = new Map<string, HealthStatus>();
  
  async get(provider: string): Promise<HealthStatus>
  async recordSuccess(provider: string, latencyMs: number): void
  async recordFailure(provider: string, error: Error): void
}
```

---

## 5. Migration Path for Codex Canvas

| Phase | Action |
|---|---|
| **1** | Extract all hardcoded model IDs from `providerManager.js`, `aiService.js`, `router/`, `optimizer/` into `CapabilityRegistry` config |
| **2** | Wrap `executeWithFallback` → `CapabilityRouter.execute(capability, ...)` |
| **3** | Add `RateLimitTracker` + `ProviderHealth` (in-memory first, Redis later) |
| **4** | Implement `ResponseValidator` per capability (schema + heuristics) |
| **5** | Add canary logging: every response logs `(capability, model, latency, success, tokens)` |
| **6** | Gradual rollout: intent → fast_response → structured_output → website_generation → ui_editing |
| **7** | Remove all `model:` strings from application code; only capability keys remain |

---

## 6. Summary: What Makes This Architecture Survive

| Property | How It's Achieved |
|---|---|
| **Model delisting** | Registry resolves at runtime; fallbacks auto-promoted |
| **Free → Paid** | Variant chain `:free` → `:floor` → `:nitro` per capability |
| **Rate limits** | Token bucket per model; cross-capability quota sharing; backoff |
| **Provider outage** | Multi-provider fallbacks per capability (NVIDIA + Google + Poolside + Cohere) |
| **Quality drift** | ResponseValidator + canary metrics; auto-degrade on failure spike |
| **Zero coupling** | App code knows only `capability: "website_generation"` — never model IDs |

---

**This architecture uses ONLY the 14 verified free models from Phase OR-1. It assumes every single one will disappear — and still works.**
