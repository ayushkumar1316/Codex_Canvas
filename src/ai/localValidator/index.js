import { validateComponentTree } from "./componentValidator";
import { validateStyles } from "./styleValidator";

function calculateScore(errors, warnings) {
  let score = 100;
  for (const error of errors) {
    if (error.severity === "critical") score -= 20;
    else if (error.severity === "major") score -= 10;
    else score -= 5;
  }
  score -= (warnings || []).length * 2;
  return Math.max(0, Math.min(100, score));
}

function buildResult(errors, warnings) {
  const score = calculateScore(errors, warnings);
  const hasCritical = errors.some((e) => e.severity === "critical");
  const hasMajor = errors.some((e) => e.severity === "major");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
    repairRequired: hasCritical || hasMajor,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      critical: errors.filter((e) => e.severity === "critical").length,
      major: errors.filter((e) => e.severity === "major").length,
      minor: errors.filter((e) => e.severity === "minor").length,
    },
  };
}

export function validateCanvas(tree, canvasState) {
  const treeResult = validateComponentTree(tree, canvasState);
  const styleResult = validateStyles(tree);

  const allErrors = [...treeResult.errors, ...styleResult.errors];
  const allWarnings = [...treeResult.warnings, ...styleResult.warnings];

  return buildResult(allErrors, allWarnings);
}

export { validateComponentTree, validateStyles };
