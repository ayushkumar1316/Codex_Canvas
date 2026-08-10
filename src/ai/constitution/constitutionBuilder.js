import { coreRules } from "./coreRules";
import { generationRules } from "./generationRules";
import { editingRules } from "./editingRules";
import { designSystemRules } from "./designSystemRules";
import { responsiveRules } from "./responsiveRules";
import { componentBlueprintRules } from "./componentBlueprintRules";
import { compositionRules } from "./compositionRules";
import { styleRules } from "./styleRules";

const STYLE_KEYWORDS = [
  "modern", "minimal", "luxury", "premium", "glass", "glassmorphism",
  "dark", "light", "colorful", "vibrant", "corporate", "professional",
  "apple", "stripe", "elegant", "sophisticated", "clean", "bold",
  "tint", "shade", "hue", "palette", "theme",
];

const LAYOUT_KEYWORDS = [
  "layout", "responsive", "mobile", "desktop", "tablet", "grid",
  "flex", "column", "row", "stack", "align", "center",
];

const COMPONENT_KEYWORDS = [
  "add", "insert", "create", "new", "component", "section", "hero",
  "features", "pricing", "testimonials", "footer", "navbar", "card",
  "button", "heading", "text", "image", "container",
];

function detectStyleRequest(prompt) {
  const lower = prompt.toLowerCase();
  return STYLE_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectLayoutRequest(prompt) {
  const lower = prompt.toLowerCase();
  return LAYOUT_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectComponentRequest(prompt) {
  const lower = prompt.toLowerCase();
  return COMPONENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectMultipleSections(prompt) {
  const lower = prompt.toLowerCase();
  const sectionIndicators = [
    "website", "landing page", "page", "site", "full",
    "complete", "entire", "whole", "sections",
  ];
  return sectionIndicators.some((kw) => lower.includes(kw));
}

export function buildConstitution(promptType, prompt, options = {}) {
  const sections = [];

  sections.push(coreRules);

  if (promptType === "generate") {
    sections.push(generationRules);
  }

  if (promptType === "edit") {
    sections.push(editingRules);
  }

  if (promptType === "generate" || promptType === "edit" || promptType === "style") {
    sections.push(designSystemRules);
  }

  if (promptType === "style" || detectStyleRequest(prompt)) {
    sections.push(styleRules);
  }

  if (promptType === "layout" || detectLayoutRequest(prompt)) {
    sections.push(responsiveRules);
  }

  if (promptType === "generate" || promptType === "insert" || detectComponentRequest(prompt)) {
    sections.push(componentBlueprintRules);
  }

  if (promptType === "generate" || detectMultipleSections(prompt)) {
    sections.push(compositionRules);
  }

  if (options.hasImage) {
    sections.push(responsiveRules);
  }

  return sections.join("\n");
}

export function getConstitutionSize(constitution) {
  return {
    characters: constitution.length,
    words: constitution.split(/\s+/).length,
    estimatedTokens: Math.ceil(constitution.length / 4),
  };
}
