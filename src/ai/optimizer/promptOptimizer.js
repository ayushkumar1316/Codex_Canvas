import { normalizePrompt } from "./promptNormalizer";
import {
  detectPromptType,
  expandVaguePrompt,
  isVaguePrompt,
  calculateComplexity,
} from "./optimizationRules";
import { enrichWithDesignIntent } from "./designIntentEnricher";

function calculateConfidence(promptType, wasExpanded, originalPrompt) {
  let confidence = 0.7;

  if (promptType !== "unknown") confidence += 0.15;
  if (wasExpanded) confidence += 0.1;
  if (originalPrompt.trim().split(/\s+/).length > 5) confidence += 0.05;

  return Math.min(confidence, 1.0);
}

function buildMetadata(originalPrompt, options = {}) {
  const words = originalPrompt.trim().split(/\s+/).filter(Boolean);

  return {
    hasImage: !!options.hasImage,
    hasVoice: !!options.hasVoice,
    wordCount: words.length,
    estimatedComplexity: calculateComplexity(originalPrompt, options),
  };
}

export function optimizePrompt(prompt, options = {}) {
  const rawPrompt = prompt?.trim() || "";

  if (!rawPrompt) {
    return {
      rawPrompt: "",
      optimizedPrompt: "",
      promptType: "unknown",
      confidence: 0,
      metadata: {
        hasImage: !!options.hasImage,
        hasVoice: !!options.hasVoice,
        wordCount: 0,
        estimatedComplexity: "simple",
      },
    };
  }

  const normalized = normalizePrompt(rawPrompt);
  const { type: promptType } = detectPromptType(normalized);

  let optimizedPrompt = normalized;
  let wasExpanded = false;

  if (isVaguePrompt(normalized)) {
    const expansion = expandVaguePrompt(normalized);
    if (expansion) {
      const originalIntent = extractIntent(normalized);
      optimizedPrompt = originalIntent
        ? `${expansion} Specifically: ${originalIntent}.`
        : expansion;
      wasExpanded = true;
    }
  }

  const designIntent = enrichWithDesignIntent(rawPrompt, null, options.context || {});
  if (designIntent) {
    optimizedPrompt = `[USER REQUEST]: ${optimizedPrompt}\n\n[DESIGN ANALYSIS]:\n${designIntent}`;
    wasExpanded = true;
  }

  const confidence = calculateConfidence(promptType, wasExpanded, rawPrompt);
  const metadata = buildMetadata(rawPrompt, options);

  return {
    rawPrompt,
    optimizedPrompt,
    promptType,
    confidence,
    metadata,
  };
}

function extractIntent(prompt) {
  const lower = prompt.toLowerCase().trim();

  const vaguePatterns = [
    /^make\s+it\s+\w+$/i,
    /^make\s+it\s+\w+\s+\w+$/i,
    /^make\s+it\s+more\s+\w+$/i,
    /^fix\s+(?:the\s+)?(?:ui|design)$/i,
    /^improve\s+(?:it|the\s+design)$/i,
    /^make\s+it\s+less\s+\w+$/i,
  ];

  for (const pattern of vaguePatterns) {
    if (pattern.test(lower)) {
      return "";
    }
  }

  return prompt;
}

export function optimizePromptLight(prompt) {
  const rawPrompt = prompt?.trim() || "";
  if (!rawPrompt) return { rawPrompt: "", optimizedPrompt: "", promptType: "unknown" };

  const normalized = normalizePrompt(rawPrompt);
  const { type } = detectPromptType(normalized);

  return {
    rawPrompt,
    optimizedPrompt: normalized,
    promptType: type,
  };
}
