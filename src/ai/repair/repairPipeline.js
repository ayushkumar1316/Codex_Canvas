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

  console.log("[RepairPipeline] Starting repair pipeline for provider:", provider);
  console.log("[RepairPipeline] Raw response type:", typeof rawResponse, "isArray:", Array.isArray(rawResponse));

  let jsonResult = null;
  let parsed = rawResponse;

  if (typeof rawResponse === "string") {
    console.log("[RepairPipeline] Raw string length:", rawResponse.length);
    console.log("[RepairPipeline] Raw string (first 200):", rawResponse.substring(0, 200));
    jsonResult = repairJSON(rawResponse);
    if (jsonResult.success) {
      parsed = jsonResult.data;
      console.log("[RepairPipeline] JSON repair succeeded, parsed type:", typeof parsed);
    } else {
      console.log("[RepairPipeline] JSON repair failed, trying provider repairs");
      const providerResult = applyProviderRepairs(rawResponse, provider);
      if (providerResult.success) {
        parsed = providerResult.data;
        jsonResult = providerResult;
        console.log("[RepairPipeline] Provider repair succeeded");
      } else {
        console.log("[RepairPipeline] Provider repair failed");
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
    console.log("[RepairPipeline] Parsed is not an object:", parsed);
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

  console.log("[RepairPipeline] Parsed keys:", Object.keys(parsed), "operations count:", parsed?.operations?.length);

  let validation = validateResponse(parsed, validationContext);

  if (validation.success) {
    console.log("[RepairPipeline] Validation succeeded on first pass");
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

  console.log("[RepairPipeline] Initial validation failed with", validation.errors.length, "errors");
  console.log("[RepairPipeline] Validation errors:", validation.errors.map(e => `${e.kind}: ${e.message}`));

  const allRepairs = [];
  const allWarnings = [];
  let lastValidation = validation;

  for (let attempt = 0; attempt < MAX_REPAIR_ATTEMPTS; attempt++) {
    console.log(`[RepairPipeline] Repair attempt ${attempt + 1}/${MAX_REPAIR_ATTEMPTS}`);
    const repairResult = repairResponse(parsed, validation.errors, context);

    console.log("[RepairPipeline] Repair result:", {
      repaired: repairResult.repaired,
      repairLevel: repairResult.repairLevel,
      repairedFields: repairResult.repairedFields,
      errors: repairResult.errors?.length,
      warnings: repairResult.warnings?.length,
    });

    if (repairResult.response) {
      parsed = repairResult.response;
    }

    if (repairResult.repaired) {
      allRepairs.push(...repairResult.repairedFields);
      allWarnings.push(...(repairResult.warnings || []));
    }

    if (repairResult.repairLevel === "critical" && !repairResult.repaired) {
      console.log("[RepairPipeline] Critical repair failed, aborting");
      const criticalErrors = (repairResult.errors || validation.errors).map((e) => ({
        ...e,
        severity: e.severity || "critical",
      }));
      return {
        success: false,
        repaired: allRepairs.length > 0,
        valid: false,
        repairLevel: "critical",
        errors: criticalErrors,
        warnings: allWarnings,
        score: calculateScore(criticalErrors, allWarnings),
        patchedResponse: null,
      };
    }

    if (repairResult.repaired) {
      console.log("[RepairPipeline] Re-validating after repair...");
      validation = validateResponse(parsed, validationContext);
      lastValidation = validation;

      if (validation.success) {
        console.log("[RepairPipeline] Validation succeeded after repair");
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
      } else {
        console.log("[RepairPipeline] Still failing validation:", validation.errors.map(e => `${e.kind}: ${e.message}`));
      }
    } else {
      console.log("[RepairPipeline] No repairs made, breaking");
      break;
    }
  }

  console.log("[RepairPipeline] Final result - success:", lastValidation.success, "errors:", lastValidation.errors.length);
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
