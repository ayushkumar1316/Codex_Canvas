import { SECTION_KEYWORDS, SECTION_SCORES } from "./canvasRules";

function detectSectionType(node) {
  if (!node || typeof node !== "object") return null;

  const type = (node.type || "").toLowerCase();
  const id = (node.id || "").toLowerCase();
  const className = String(node.props?.className || "").toLowerCase();
  const text = (node.props?.children || node.props?.text || "").toLowerCase().slice(0, 100);

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some((kw) => type.includes(kw) || id.includes(kw) || className.includes(kw))) {
      return section;
    }
  }

  if (text) {
    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return section;
      }
    }
  }

  return null;
}

function getTreeDepth(node) {
  if (!node || typeof node !== "object") return 0;
  if (!Array.isArray(node.children) || node.children.length === 0) return 1;
  let maxChildDepth = 0;
  for (const child of node.children) {
    const childDepth = getTreeDepth(child);
    if (childDepth > maxChildDepth) maxChildDepth = childDepth;
  }
  return 1 + maxChildDepth;
}

function countComponents(node) {
  if (!node || typeof node !== "object") return 0;
  let count = 1;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countComponents(child);
    }
  }
  return count;
}

function collectSectionTypes(node, sections = []) {
  if (!node || typeof node !== "object") return sections;

  const sectionType = detectSectionType(node);
  if (sectionType) {
    sections.push(sectionType);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectSectionTypes(child, sections);
    }
  }

  return sections;
}

function collectComponentTypes(node, types = {}) {
  if (!node || typeof node !== "object") return types;

  const type = node.type || "unknown";
  types[type] = (types[type] || 0) + 1;

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectComponentTypes(child, types);
    }
  }

  return types;
}

function calculateCompletenessScore(sectionTypes) {
  const uniqueSections = [...new Set(sectionTypes)];
  let score = 0;
  for (const section of uniqueSections) {
    score += SECTION_SCORES[section] || 5;
  }
  return Math.min(100, score);
}

function hasWebsiteStructure(sectionTypes) {
  const unique = [...new Set(sectionTypes)];
  const hasHero = unique.some((s) => ["hero", "header", "banner"].includes(s));
  const hasFooter = unique.includes("footer");
  return hasHero && hasFooter;
}

export function analyzeCanvas(tree) {
  if (!tree || typeof tree !== "object") {
    return {
      componentCount: 0,
      sectionTypes: [],
      uniqueSectionTypes: [],
      componentTypes: {},
      treeDepth: 0,
      completenessScore: 0,
      hasWebsiteStructure: false,
      visibleSections: 0,
    };
  }

  const componentCount = countComponents(tree);
  const sectionTypes = collectSectionTypes(tree);
  const uniqueSectionTypes = [...new Set(sectionTypes)];
  const componentTypes = collectComponentTypes(tree);
  const treeDepth = getTreeDepth(tree);
  const completenessScore = calculateCompletenessScore(sectionTypes);
  const websiteStructure = hasWebsiteStructure(sectionTypes);

  return {
    componentCount,
    sectionTypes,
    uniqueSectionTypes,
    componentTypes,
    treeDepth,
    completenessScore,
    hasWebsiteStructure: websiteStructure,
    visibleSections: uniqueSectionTypes.length,
  };
}

export function analyzeRootChildren(tree) {
  if (!tree || !Array.isArray(tree.children)) return [];
  return tree.children.map((child) => ({
    type: child.type || "unknown",
    id: child.id || "unknown",
    section: detectSectionType(child),
    hasChildren: Array.isArray(child.children) && child.children.length > 0,
  }));
}
