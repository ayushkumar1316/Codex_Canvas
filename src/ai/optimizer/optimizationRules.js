const PROMPT_TYPE_RULES = [
  {
    type: "delete",
    keywords: [
      "delete", "remove", "erase", "clear", "drop", "destroy", "trash",
      "get rid of", "eliminate", "discard",
    ],
    weight: 2,
  },
  {
    type: "insert",
    keywords: [
      "add", "insert", "create", "new", "append", "include", "place",
      "put", "attach", "embed", "inject",
    ],
    weight: 2,
  },
  {
    type: "edit",
    keywords: [
      "edit", "change", "modify", "update", "replace", "rename", "revise",
      "alter", "adjust", "correct", "fix", "tweak",
    ],
    phrases: [
      "make the", "make all", "make these",
      "make it", "make this", "make them",
    ],
    weight: 2,
  },
  {
    type: "style",
    keywords: [
      "style", "color", "font", "theme", "dark", "light", "gradient",
      "shadow", "border", "radius", "opacity", "background", "text",
      "italic", "bold", "underline",
    ],
    weight: 1,
  },
  {
    type: "layout",
    keywords: [
      "layout", "align", "center", "spacing", "margin", "padding",
      "width", "height", "position", "grid", "flex", "column", "row",
      "arrange", "reorder", "move", "resize",
    ],
    weight: 1,
  },
  {
    type: "content",
    keywords: [
      "content", "text", "label", "title", "heading", "paragraph",
      "description", "caption", "placeholder", "copy", "wording",
    ],
    weight: 1,
  },
  {
    type: "generate",
    keywords: [
      "generate", "build", "make", "design", "create page", "create a",
      "create an", "build a", "build an", "make a", "make an",
      "develop", "construct", "compose", "draft",
    ],
    weight: 3,
  },
];

const VAGUE_PROMPT_EXPANSIONS = [
  {
    pattern: /\bmake\s+it\s+modern\b/i,
    expansion:
      "Improve the existing design using modern SaaS design principles while preserving layout and content.",
  },
  {
    pattern: /\bmake\s+it\s+beautiful\b/i,
    expansion:
      "Improve spacing, typography, hierarchy, colors and visual consistency while preserving functionality.",
  },
  {
    pattern: /\bmake\s+it\s+pretty\b/i,
    expansion:
      "Improve spacing, typography, hierarchy, colors and visual consistency while preserving functionality.",
  },
  {
    pattern: /\bfix\s+ui\b/i,
    expansion: "Improve alignment, spacing, typography and component consistency.",
  },
  {
    pattern: /\bfix\s+the\s+ui\b/i,
    expansion: "Improve alignment, spacing, typography and component consistency.",
  },
  {
    pattern: /\bfix\s+design\b/i,
    expansion: "Improve alignment, spacing, typography and component consistency.",
  },
  {
    pattern: /\bfix\s+the\s+design\b/i,
    expansion: "Improve alignment, spacing, typography and component consistency.",
  },
  {
    pattern: /\bmake\s+it\s+better\b/i,
    expansion:
      "Improve the overall design quality including spacing, typography, colors, and visual hierarchy.",
  },
  {
    pattern: /\bimprove\s+it\b/i,
    expansion:
      "Improve the overall design quality including spacing, typography, colors, and visual hierarchy.",
  },
  {
    pattern: /\bimprove\s+(?:the\s+)?design\b/i,
    expansion:
      "Improve the overall design quality including spacing, typography, colors, and visual hierarchy.",
  },
  {
    pattern: /\bmake\s+it\s+responsive\b/i,
    expansion:
      "Adapt the layout to work well on different screen sizes using responsive breakpoints.",
  },
  {
    pattern: /\bmake\s+it\s+clean\b/i,
    expansion:
      "Simplify the design by removing clutter, improving spacing, and establishing clear visual hierarchy.",
  },
  {
    pattern: /\bmake\s+it\s+professional\b/i,
    expansion:
      "Apply professional design principles: consistent spacing, refined typography, and a cohesive color palette.",
  },
  {
    pattern: /\bmodern\s+look\b/i,
    expansion:
      "Apply a modern SaaS aesthetic with clean lines, ample whitespace, and refined typography.",
  },
  {
    pattern: /\bminimalist\b/i,
    expansion:
      "Simplify the design by removing unnecessary elements and focusing on essential content with clean spacing.",
  },
  {
    pattern: /\bmake\s+it\s+pop\b/i,
    expansion:
      "Enhance visual impact through stronger contrast, bolder accents, and improved hierarchy.",
  },
  {
    pattern: /\bmake\s+it\s+(?:more\s+)?accessible\b/i,
    expansion:
      "Improve accessibility by increasing color contrast, enlarging touch targets, and ensuring proper text sizing.",
  },
  {
    pattern: /\badd\s+some\s+(?: )?life\b/i,
    expansion:
      "Add visual interest through subtle animations, refined spacing, and enhanced color usage.",
  },
  {
    pattern: /\bpolish\s+(?:it|the|this)\b/i,
    expansion:
      "Refine visual details including spacing consistency, alignment, and typographic rhythm.",
  },
  {
    pattern: /\bmore\s+space\b/i,
    expansion:
      "Increase spacing between elements to improve readability and visual breathing room.",
  },
  {
    pattern: /\bbigger\b/i,
    expansion:
      "Increase the size of the primary elements while maintaining proportional balance.",
  },
  {
    pattern: /\bsmaller\b/i,
    expansion:
      "Decrease the size of the primary elements while maintaining readability and balance.",
  },
];

