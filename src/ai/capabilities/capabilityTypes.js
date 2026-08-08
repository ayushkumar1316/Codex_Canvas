export const CAPABILITY = {
  VISION: "vision",
  VOICE: "voice",
  STREAMING: "streaming",
  JSON_MODE: "json_mode",
  EDITING: "editing",
  GENERATION: "generation",
  LONG_CONTEXT: "long_context",
  REASONING: "reasoning",
  IMAGE_UNDERSTANDING: "image_understanding",
  FUNCTION_CALLING: "function_calling",
};

export const CONFIDENCE = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const PROVIDER_MODE = {
  AUTO: "auto",
  MANUAL: "manual",
};

export const CAPABILITY_WEIGHTS = {
  [CAPABILITY.VISION]: 10,
  [CAPABILITY.VOICE]: 10,
  [CAPABILITY.STREAMING]: 3,
  [CAPABILITY.JSON_MODE]: 5,
  [CAPABILITY.EDITING]: 7,
  [CAPABILITY.GENERATION]: 8,
  [CAPABILITY.LONG_CONTEXT]: 4,
  [CAPABILITY.REASONING]: 6,
  [CAPABILITY.IMAGE_UNDERSTANDING]: 10,
  [CAPABILITY.FUNCTION_CALLING]: 5,
};

export const STRATEGY_REQUIRED_CAPABILITIES = {
  FULL_GENERATION: [CAPABILITY.GENERATION, CAPABILITY.JSON_MODE],
  EDIT_EXISTING: [CAPABILITY.EDITING, CAPABILITY.JSON_MODE],
  INSERT_SECTION: [CAPABILITY.EDITING, CAPABILITY.JSON_MODE],
  DELETE_COMPONENT: [CAPABILITY.EDITING, CAPABILITY.JSON_MODE],
  STYLE_UPDATE: [CAPABILITY.EDITING, CAPABILITY.JSON_MODE],
  LAYOUT_UPDATE: [CAPABILITY.EDITING, CAPABILITY.JSON_MODE],
  CONTENT_UPDATE: [CAPABILITY.EDITING, CAPABILITY.JSON_MODE],
  IMAGE_GENERATION: [CAPABILITY.VISION, CAPABILITY.IMAGE_UNDERSTANDING],
  VOICE_COMMAND: [CAPABILITY.VOICE],
};

export const CONDITIONAL_CAPABILITIES = {
  hasReferenceImage: [CAPABILITY.VISION, CAPABILITY.IMAGE_UNDERSTANDING],
  hasVoiceInput: [CAPABILITY.VOICE],
  hasLongContext: [CAPABILITY.LONG_CONTEXT],
};

export const CAPABILITY_DESCRIPTIONS = {
  [CAPABILITY.VISION]: "Can process and understand images",
  [CAPABILITY.VOICE]: "Can process voice/audio input",
  [CAPABILITY.STREAMING]: "Supports streaming responses",
  [CAPABILITY.JSON_MODE]: "Optimized for structured JSON output",
  [CAPABILITY.EDITING]: "Skilled at modifying existing content",
  [CAPABILITY.GENERATION]: "Skilled at generating new content",
  [CAPABILITY.LONG_CONTEXT]: "Handles very long prompts/context",
  [CAPABILITY.REASONING]: "Advanced reasoning and planning",
  [CAPABILITY.IMAGE_UNDERSTANDING]: "Deep image analysis and understanding",
  [CAPABILITY.FUNCTION_CALLING]: "Supports tool/function calling",
};

export const CAPABILITY_CATEGORY = {
  GENERATION: "generation",
  UNDERSTANDING: "understanding",
  EDITING: "editing",
  REASONING: "reasoning",
  UTILITY: "utility",
};

export const EXECUTION_MODE = {
  SYNC: "sync",
  ASYNC: "async",
  STREAMING: "streaming",
};

export const CAPABILITY_PRIORITY = {
  CRITICAL: 100,
  HIGH: 80,
  MEDIUM: 50,
  LOW: 20,
};
