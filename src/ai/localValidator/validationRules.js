export const VALIDATION_SEVERITY = {
  CRITICAL: "critical",
  MAJOR: "major",
  MINOR: "minor",
};

export const VALIDATION_CODES = {
  INVALID_JSON: { code: "INVALID_JSON", severity: VALIDATION_SEVERITY.CRITICAL, message: "Response is not valid JSON" },
  MISSING_ROOT: { code: "MISSING_ROOT", severity: VALIDATION_SEVERITY.CRITICAL, message: "Root node is missing" },
  MISSING_CHILDREN: { code: "MISSING_CHILDREN", severity: VALIDATION_SEVERITY.CRITICAL, message: "Children array is missing" },
  MISSING_ID: { code: "MISSING_ID", severity: VALIDATION_SEVERITY.CRITICAL, message: "Node is missing required id" },
  MISSING_TYPE: { code: "MISSING_TYPE", severity: VALIDATION_SEVERITY.CRITICAL, message: "Node is missing required type" },
  MISSING_PROPS: { code: "MISSING_PROPS", severity: VALIDATION_SEVERITY.CRITICAL, message: "Node is missing required props" },
  MISSING_STYLES: { code: "MISSING_STYLES", severity: VALIDATION_SEVERITY.CRITICAL, message: "Node is missing required styles" },
  DUPLICATE_ID: { code: "DUPLICATE_ID", severity: VALIDATION_SEVERITY.CRITICAL, message: "Duplicate ID found" },
  UNSUPPORTED_TYPE: { code: "UNSUPPORTED_TYPE", severity: VALIDATION_SEVERITY.MAJOR, message: "Unsupported component type" },
  INVALID_NESTING: { code: "INVALID_NESTING", severity: VALIDATION_SEVERITY.MAJOR, message: "Invalid nesting detected" },
  CIRCULAR_REFERENCE: { code: "CIRCULAR_REFERENCE", severity: VALIDATION_SEVERITY.CRITICAL, message: "Circular reference detected" },
  EMPTY_TREE: { code: "EMPTY_TREE", severity: VALIDATION_SEVERITY.MAJOR, message: "Component tree is empty" },
  INVALID_STYLE_VALUE: { code: "INVALID_STYLE_VALUE", severity: VALIDATION_SEVERITY.MAJOR, message: "Invalid style value" },
  INVALID_COLOR: { code: "INVALID_COLOR", severity: VALIDATION_SEVERITY.MINOR, message: "Invalid color value" },
  INVALID_SPACING: { code: "INVALID_SPACING", severity: VALIDATION_SEVERITY.MINOR, message: "Invalid spacing value" },
  INVALID_FONT_SIZE: { code: "INVALID_FONT_SIZE", severity: VALIDATION_SEVERITY.MINOR, message: "Invalid font size" },
};

export const SUPPORTED_COMPONENT_TYPES = new Set([
  "root", "container", "heading", "text", "button",
  "input", "textarea", "image", "card",
]);

export const COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|[a-z]+)$/i;
export const SPACING_PATTERN = /^(\d+(\.\d+)?(px|rem|em|%|vh|vw)?)$/i;
export const FONT_SIZE_PATTERN = /^(\d+(\.\d+)?(px|rem|em)?)$/i;

export const NESTING_RULES = {
  heading: ["container", "card", "root"],
  button: ["container", "card", "root"],
  input: ["container", "card", "root"],
  textarea: ["container", "card", "root"],
  image: ["container", "card", "root"],
  text: ["container", "card", "root"],
  card: ["container", "root"],
  container: ["root"],
  root: [],
};
