import { validateStructure } from "./structureValidator";
import { validateComponentTree as validateTree } from "./componentValidator";
import { validateStyles } from "./styleValidator";

function calculateScore(errors, warnings) {
  let score = 100;

  for (const error of errors) {
    if (error.severity === "critical") score -= 20;
    else if (error.severity === "major") score -= 10;
    else score -= 5;
  }

  score -= warnings.length * 2;

  return Math.max(0, Math.min(100, score));
}

function mergeResults(...results) {
  const allErrors = [];
  const allWarnings = [];

  for (const result of results) {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return { errors: allErrors, warnings: allWarnings };
}

export function validateResponse(response, tree) {
  const structureResult = validateStructure(response);

  let componentResult = { valid: true, errors: [], warnings: [] };
  let styleResult = { valid: true, errors: [], warnings: [] };

  if (tree) {
    componentResult = validateTree(tree);
    styleResult = validateStyles(tree);
  }

  const merged = mergeResults(structureResult, componentResult, styleResult);
  const score = calculateScore(merged.errors, merged.warnings);

  const hasCritical = merged.errors.some((e) => e.severity === "critical");
  const hasMajor = merged.errors.some((e) => e.severity === "major");

  return {
    valid: merged.errors.length === 0,
    errors: merged.errors,
    warnings: merged.warnings,
    score,
    repairRequired: hasCritical || hasMajor,
    summary: {
      totalErrors: merged.errors.length,
      totalWarnings: merged.warnings.length,
      critical: merged.errors.filter((e) => e.severity === "critical").length,
      major: merged.errors.filter((e) => e.severity === "major").length,
      minor: merged.errors.filter((e) => e.severity === "minor").length,
    },
  };
}

export function validatePatchResponse(response) {
  return validateStructure(response);
}
