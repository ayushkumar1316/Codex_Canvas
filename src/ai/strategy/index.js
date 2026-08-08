import { executeStrategy, getStrategyInfo } from "./strategyEngine";
import { resolveStrategy } from "./strategyResolver";
import { checkCapabilityMatch, getRecommendedProvider, getRequiredCapability } from "./strategyRules";
import { STRATEGY, EXECUTION_TYPE, COMPLEXITY, PROVIDER_MODE } from "./strategyTypes";

export function resolveStrategyPublic(intentMetadata, options) {
  return executeStrategy(intentMetadata, options);
}

export { resolveStrategy, executeStrategy, getStrategyInfo };
export { checkCapabilityMatch, getRecommendedProvider, getRequiredCapability };
export { STRATEGY, EXECUTION_TYPE, COMPLEXITY, PROVIDER_MODE };
