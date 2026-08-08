import { modelCatalog } from "./modelCatalog";

const CAPABILITY_MAPPINGS = Object.freeze({
  website_generation: {
    capability: "website_generation",
    description: "Full website generation from natural language",
    requiredCapabilities: ["structured_output", "long_context", "coding"],
    primary: {
      modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
      reason: "1M context, 550B MoE, frontier reasoning, strongest free model for full-page generation",
      confidence: 0.95,
    },
    fallbacks: [
      {
        modelId: "gemini-3.6-flash",
        reason: "1M context, vision + coding, fast with high TPM",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-3-super-120b-a12b:free",
        reason: "262K context, strong reasoning, good for medium pages",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "gemini-3.5-flash-lite",
        reason: "1M context, highest TPM (80K) and RPD (500) — bulk fallback",
        confidence: 0.70,
      },
    ],
  },

  json_patch_generation: {
    capability: "json_patch_generation",
    description: "Generate RFC 6902 JSON Patch operations",
    requiredCapabilities: ["structured_output"],
    primary: {
      modelId: "cohere/north-mini-code:free",
      reason: "Native JSON schema interleaved reasoning, 64K output, designed for structured agentic output",
      confidence: 0.92,
    },
    fallbacks: [
      {
        modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
        reason: "Strong structured output, 1M context for complex patches",
        confidence: 0.85,
      },
      {
        modelId: "gemini-3.6-flash",
        reason: "Reliable structured output, fast inference",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-nano-9b-v2:free",
        reason: "Very fast, structured output capable",
        confidence: 0.70,
      },
    ],
  },

  component_generation: {
    capability: "component_generation",
    description: "Generate individual UI component definitions",
    requiredCapabilities: ["structured_output", "coding"],
    primary: {
      modelId: "poolside/laguna-s-2.1:free",
      reason: "70.2% Terminal-Bench, strongest free coding model, 262K context",
      confidence: 0.93,
    },
    fallbacks: [
      {
        modelId: "cohere/north-mini-code:free",
        reason: "Agentic coding, JSON schema native, fast",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-3-super-120b-a12b:free",
        reason: "Strong reasoning, structured output, good for complex components",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "poolside/laguna-xs-2.1:free",
        reason: "Fast coding, compact MoE, good for simple components",
        confidence: 0.72,
      },
    ],
  },

  layout_generation: {
    capability: "layout_generation",
    description: "Generate responsive page layouts and sections",
    requiredCapabilities: ["structured_output", "coding"],
    primary: {
      modelId: "gemini-3.6-flash",
      reason: "1M context, vision + coding, best for layout with visual understanding",
      confidence: 0.90,
    },
    fallbacks: [
      {
        modelId: "poolside/laguna-s-2.1:free",
        reason: "Strong coding, 262K context, good for complex layouts",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-3-super-120b-a12b:free",
        reason: "Reasoning + structured output, reliable for layout logic",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "gemini-3.5-flash-lite",
        reason: "High TPM, fast, good for simple layouts",
        confidence: 0.70,
      },
    ],
  },

  ui_editing: {
    capability: "ui_editing",
    description: "Modify existing UI components based on instructions",
    requiredCapabilities: ["structured_output", "tool_calling"],
    primary: {
      modelId: "poolside/laguna-s-2.1:free",
      reason: "Best coding model, structured output for precise patches",
      confidence: 0.90,
    },
    fallbacks: [
      {
        modelId: "google/gemma-4-26b-a4b-it:free",
        reason: "Vision + coding + structured output, can see screenshot + edit",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        reason: "Multimodal + extended thinking, good for complex edits",
        confidence: 0.78,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-nano-9b-v2:free",
        reason: "Very fast, structured output, good for simple edits",
        confidence: 0.68,
      },
    ],
  },

  style_editing: {
    capability: "style_editing",
    description: "Modify CSS properties and visual styling",
    requiredCapabilities: ["structured_output", "tool_calling"],
    primary: {
      modelId: "cohere/north-mini-code:free",
      reason: "Native JSON schema, fast, agentic coding for style patches",
      confidence: 0.88,
    },
    fallbacks: [
      {
        modelId: "poolside/laguna-xs-2.1:free",
        reason: "Fast coding, structured output, good for quick style changes",
        confidence: 0.82,
      },
      {
        modelId: "gemini-3.6-flash",
        reason: "Reliable structured output, vision for style verification",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-nano-9b-v2:free",
        reason: "Very fast, good for trivial style edits",
        confidence: 0.65,
      },
    ],
  },

  content_editing: {
    capability: "content_editing",
    description: "Edit text content and copy within components",
    requiredCapabilities: ["structured_output", "tool_calling"],
    primary: {
      modelId: "cohere/north-mini-code:free",
      reason: "Fast, structured output, good for text manipulation",
      confidence: 0.87,
    },
    fallbacks: [
      {
        modelId: "poolside/laguna-xs-2.1:free",
        reason: "Fast coding, reliable for content changes",
        confidence: 0.82,
      },
      {
        modelId: "gemini-3.6-flash",
        reason: "Reliable, fast, good for content updates",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-nano-9b-v2:free",
        reason: "Very fast, good for simple text edits",
        confidence: 0.65,
      },
    ],
  },

  vision_understanding: {
    capability: "vision_understanding",
    description: "Process and interpret visual input from screenshots",
    requiredCapabilities: ["vision"],
    primary: {
      modelId: "google/gemma-4-31b-it:free",
      reason: "Vision + reasoning, 262K context, image + video support",
      confidence: 0.92,
    },
    fallbacks: [
      {
        modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        reason: "Multimodal (image/audio/video), extended thinking",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-nano-12b-v2-vl:free",
        reason: "Vision + document intelligence, fast",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "gemini-3.6-flash",
        reason: "Vision capable, 1M context, fast",
        confidence: 0.75,
      },
    ],
  },

  wireframe_understanding: {
    capability: "wireframe_understanding",
    description: "Interpret wireframe sketches into components",
    requiredCapabilities: ["vision", "reasoning"],
    primary: {
      modelId: "nvidia/nemotron-nano-12b-v2-vl:free",
      reason: "Vision + document intelligence, optimized for visual docs",
      confidence: 0.88,
    },
    fallbacks: [
      {
        modelId: "google/gemma-4-31b-it:free",
        reason: "Vision + reasoning, good for complex wireframes",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        reason: "Multimodal reasoning with thinking budget",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "gemini-2.5-flash",
        reason: "Vision + reasoning, 1M context",
        confidence: 0.72,
      },
    ],
  },

  image_understanding: {
    capability: "image_understanding",
    description: "Analyze images for design patterns and layout",
    requiredCapabilities: ["vision"],
    primary: {
      modelId: "google/gemma-4-31b-it:free",
      reason: "Vision + reasoning, 262K context, image + video",
      confidence: 0.92,
    },
    fallbacks: [
      {
        modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        reason: "Multimodal (image/audio/video), extended thinking",
        confidence: 0.85,
      },
      {
        modelId: "nvidia/nemotron-nano-12b-v2-vl:free",
        reason: "Vision + document intelligence",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "gemini-3.6-flash",
        reason: "Vision capable, fast, 1M context",
        confidence: 0.75,
      },
    ],
  },

  intent_classification: {
    capability: "intent_classification",
    description: "Classify user input into actionable intents",
    requiredCapabilities: ["structured_output", "reasoning"],
    primary: {
      modelId: "nvidia/nemotron-nano-9b-v2:free",
      reason: "Very fast (9B), reasoning + structured output, ideal for classification",
      confidence: 0.90,
    },
    fallbacks: [
      {
        modelId: "openai/gpt-oss-20b:free",
        reason: "Fast MoE, reasoning, good for intent parsing",
        confidence: 0.82,
      },
      {
        modelId: "cohere/north-mini-code:free",
        reason: "Fast, reasoning, structured output",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "gemini-3.5-flash-lite",
        reason: "Fast, high TPM, good for high-volume classification",
        confidence: 0.70,
      },
    ],
  },

  reasoning: {
    capability: "reasoning",
    description: "Multi-step reasoning and planning",
    requiredCapabilities: ["reasoning"],
    primary: {
      modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
      reason: "550B MoE, 1M context, frontier reasoning, strongest free reasoning model",
      confidence: 0.95,
    },
    fallbacks: [
      {
        modelId: "nvidia/nemotron-3-super-120b-a12b:free",
        reason: "Strong reasoning, 262K context, good for complex tasks",
        confidence: 0.85,
      },
      {
        modelId: "gemini-2.5-flash",
        reason: "Reasoning capable, 1M context, fast",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        reason: "Extended thinking with 16K reasoning budget",
        confidence: 0.72,
      },
    ],
  },

  structured_output: {
    capability: "structured_output",
    description: "Generate schema-compliant JSON responses",
    requiredCapabilities: ["structured_output"],
    primary: {
      modelId: "cohere/north-mini-code:free",
      reason: "Native JSON schema interleaved with reasoning, 64K output, agentic",
      confidence: 0.93,
    },
    fallbacks: [
      {
        modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
        reason: "Strong structured output, 65K output tokens",
        confidence: 0.88,
      },
      {
        modelId: "gemini-3.6-flash",
        reason: "Reliable structured output, fast",
        confidence: 0.82,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-nano-9b-v2:free",
        reason: "Fast, structured output capable",
        confidence: 0.70,
      },
    ],
  },

  long_context: {
    capability: "long_context",
    description: "Process very large context windows (≥256K)",
    requiredCapabilities: ["long_context"],
    primary: {
      modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
      reason: "1M context — only free model with true 1M context window",
      confidence: 0.95,
    },
    fallbacks: [
      {
        modelId: "gemini-3.6-flash",
        reason: "1M context, fast, reliable",
        confidence: 0.88,
      },
      {
        modelId: "google/gemma-4-31b-it:free",
        reason: "262K context, vision + reasoning",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-3-super-120b-a12b:free",
        reason: "262K context, strong reasoning",
        confidence: 0.75,
      },
    ],
  },

  tool_calling: {
    capability: "tool_calling",
    description: "Invoke external tools during generation",
    requiredCapabilities: ["tool_calling"],
    primary: {
      modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
      reason: "Tool calling + reasoning + 1M context, strongest orchestration",
      confidence: 0.92,
    },
    fallbacks: [
      {
        modelId: "cohere/north-mini-code:free",
        reason: "Tool calling + fast + agentic, good for tool-heavy workflows",
        confidence: 0.85,
      },
      {
        modelId: "poolside/laguna-s-2.1:free",
        reason: "Tool calling + coding, good for code-related tools",
        confidence: 0.80,
      },
    ],
    emergency: [
      {
        modelId: "nvidia/nemotron-nano-9b-v2:free",
        reason: "Fast, tool calling capable",
        confidence: 0.70,
      },
    ],
  },
});

