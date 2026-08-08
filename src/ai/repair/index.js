import { runRepairPipeline, repairTreeOnly } from "./repairPipeline";
import { repairJSON } from "./jsonRepair";
import { REPAIR_LEVEL, REPAIR_RULES } from "./repairRules";

export function repairResponse(rawResponse, provider = "auto", context = {}) {
  return runRepairPipeline(rawResponse, provider, context);
}

export function repairJSONPublic(text) {
  return repairJSON(text);
}

export function repairComponentTree(tree) {
  return repairTreeOnly(tree);
}

export { REPAIR_LEVEL, REPAIR_RULES };
