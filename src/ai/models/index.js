import { modelCatalog } from "./modelCatalog";
import { validateModelCatalog, validateModel } from "./modelValidator";
import {
  Capability,
  ProviderType,
  SpeedTier,
  Availability,
  REQUIRED_MODEL_FIELDS,
  VALID_CAPABILITIES,
  VALID_PROVIDER_TYPES,
  VALID_SPEED_TIERS,
  VALID_AVAILABILITY_LEVELS,
  VALIDATION_ERROR,
} from "./modelTypes";
import {
  getCapabilityMapping,
  getPrimaryModel,
  getFallbackModels,
  getEmergencyModels,
  getAllCapabilityMappings,
  getCapabilityIds,
  validateCapabilityMappings,
} from "./capabilityModelMap";

export function getModel(id) {
  return modelCatalog.find((model) => model.id === id) || null;
}

export function getModels() {
  return [...modelCatalog];
}

export function getModelsByCapability(capability) {
  return modelCatalog.filter((model) => model.capabilities.includes(capability));
}

export function getModelsByProvider(provider) {
  return modelCatalog.filter((model) => model.provider === provider);
}

export function getFreeModels() {
  return modelCatalog.filter((model) => model.free === true);
}

export function getActiveModels() {
  return modelCatalog.filter((model) => model.deprecated !== true);
}

export function getModelsBySpeed(speed) {
  return modelCatalog.filter((model) => model.speed === speed);
}

export function getModelsByAvailability(availability) {
  return modelCatalog.filter((model) => model.availability === availability);
}

export function getVisionModels() {
  return modelCatalog.filter((model) => model.vision === true);
}

export function getCodingModels() {
  return modelCatalog.filter((model) => model.coding === true);
}

export function getStructuredOutputModels() {
  return modelCatalog.filter((model) => model.structuredOutput === true);
}

export function getToolCallingModels() {
  return modelCatalog.filter((model) => model.toolCalling === true);
}

export function getReasoningModels() {
  return modelCatalog.filter((model) => model.reasoning === true);
}

export function getMultimodalModels() {
  return modelCatalog.filter((model) => model.multimodal === true);
}

export function getLongContextModels(minContext = 262144) {
  return modelCatalog.filter((model) => model.contextWindow >= minContext);
}

export function modelExists(id) {
  return modelCatalog.some((model) => model.id === id);
}

export function getProviders() {
  return [...new Set(modelCatalog.map((model) => model.provider))];
}

export function getCapabilities() {
  return [...new Set(modelCatalog.flatMap((model) => model.capabilities))];
}

export { validateModelCatalog, validateModel };

export {
  Capability,
  ProviderType,
  SpeedTier,
  Availability,
  REQUIRED_MODEL_FIELDS,
  VALID_CAPABILITIES,
  VALID_PROVIDER_TYPES,
  VALID_SPEED_TIERS,
  VALID_AVAILABILITY_LEVELS,
  VALIDATION_ERROR,
};

export { modelCatalog };

export {
  getCapabilityMapping,
  getPrimaryModel,
  getFallbackModels,
  getEmergencyModels,
  getAllCapabilityMappings,
  getCapabilityIds,
  validateCapabilityMappings,
};
