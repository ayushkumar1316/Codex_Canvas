/**
 * Model Catalog Type Definitions
 *
 * Single source of truth for model metadata schema.
 * This layer describes models only — it knows nothing about
 * execution, routing, health, selection, or fallback.
 */

/**
 * @typedef {Object} ModelDefinition
 * @property {string} id - Unique model identifier (e.g., "nvidia/nemotron-3-ultra-550b-a55b")
 * @property {string} displayName - Human-readable model name
 * @property {string} provider - Provider slug (e.g., "nvidia", "google")
 * @property {ProviderType} providerType - How the model is accessed
 * @property {Capability[]} capabilities - List of supported capabilities
 * @property {number} contextWindow - Maximum context window in tokens
 * @property {number} maxOutputTokens - Maximum output tokens per request
 * @property {boolean} vision - Supports image input
 * @property {boolean} coding - Optimized for code generation
 * @property {boolean} structuredOutput - Supports JSON schema / structured output
 * @property {boolean} toolCalling - Supports function / tool calling
 * @property {boolean} reasoning - Supports chain-of-thought reasoning
 * @property {boolean} multimodal - Supports multiple input modalities
 * @property {SpeedTier} speed - Relative inference speed
 * @property {Availability} availability - Current availability level
 * @property {boolean} free - Available at zero cost
 * @property {boolean} deprecated - Marked for removal
 * @property {number} priority - Selection priority (lower = higher priority)
 * @property {string} notes - Additional notes
 */

export const Capability = Object.freeze({
  TEXT: "text",
  CODE: "code",
  REASONING: "reasoning",
  VISION: "vision",
  STRUCTURED_OUTPUT: "structured_output",
  TOOL_CALLING: "tool_calling",
  LONG_CONTEXT: "long_context",
  MULTIMODAL: "multimodal",
  FAST: "fast",
  AGENTIC: "agentic",
  DOCUMENT_INTELLIGENCE: "document_intelligence",
  VIDEO: "video",
  AUDIO: "audio",
});

export const ProviderType = Object.freeze({
  OPENROUTER: "openrouter",
  DIRECT: "direct",
  CUSTOM: "custom",
});

export const SpeedTier = Object.freeze({
  VERY_FAST: "very_fast",
  FAST: "fast",
  MEDIUM: "medium",
  SLOW: "slow",
});

export const Availability = Object.freeze({
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  VOLATILE: "volatile",
});

export const REQUIRED_MODEL_FIELDS = Object.freeze([
  "id",
  "displayName",
  "provider",
  "providerType",
  "capabilities",
  "contextWindow",
  "maxOutputTokens",
  "vision",
  "coding",
  "structuredOutput",
  "toolCalling",
  "reasoning",
  "multimodal",
  "speed",
  "availability",
  "free",
  "deprecated",
  "priority",
  "notes",
]);

export const VALID_CAPABILITIES = Object.freeze(Object.values(Capability));
export const VALID_PROVIDER_TYPES = Object.freeze(Object.values(ProviderType));
export const VALID_SPEED_TIERS = Object.freeze(Object.values(SpeedTier));
export const VALID_AVAILABILITY_LEVELS = Object.freeze(Object.values(Availability));

export const VALIDATION_ERROR = Object.freeze({
  MISSING_FIELD: "missing_field",
  INVALID_TYPE: "invalid_type",
  INVALID_VALUE: "invalid_value",
  DUPLICATE_ID: "duplicate_id",
  DUPLICATE_NAME: "duplicate_name",
  CAPABILITY_MISMATCH: "capability_mismatch",
});
