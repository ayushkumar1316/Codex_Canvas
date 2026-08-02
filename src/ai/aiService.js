import openAIProvider from "./providers/openai";
import openRouterProvider from "./providers/openrouter";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { validateResponse } from "./validator";
import { buildContext } from "./contextBuilder";
import aiPatchSchema from "./patchSchema";
import { applyJsonPatch } from "@/utils/jsonPatch";

const providers = {
  openai: openAIProvider,
  openrouter: openRouterProvider,
};

const provider = providers[import.meta.env.VITE_AI_PROVIDER || "openrouter"];

export async function executeAICommand(command) {
  try {
    const context = buildContext({
      componentTree: command.componentTree,
      selectedComponentId: command.selectedComponentId,
      editorMode: command.editorMode,
      registry: command.registry ?? command.context?.registry,
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
      registry: command.registry ?? command.context?.registry,
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

    const updatedComponentTree = applyJsonPatch(
      command.componentTree,
      validation.patch
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
