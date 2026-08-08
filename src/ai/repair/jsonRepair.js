const MARKDOWN_FENCE_PATTERN = /^```(?:json|javascript|js|ts|typescript)?\s*\n?([\s\S]*?)\n?\s*```$/;
const MARKDOWN_FENCE_LINES = /^```(?:json|javascript|js|ts|typescript)?\s*$/gm;
const TRAILING_COMMA_PATTERN = /,\s*([}\]])/g;

function stripMarkdownFences(text) {
  if (typeof text !== "string") return text;

  const trimmed = text.trim();
  const fullMatch = trimmed.match(MARKDOWN_FENCE_PATTERN);
  if (fullMatch) {
    return fullMatch[1].trim();
  }

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const lines = trimmed.split("\n");
    const startIdx = lines[0].startsWith("```") ? 1 : 0;
    const endIdx = lines[lines.length - 1].trim() === "```" ? lines.length - 1 : lines.length;
    return lines.slice(startIdx, endIdx).join("\n").trim();
  }

  const cleaned = trimmed.replace(MARKDOWN_FENCE_LINES, "").trim();
  return cleaned;
}

function removeTrailingCommas(text) {
  if (typeof text !== "string") return text;
  return text.replace(TRAILING_COMMA_PATTERN, "$1");
}

function repairTruncatedJSON(text) {
  if (typeof text !== "string") return text;

  let result = text.trim();

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

function attemptParse(text) {
  if (!text || typeof text !== "string") return { success: false, data: null };

  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch {
    return { success: false, data: null };
  }
}

export function repairJSON(rawText) {
  if (typeof rawText !== "string") {
    if (typeof rawText === "object" && rawText !== null) {
      return { success: true, data: rawText, repaired: false };
    }
    return { success: false, data: null, repaired: false };
  }

  let text = rawText.trim();

  let attempt = attemptParse(text);
  if (attempt.success) return { success: true, data: attempt.data, repaired: false };

  text = stripMarkdownFences(text);
  attempt = attemptParse(text);
  if (attempt.success) return { success: true, data: attempt.data, repaired: true, repairs: ["MARKDOWN_FENCES"] };

  text = removeTrailingCommas(text);
  attempt = attemptParse(text);
  if (attempt.success) return { success: true, data: attempt.data, repaired: true, repairs: ["TRAILING_COMMA", "MARKDOWN_FENCES"] };

  text = repairTruncatedJSON(text);
  attempt = attemptParse(text);
  if (attempt.success) return { success: true, data: attempt.data, repaired: true, repairs: ["TRUNCATED_JSON", "TRAILING_COMMA", "MARKDOWN_FENCES"] };

  text = stripMarkdownFences(rawText);
  text = removeTrailingCommas(text);
  text = repairTruncatedJSON(text);
  attempt = attemptParse(text);
  if (attempt.success) return { success: true, data: attempt.data, repaired: true, repairs: ["MARKDOWN_FENCES", "TRAILING_COMMA", "TRUNCATED_JSON"] };

  return { success: false, data: null, repaired: false };
}