const COMPLEXITY_KEYWORDS = {
  simple: [
    "color", "font", "size", "text", "label", "bold", "italic",
    "width", "height", "radius", "border", "shadow",
  ],
  medium: [
    "layout", "spacing", "align", "center", "padding", "margin",
    "theme", "style", "gradient", "responsive", "position",
  ],
  complex: [
    "restructure", "redesign", "rebuild", "animate", "transform",
    "multi-step", "complex", "comprehensive", "overhaul", "complete",
    "full", "entire", "everything", "all", "navigation", "dashboard",
  ],
};

const MULTIPLE_OPERATION_INDICATORS = [
  /\band\b/i,
  /[,;]/,
  /\balso\b/i,
  /\bthen\b/i,
  /\bplus\b/i,
  /\bwith\b/i,
  /\balong\s+with\b/i,
];

export function detectPromptType(prompt) {
  const lower = prompt.toLowerCase().trim();
  const scores = {};

  for (const rule of PROMPT_TYPE_RULES) {
    if (rule.phrases) {
      for (const phrase of rule.phrases) {
        if (lower.includes(phrase)) {
          scores[rule.type] = (scores[rule.type] || 0) + rule.weight * 2;
        }
      }
    }
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        scores[rule.type] = (scores[rule.type] || 0) + rule.weight;
      }
    }
  }

  let bestType = "unknown";
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return { type: bestType, score: bestScore };
}

export function expandVaguePrompt(prompt) {
  for (const rule of VAGUE_PROMPT_EXPANSIONS) {
    if (rule.pattern.test(prompt)) {
      return rule.expansion;
    }
  }
  return null;
}

export function isVaguePrompt(prompt) {
  const words = prompt.trim().split(/\s+/);
  if (words.length <= 2) return true;

  const lower = prompt.toLowerCase();
  const hasExpansion = VAGUE_PROMPT_EXPANSIONS.some((r) => r.pattern.test(lower));
  if (hasExpansion) return true;

  const hasSpecificElement = /\b(button|card|container|heading|input|image|text|navbar|footer|sidebar|header|list|table|form|modal|modal|hero|section)\b/i.test(lower);
  const hasSpecificColor = /\b(red|blue|green|purple|orange|pink|yellow|black|white|gray|grey|teal|cyan|indigo|violet)\b/i.test(lower);
  const hasSpecificAction = /\b(increase|decrease|change|set|replace|duplicate|hide|show|disable|enable)\b/i.test(lower);

  if (!hasSpecificElement && !hasSpecificColor && !hasSpecificAction && words.length <= 5) {
    return true;
  }

  return false;
}

export function calculateComplexity(prompt, options = {}) {
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = prompt.toLowerCase();

  let score = 0;

  if (wordCount <= 3) score += 1;
  else if (wordCount <= 8) score += 2;
  else if (wordCount <= 15) score += 3;
  else score += 4;

  for (const keyword of COMPLEXITY_KEYWORDS.simple) {
    if (lower.includes(keyword)) score += 0.5;
  }
  for (const keyword of COMPLEXITY_KEYWORDS.medium) {
    if (lower.includes(keyword)) score += 1;
  }
  for (const keyword of COMPLEXITY_KEYWORDS.complex) {
    if (lower.includes(keyword)) score += 2;
  }

  let operationCount = 0;
  for (const indicator of MULTIPLE_OPERATION_INDICATORS) {
    const matches = lower.match(indicator);
    if (matches) operationCount += matches.length;
  }
  if (operationCount >= 2) score += 2;
  else if (operationCount >= 1) score += 1;

  if (options.hasImage) score += 1;

  if (score <= 3) return "simple";
  if (score <= 6) return "medium";
  return "complex";
}

export { COMPLEXITY_KEYWORDS, MULTIPLE_OPERATION_INDICATORS };
