import { VALIDATION_CODES, COLOR_PATTERN, SPACING_PATTERN, FONT_SIZE_PATTERN } from "./validationRules";

function createWarning(codeDef, message, path = "") {
  const def = typeof codeDef === "string"
    ? Object.values(VALIDATION_CODES).find((c) => c.code === codeDef)
    : codeDef;
  return { code: def.code, severity: def.severity, message: message || def.message, path, warning: true };
}

function isValidColor(value) {
  if (!value || typeof value !== "string") return false;
  if (value === "transparent" || value === "inherit" || value === "initial" || value === "unset") return true;
  return COLOR_PATTERN.test(value);
}

function isValidSpacing(value) {
  if (!value || typeof value !== "string") return false;
  if (value === "auto" || value === "inherit" || value === "initial" || value === "unset") return true;
  return SPACING_PATTERN.test(value);
}

function isValidFontSize(value) {
  if (!value || typeof value !== "string") return false;
  return FONT_SIZE_PATTERN.test(value);
}

function isValidWidthHeight(value) {
  if (!value || typeof value !== "string") return false;
  if (value === "auto" || value === "inherit" || value === "initial" || value === "unset") return true;
  return /^(\d+(\.\d+)?(px|rem|em|%|vh|vw)?)$/i.test(value);
}

const COLOR_PROPERTIES = [
  "color", "backgroundColor", "borderColor", "outlineColor",
  "textDecorationColor", "columnRuleColor", "caretColor",
];

const SPACING_PROPERTIES = [
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "gap", "rowGap", "columnGap",
];

const FONT_PROPERTIES = ["fontSize", "lineHeight"];

const WIDTH_HEIGHT_PROPERTIES = [
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
];

function validateStyleValue(key, value, path, errors, warnings) {
  if (value === undefined || value === null || value === "") return;

  const strValue = String(value);

  if (COLOR_PROPERTIES.includes(key)) {
    if (!isValidColor(strValue)) {
      warnings.push(createWarning(VALIDATION_CODES.INVALID_COLOR, `Invalid color for ${key}: ${strValue}`, path));
    }
  }

  if (SPACING_PROPERTIES.includes(key)) {
    if (!isValidSpacing(strValue)) {
      warnings.push(createWarning(VALIDATION_CODES.INVALID_SPACING, `Invalid spacing for ${key}: ${strValue}`, path));
    }
  }

  if (FONT_PROPERTIES.includes(key)) {
    if (!isValidFontSize(strValue)) {
      warnings.push(createWarning(VALIDATION_CODES.INVALID_FONT_SIZE, `Invalid font size for ${key}: ${strValue}`, path));
    }
  }

  if (WIDTH_HEIGHT_PROPERTIES.includes(key)) {
    if (!isValidWidthHeight(strValue)) {
      warnings.push(createWarning(VALIDATION_CODES.INVALID_STYLE_VALUE, `Invalid width/height for ${key}: ${strValue}`, path));
    }
  }
}

function validateNodeStyles(node, path, errors, warnings) {
  if (!node || !node.styles || typeof node.styles !== "object") return;

  for (const [key, value] of Object.entries(node.styles)) {
    validateStyleValue(key, value, `${path}.styles.${key}`, errors, warnings);
  }
}

function traverseAndValidate(node, path, errors, warnings) {
  if (!node || typeof node !== "object") return;

  validateNodeStyles(node, path, errors, warnings);

  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      traverseAndValidate(node.children[i], `${path}.children[${i}]`, errors, warnings);
    }
  }
}

export function validateStyles(tree) {
  const errors = [];
  const warnings = [];

  traverseAndValidate(tree, "root", errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
