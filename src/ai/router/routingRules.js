import { INTENT_PATTERNS, INTENT_PRIORITY, OPERATION_MAP } from "./intentPatterns";

function scoreIntent(prompt, intentName) {
  const pattern = INTENT_PATTERNS[intentName];
  if (!pattern) return 0;

  const lower = prompt.toLowerCase();
  let score = 0;

  for (const phrase of pattern.phrases) {
    if (lower.includes(phrase)) {
      score += pattern.weight * 2;
    }
  }

  for (const keyword of pattern.keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundaryRegex = new RegExp(`(?:^|\\s|\\b)${escaped}(?:\\s|\\b|$)`, 'i');
    if (wordBoundaryRegex.test(lower)) {
      score += pattern.weight;
    }
  }

  return score;
}

function detectMultiIntents(prompt) {
  const scores = {};

  for (const intentName of INTENT_PRIORITY) {
    if (intentName === "voice") continue;
    const score = scoreIntent(prompt, intentName);
    if (score > 0) {
      scores[intentName] = score;
    }
  }

  return scores;
}

function pickPrimaryIntent(scores) {
  let best = "unknown";
  let bestScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    } else if (score === bestScore && best !== "unknown") {
      const currentPriority = INTENT_PRIORITY.indexOf(best);
      const newPriority = INTENT_PRIORITY.indexOf(intent);
      if (newPriority < currentPriority) {
        best = intent;
      }
    }
  }

  return { intent: best, score: bestScore };
}

function calculateConfidence(scores, primary) {
  const values = Object.values(scores);
  if (values.length === 0) return "low";

  const total = values.reduce((sum, v) => sum + v, 0);
  const primaryScore = scores[primary] || 0;

  if (values.length === 1) return "high";
  if (primaryScore / total >= 0.7) return "high";
  if (primaryScore / total >= 0.4) return "medium";
  return "low";
}

function getOperations(intent) {
  return OPERATION_MAP[intent] || OPERATION_MAP.unknown;
}

function requiresVisionCheck(intent, options) {
  if (options.hasImage) return true;
  if (intent === "image") return true;
  if (intent === "style" && options.hasImage) return true;
  return false;
}

function requiresExistingCanvasCheck(intent, options) {
  if (options.hasSelectedComponent) return true;
  if (["edit", "insert", "delete", "content"].includes(intent)) return true;
  return false;
}

function estimateRoutingComplexity(intent, operations, options) {
  const baseScores = {
    generate: 3,
    edit: 2,
    insert: 2,
    delete: 1,
    style: 2,
    layout: 2,
    content: 1,
    image: 3,
    unknown: 2,
  };

  let score = baseScores[intent] || 2;

  if (options.hasImage) score += 1;
  if (options.hasVoice) score += 1;
  if (operations.length > 2) score += 1;

  if (score <= 2) return "simple";
  if (score <= 4) return "medium";
  return "complex";
}

export function routeIntent(optimizedPrompt, options = {}) {
  const prompt = optimizedPrompt?.trim() || "";

  if (!prompt) {
    return {
      intent: "unknown",
      confidence: "low",
      source: options.source || "text",
      operations: OPERATION_MAP.unknown,
      requiresVision: false,
      requiresExistingCanvas: false,
      estimatedComplexity: "simple",
    };
  }

  const scores = detectMultiIntents(prompt);
  const { intent: primary } = pickPrimaryIntent(scores);
  const confidence = calculateConfidence(scores, primary);

  const source = options.hasVoice ? "voice" : "text";

  let finalIntent = primary;

  if (options.hasImage && finalIntent !== "generate") {
    const imageScore = scores.image || 0;
    if (imageScore > 0 || finalIntent === "unknown") {
      finalIntent = "image";
    }
  }

  const operations = getOperations(finalIntent);
  const requiresVision = requiresVisionCheck(finalIntent, options);
  const requiresExistingCanvas = requiresExistingCanvasCheck(finalIntent, options);
  const estimatedComplexity = estimateRoutingComplexity(finalIntent, operations, options);

  return {
    intent: finalIntent,
    confidence,
    source,
    operations,
    requiresVision,
    requiresExistingCanvas,
    estimatedComplexity,
  };
}

export function getIntentScores(prompt) {
  return detectMultiIntents(prompt);
}
