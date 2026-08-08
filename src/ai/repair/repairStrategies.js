import { COMPONENT_TYPE_MAP, STYLE_DEFAULTS } from "./repairRules";

const GEMINI_PATTERNS = {
  fences: /^```(?:json)?\s*\n/i,
  escapedQuotes: /\\"/g,
  escapedNewlines: /\\n/g,
  leadingText: /^[^{[]*/,
};

const GROQ_PATTERNS = {
  truncationEnd: /,\s*$/,
  partialObject: /^\{[^}]*$/,
  payloadLimit: /...(truncated|\.\.\.)/i,
};

const OPENROUTER_PATTERNS = {
  wrappedPrefix: /^(?:data|response|result):\s*/i,
  providerMetadata: /"provider":\s*"[^"]*"/g,
};

const OPENAI_PATTERNS = {
  differentFormatting: /\\u([0-9a-fA-F]{4})/g,
  nullValues: /:\s*null/g,
};

export const PROVIDER_STRATEGIES = {
  gemini: {
    patterns: GEMINI_PATTERNS,
    priority: ["stripLeadingText", "unescapeJSON", "stripFences", "repairJSON"],
    description: "Gemini: strip markdown fences, unescape characters, handle truncated JSON",
  },
  groq: {
    patterns: GROQ_PATTERNS,
    priority: ["repairTruncatedJSON", "stripFences", "repairJSON"],
    description: "Groq: handle payload truncation, partial objects, repair truncated JSON",
  },
  openrouter: {
    patterns: OPENROUTER_PATTERNS,
    priority: ["stripWrappedPrefix", "repairJSON"],
    description: "OpenRouter: strip provider metadata wrappers, repair JSON",
  },
  openai: {
    patterns: OPENAI_PATTERNS,
    priority: ["unescapeUnicode", "repairJSON"],
    description: "OpenAI: unescape unicode sequences, handle different JSON formatting",
  },
  auto: {
    patterns: {},
    priority: ["stripFences", "removeTrailingCommas", "repairTruncatedJSON", "repairJSON"],
    description: "Auto: apply all generic repairs in order",
  },
};

function stripLeadingText(text) {
  const match = text.match(/^([^[{]*)/);
  if (match && match[1].trim().length > 0 && text.includes("{")) {
    return text.slice(text.indexOf("{"));
  }
  return text;
}

function unescapeJSON(text) {
  let result = text;
  result = result.replace(/\\"/g, '"');
  result = result.replace(/\\n/g, "\n");
  result = result.replace(/\\t/g, "\t");
  return result;
}

function stripFences(text) {
  let result = text.trim();
  const fenceMatch = result.match(/^```(?:json|javascript|js)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    result = fenceMatch[1].trim();
  }
  return result;
}

function stripWrappedPrefix(text) {
  return text.replace(/^(?:data|response|result):\s*/i, "").trim();
}

function unescapeUnicode(text) {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function repairTruncatedJSON(text) {
  let result = text.trim();

  if (result.endsWith(",") || result.endsWith(":")) {
    result = result.slice(0, -1);
  }

  const openBraces = (result.match(/{/g) || []).length;
  const closeBraces = (result.match(/}/g) || []).length;
  const openBrackets = (result.match(/\[/g) || []).length;
  const closeBrackets = (result.match(/]/g) || []).length;

  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    result += "]";
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    result += "}";
  }

  return result;
}

function removeTrailingCommas(text) {
  return text.replace(/,\s*([}\]])/g, "$1");
}

function attemptParse(text) {
  try {
    return { success: true, data: JSON.parse(text) };
  } catch {
    return { success: false, data: null };
  }
}

const REPAIR_FUNCTIONS = {
  stripLeadingText,
  unescapeJSON,
  stripFences,
  stripWrappedPrefix,
  unescapeUnicode,
  repairTruncatedJSON,
  removeTrailingCommas,
  repairJSON: (text) => {
    const attempt = attemptParse(text);
    return attempt.success ? text : null;
  },
};

export function applyProviderRepairs(rawText, provider) {
  const strategy = PROVIDER_STRATEGIES[provider] || PROVIDER_STRATEGIES.auto;

  let text = typeof rawText === "string" ? rawText : JSON.stringify(rawText);
  const appliedRepairs = [];

  for (const step of strategy.priority) {
    const fn = REPAIR_FUNCTIONS[step];
    if (!fn) continue;

    const before = text;
    text = fn(text);

    if (text !== before) {
      appliedRepairs.push(step);
    }

    const attempt = attemptParse(text);
    if (attempt.success) {
      return {
        success: true,
        data: attempt.data,
        repaired: appliedRepairs.length > 0,
        repairs: appliedRepairs,
        provider,
      };
    }
  }

  return {
    success: false,
    data: null,
    repaired: appliedRepairs.length > 0,
    repairs: appliedRepairs,
    provider,
  };
}

export function getComponentTypeMap() {
  return COMPONENT_TYPE_MAP;
}

export function getStyleDefaults() {
  return STYLE_DEFAULTS;
}
