import { CAPABILITY_CATEGORY, EXECUTION_MODE, CAPABILITY_PRIORITY } from "./capabilityTypes";

const CAPABILITIES = [
  {
    id: "website_generation",
    name: "Website Generation",
    description: "Generate complete website structures from natural language descriptions",
    category: CAPABILITY_CATEGORY.GENERATION,
    priority: CAPABILITY_PRIORITY.CRITICAL,
    requiredFeatures: ["structured_output", "long_context"],
    optionalFeatures: ["vision", "streaming"],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.ASYNC,
  },
  {
    id: "ui_editing",
    name: "UI Editing",
    description: "Modify existing UI components and layouts based on user instructions",
    category: CAPABILITY_CATEGORY.EDITING,
    priority: CAPABILITY_PRIORITY.CRITICAL,
    requiredFeatures: ["structured_output", "tool_calling"],
    optionalFeatures: ["vision"],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "json_patch_generation",
    name: "JSON Patch Generation",
    description: "Generate RFC 6902 JSON Patch operations for component tree mutations",
    category: CAPABILITY_CATEGORY.GENERATION,
    priority: CAPABILITY_PRIORITY.CRITICAL,
    requiredFeatures: ["structured_output"],
    optionalFeatures: [],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "intent_classification",
    name: "Intent Classification",
    description: "Classify user input into actionable intent categories",
    category: CAPABILITY_CATEGORY.REASONING,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["structured_output", "reasoning"],
    optionalFeatures: ["vision", "tool_calling"],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "vision_understanding",
    name: "Vision Understanding",
    description: "Process and interpret visual input from screenshots and mockups",
    category: CAPABILITY_CATEGORY.UNDERSTANDING,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["vision"],
    optionalFeatures: ["reasoning"],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.ASYNC,
  },
  {
    id: "wireframe_understanding",
    name: "Wireframe Understanding",
    description: "Interpret wireframe sketches and translate them into structured components",
    category: CAPABILITY_CATEGORY.UNDERSTANDING,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["vision", "reasoning"],
    optionalFeatures: [],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.ASYNC,
  },
  {
    id: "image_understanding",
    name: "Image Understanding",
    description: "Analyze images to extract design patterns, colors, and layout information",
    category: CAPABILITY_CATEGORY.UNDERSTANDING,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["vision"],
    optionalFeatures: ["reasoning", "tool_calling"],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.ASYNC,
  },
  {
    id: "component_generation",
    name: "Component Generation",
    description: "Generate individual UI component definitions with props and styles",
    category: CAPABILITY_CATEGORY.GENERATION,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["structured_output"],
    optionalFeatures: ["tool_calling"],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "layout_generation",
    name: "Layout Generation",
    description: "Generate responsive page layouts and section arrangements",
    category: CAPABILITY_CATEGORY.GENERATION,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["structured_output"],
    optionalFeatures: ["vision"],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "style_editing",
    name: "Style Editing",
    description: "Modify CSS properties, themes, and visual styling of components",
    category: CAPABILITY_CATEGORY.EDITING,
    priority: CAPABILITY_PRIORITY.MEDIUM,
    requiredFeatures: ["structured_output", "tool_calling"],
    optionalFeatures: ["vision"],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "content_editing",
    name: "Content Editing",
    description: "Edit text content, copy, and structured data within components",
    category: CAPABILITY_CATEGORY.EDITING,
    priority: CAPABILITY_PRIORITY.MEDIUM,
    requiredFeatures: ["structured_output", "tool_calling"],
    optionalFeatures: [],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "reasoning",
    name: "Reasoning",
    description: "Perform multi-step reasoning and planning for complex tasks",
    category: CAPABILITY_CATEGORY.REASONING,
    priority: CAPABILITY_PRIORITY.HIGH,
    requiredFeatures: ["reasoning"],
    optionalFeatures: ["long_context", "tool_calling"],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.ASYNC,
  },
  {
    id: "long_context",
    name: "Long Context",
    description: "Process and generate content with very large context windows",
    category: CAPABILITY_CATEGORY.UTILITY,
    priority: CAPABILITY_PRIORITY.MEDIUM,
    requiredFeatures: ["long_context"],
    optionalFeatures: [],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.ASYNC,
  },
  {
    id: "structured_output",
    name: "Structured Output",
    description: "Generate valid, schema-compliant JSON responses",
    category: CAPABILITY_CATEGORY.UTILITY,
    priority: CAPABILITY_PRIORITY.CRITICAL,
    requiredFeatures: ["structured_output"],
    optionalFeatures: [],
    supportsFallback: true,
    supportsEmergency: true,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
  {
    id: "tool_calling",
    name: "Tool Calling",
    description: "Invoke external tools and functions during response generation",
    category: CAPABILITY_CATEGORY.UTILITY,
    priority: CAPABILITY_PRIORITY.MEDIUM,
    requiredFeatures: ["tool_calling"],
    optionalFeatures: ["structured_output"],
    supportsFallback: true,
    supportsEmergency: false,
    defaultExecutionMode: EXECUTION_MODE.SYNC,
  },
];

const capabilityMap = new Map(CAPABILITIES.map((cap) => [cap.id, cap]));

export function getCapability(id) {
  return capabilityMap.get(id) || null;
}

export function getAllCapabilities() {
  return [...CAPABILITIES];
}

export function hasCapability(id) {
  return capabilityMap.has(id);
}

export function getCapabilitiesByCategory(category) {
  return CAPABILITIES.filter((cap) => cap.category === category);
}

export function getCapabilitiesByPriority(minPriority) {
  return CAPABILITIES.filter((cap) => cap.priority >= minPriority);
}

export function getRequiredCapabilities(ids) {
  return ids.map((id) => capabilityMap.get(id)).filter(Boolean);
}

export function getCapabilityIds() {
  return CAPABILITIES.map((cap) => cap.id);
}

export default {
  getCapability,
  getAllCapabilities,
  hasCapability,
  getCapabilitiesByCategory,
  getCapabilitiesByPriority,
  getRequiredCapabilities,
  getCapabilityIds,
};