const mappingMap = new Map(Object.entries(CAPABILITY_MAPPINGS));

export function getCapabilityMapping(capability) {
  return mappingMap.get(capability) || null;
}

export function getPrimaryModel(capability) {
  const mapping = mappingMap.get(capability);
  if (!mapping) return null;
  const model = modelCatalog.find((m) => m.id === mapping.primary.modelId);
  return model ? { ...mapping.primary, model } : null;
}

export function getFallbackModels(capability) {
  const mapping = mappingMap.get(capability);
  if (!mapping) return [];
  return mapping.fallbacks
    .map((fb) => {
      const model = modelCatalog.find((m) => m.id === fb.modelId);
      return model ? { ...fb, model } : null;
    })
    .filter(Boolean);
}

export function getEmergencyModels(capability) {
  const mapping = mappingMap.get(capability);
  if (!mapping) return [];
  return mapping.emergency
    .map((em) => {
      const model = modelCatalog.find((m) => m.id === em.modelId);
      return model ? { ...em, model } : null;
    })
    .filter(Boolean);
}

export function getAllCapabilityMappings() {
  return { ...CAPABILITY_MAPPINGS };
}

export function getCapabilityIds() {
  return Object.keys(CAPABILITY_MAPPINGS);
}

export function validateCapabilityMappings() {
  const errors = [];
  const warnings = [];
  const capabilities = getCapabilityIds();

  const modelIds = new Set(modelCatalog.map((m) => m.id));

  for (const capId of capabilities) {
    const mapping = CAPABILITY_MAPPINGS[capId];

    if (!mapping.primary) {
      errors.push({ capability: capId, error: "Missing primary model" });
      continue;
    }

    if (!modelIds.has(mapping.primary.modelId)) {
      errors.push({
        capability: capId,
        error: `Primary model "${mapping.primary.modelId}" not found in catalog`,
      });
    }

    const primaryModel = modelCatalog.find((m) => m.id === mapping.primary.modelId);
    if (primaryModel && primaryModel.deprecated) {
      errors.push({
        capability: capId,
        error: `Primary model "${mapping.primary.modelId}" is deprecated`,
      });
    }
    if (primaryModel && !primaryModel.free) {
      warnings.push({
        capability: capId,
        warning: `Primary model "${mapping.primary.modelId}" is not free`,
      });
    }

    for (const fb of mapping.fallbacks || []) {
      if (!modelIds.has(fb.modelId)) {
        errors.push({
          capability: capId,
          error: `Fallback model "${fb.modelId}" not found in catalog`,
        });
      }
      const fbModel = modelCatalog.find((m) => m.id === fb.modelId);
      if (fbModel && fbModel.deprecated) {
        errors.push({
          capability: capId,
          error: `Fallback model "${fb.modelId}" is deprecated`,
        });
      }
    }

    for (const em of mapping.emergency || []) {
      if (!modelIds.has(em.modelId)) {
        errors.push({
          capability: capId,
          error: `Emergency model "${em.modelId}" not found in catalog`,
        });
      }
      const emModel = modelCatalog.find((m) => m.id === em.modelId);
      if (emModel && emModel.deprecated) {
        errors.push({
          capability: capId,
          error: `Emergency model "${em.modelId}" is deprecated`,
        });
      }
    }

    const allModelIds = [
      mapping.primary.modelId,
      ...(mapping.fallbacks || []).map((f) => f.modelId),
      ...(mapping.emergency || []).map((e) => e.modelId),
    ];
    const uniqueIds = new Set(allModelIds);
    if (uniqueIds.size !== allModelIds.length) {
      errors.push({
        capability: capId,
        error: "Duplicate model IDs in mapping",
      });
    }
  }

  return {
    valid: errors.length === 0,
    capabilities: capabilities.length,
    errors,
    warnings,
  };
}

export default {
  getCapabilityMapping,
  getPrimaryModel,
  getFallbackModels,
  getEmergencyModels,
  getAllCapabilityMappings,
  getCapabilityIds,
  validateCapabilityMappings,
};
