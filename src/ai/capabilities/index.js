import { routeCapability, getCapabilityInfo, getRequiredCapabilitiesForStrategy } from "./capabilityRouter";
import { resolveCapability } from "./capabilityResolver";
import { getProviderCapabilities, hasCapability, rankProviders } from "./capabilityRules";
import { CAPABILITY, CONFIDENCE, PROVIDER_MODE, CAPABILITY_DESCRIPTIONS, CAPABILITY_CATEGORY, EXECUTION_MODE, CAPABILITY_PRIORITY } from "./capabilityTypes";
import { getCapability, getAllCapabilities as getAllRegistryCapabilities, hasCapability as hasRegistryCapability, getCapabilitiesByCategory, getCapabilitiesByPriority, getRequiredCapabilities, getCapabilityIds } from "./capabilityRegistry";
import { validateCapabilityRegistry } from "./capabilityValidator";
import { getAllCapabilities } from "./capabilityRegistry";

export function routeCapabilityPublic(options) {
  return routeCapability(options);
}

export { routeCapability, resolveCapability, getCapabilityInfo, getRequiredCapabilitiesForStrategy };
export { getProviderCapabilities, hasCapability, rankProviders };
export { CAPABILITY, CONFIDENCE, PROVIDER_MODE, CAPABILITY_DESCRIPTIONS, CAPABILITY_CATEGORY, EXECUTION_MODE, CAPABILITY_PRIORITY };

export { getCapability, getAllRegistryCapabilities, hasRegistryCapability, getCapabilitiesByCategory, getCapabilitiesByPriority, getRequiredCapabilities, getCapabilityIds };
export { validateCapabilityRegistry };

export function runCapabilityValidation() {
  const caps = getAllCapabilities();
  return validateCapabilityRegistry(caps);
}
