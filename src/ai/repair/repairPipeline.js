import { validateResponse, ValidationErrorCode } from "../validator";
import { repairJSON } from "./jsonRepair";
import { applyProviderRepairs } from "./repairStrategies";
import { repairResponse, repairComponentTreeStandalone } from "./repairEngine";

const MAX_REPAIR_ATTEMPTS = 2;

function severityOfCode(code) {
  switch (code) {
    case ValidationErrorCode.SCHEMA:
    case ValidationErrorCode.BUSINESS:
      return "critical";
    case ValidationErrorCode.REGISTRY:
    case ValidationErrorCode.PATCH:
      return "major";
    default:
      return "major";
  }
}

function calculateScore(errors, warnings) {
  let score = 100;
  for (const error of errors) {
    if (severityOfCode(error.code) === "critical") score -= 20;
    else if (severityOfCode(error.code) === "major") score -= 10;
    else score -= 5;
  }
  score -= (warnings || []).length * 2;
  return Math.max(0, Math.min(100, score));
}

export function runRepairPipeline(rawResponse, provider, context = {}) {
  const { componentTree, registry, strategy } = context;
  const validationContext = { componentTree, registry, strategy };

  let jsonResult = null;
  let parsed = rawResponse;

  if (typeof rawResponse === "string") {
    jsonResult = repairJSON(rawResponse);
    if (jsonResult.success) {
      parsed = jsonResult.data;
    } else {
      const providerResult = applyProviderRepairs(rawResponse, provider);
      if (providerResult.success) {
        parsed = providerResult.data;
        jsonResult = providerResult;
      } else {
        return {
          success: false,
          repaired: false,
          valid: false,
          repairLevel: "critical",
          errors: [{ code: "INVALID_JSON", severity: "critical", message: "Could not parse AI response as JSON" }],
          warnings: [],
          score: 0,
          patchedResponse: null,
        };
      }
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      success: false,
      repaired: false,
      valid: false,
      repairLevel: "critical",
      errors: [{ code: "INVALID_JSON", severity: "critical", message: "AI response is not an object" }],
      warnings: [],
      score: 0,
      patchedResponse: null,
    };
  }

  let validation = validateResponse(parsed, validationContext);

  if (validation.success) {
    return {
      success: true,
      repaired: jsonResult?.repaired || false,
      valid: true,
      repairLevel: null,
      errors: [],
      warnings: [],
      score: calculateScore([], []),
      patchedResponse: validation.patch,
    };
  }

  const allRepairs = [];
  const allWarnings = [];
  let lastValidation = validation;

  for (let attempt = 0; attempt < MAX_REPAIR_ATTEMPTS; attempt++) {
    const repairResult = repairResponse(parsed, validation.errors, context);

    if (repairResult.response) {
      parsed = repairResult.response;
    }

    if (repairResult.repaired) {
      allRepairs.push(...repairResult.repairedFields);
      allWarnings.push(...(repairResult.warnings || []));
    }

    if (repairResult.repairLevel === "critical" && !repairResult.repaired) {
      return {
        success: false,
        repaired: allRepairs.length > 0,
        valid: false,
        repairLevel: "critical",
        errors: repairResult.errors || validation.errors,
        warnings: allWarnings,
        score: calculateScore(repairResult.errors || validation.errors, allWarnings),
        patchedResponse: null,
      };
    }

    if (repairResult.repaired) {
      validation = validateResponse(parsed, validationContext);
      lastValidation = validation;

      if (validation.success) {
        return {
          success: true,
          repaired: true,
          valid: true,
          repairLevel: repairResult.repairLevel,
          repairedFields: allRepairs,
          warnings: allWarnings,
          score: calculateScore([], allWarnings),
          patchedResponse: validation.patch,
        };
      }
    } else {
      break;
    }
  }

  return {
    success: lastValidation.success,
    repaired: allRepairs.length > 0,
    valid: lastValidation.success,
    repairLevel: allRepairs.length > 0 ? "major" : "critical",
    repairedFields: allRepairs,
    errors: lastValidation.errors,
    warnings: allWarnings,
    score: calculateScore(lastValidation.errors, allWarnings),
    patchedResponse: lastValidation.success ? lastValidation.patch : null,
  };
}

export function repairTreeOnly(tree) {
  if (!tree || typeof tree !== "object") return tree;
  return repairComponentTreeStandalone(tree);
}
