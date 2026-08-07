import { validatePatchResponse } from "./localValidator";
import { validateComponentTree } from "./componentValidator";
import { validateStyles } from "./styleValidator";

export function validateAIOperation(response, currentTree) {
  const patchValidation = validatePatchResponse(response);

  let treeValidation = { valid: true, errors: [], warnings: [] };
  let styleValidation = { valid: true, errors: [], warnings: [] };

  if (currentTree) {
    treeValidation = validateComponentTree(currentTree);
    styleValidation = validateStyles(currentTree);
  }

  const allErrors = [
    ...patchValidation.errors,
    ...treeValidation.errors,
    ...styleValidation.errors,
  ];

  const allWarnings = [
    ...patchValidation.warnings,
    ...treeValidation.warnings,
    ...styleValidation.warnings,
  ];

  let score = 100;
  for (const error of allErrors) {
    if (error.severity === "critical") score -= 20;
    else if (error.severity === "major") score -= 10;
    else score -= 5;
  }
  score -= allWarnings.length * 2;
  score = Math.max(0, Math.min(100, score));

  const hasCritical = allErrors.some((e) => e.severity === "critical");
  const hasMajor = allErrors.some((e) => e.severity === "major");

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    score,
    repairRequired: hasCritical || hasMajor,
    summary: {
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      critical: allErrors.filter((e) => e.severity === "critical").length,
      major: allErrors.filter((e) => e.severity === "major").length,
      minor: allErrors.filter((e) => e.severity === "minor").length,
    },
  };
}

export { validatePatchResponse, validateComponentTree, validateStyles };
