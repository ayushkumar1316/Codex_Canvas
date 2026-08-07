function trimWhitespace(text) {
  return text.trim().replace(/\s+/g, " ");
}

function normalizePunctuation(text) {
  let result = text;
  result = result.replace(/\.{2,}/g, "...");
  result = result.replace(/!{2,}/g, "!");
  result = result.replace(/\?{2,}/g, "?");
  result = result.replace(/\s+([,.!?;:])/g, "$1");
  result = result.replace(/([,.!?;:])(?=[A-Za-z])/g, "$1 ");
  return result.trim();
}

function removeDuplicateWords(text) {
  const words = text.split(/\s+/);
  const result = [];
  const seen = new Set();

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lower = word.toLowerCase();

    if (lower === words[i - 1]?.toLowerCase()) {
      continue;
    }

    if (seen.has(lower) && !isStopWord(lower)) {
      continue;
    }

    seen.add(lower);
    result.push(word);
  }

  return result.join(" ");
}

function isStopWord(word) {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "can",
    "it", "its", "this", "that", "these", "those", "i", "you",
    "he", "she", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "our", "their", "not", "no", "nor",
    "so", "if", "then", "than", "too", "very", "just", "about",
  ]);
  return stopWords.has(word);
}

function normalizeCapitalization(text) {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (_match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });
}

export function normalizePrompt(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return "";
  }

  let result = prompt.normalize("NFC");
  result = trimWhitespace(result);
  result = normalizePunctuation(result);
  result = removeDuplicateWords(result);
  result = normalizeCapitalization(result);
  result = trimWhitespace(result);

  if (result && !/[.!?]$/.test(result)) {
    result += ".";
  }

  return result;
}
