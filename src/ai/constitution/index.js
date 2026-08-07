import { buildConstitution, getConstitutionSize } from "./constitutionBuilder";
import { optimizePrompt } from "../optimizer";

export function buildDynamicPrompt(prompt, options = {}) {
  const optimized = optimizePrompt(prompt, options);
  const promptType = optimized.promptType;

  const constitution = buildConstitution(promptType, prompt, options);
  const size = getConstitutionSize(constitution);

  return {
    constitution,
    promptType,
    size,
    optimized,
  };
}

export { buildConstitution, getConstitutionSize } from "./constitutionBuilder";
