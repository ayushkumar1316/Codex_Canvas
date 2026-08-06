import openAIProvider from "./providers/openai";
import openRouterProvider from "./providers/openrouter";
import geminiProvider from "./providers/gemini";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { validateResponse } from "./validator";
import { buildContext } from "./contextBuilder";
import aiPatchSchema from "./patchSchema";
import { applyJsonPatch } from "@/utils/jsonPatch";
import { completionPass } from "@/utils/completionPass";
import { componentRegistry } from "@/registry/componentRegistry";

const DEFAULT_REGISTRY = Object.keys(componentRegistry);

const providers = {
  openai: openAIProvider,
  openrouter: openRouterProvider,
  gemini: geminiProvider,
};

function getProvider() {
  const name = import.meta.env.VITE_AI_PROVIDER || "openrouter";
  const p = providers[name];
  if (!p) {
    throw new Error(
      `Unsupported AI provider: "${name}". Supported: ${Object.keys(providers).join(", ")}`
    );
  }
  return p;
}

export async function executeAICommand(command) {
  try {
    const provider = getProvider();
    const context = buildContext({
      componentTree: command.componentTree,
      selectedComponentId: command.selectedComponentId,
      editorMode: command.editorMode,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
      userPrompt: command.prompt,
    });

    const response = await provider.execute({
      systemPrompt: SYSTEM_PROMPT,
      context,
      userPrompt: command.prompt,
      schema: aiPatchSchema,
    });

    const validation = validateResponse(response, {
      componentTree: command.componentTree,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
    });

    if (!validation.success) {
      return {
        success: false,
        componentTree: null,
        error: {
          type: "validation",
          message: validation.errors
            .map((err) => `[${err.code}] ${err.message}`)
            .join("\n"),
        },
      };
    }

    const updatedComponentTree = completionPass(
      applyJsonPatch(command.componentTree, validation.patch)
    );

    return {
      success: true,
      componentTree: updatedComponentTree,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      componentTree: null,
      error: {
        type: "request",
        message: error.message ?? "AI command failed",
      },
    };
  }
}
