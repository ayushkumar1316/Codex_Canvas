import { SYSTEM_PROMPT } from "./systemPrompt";
import { validateResponse } from "./validator";
import { buildContext } from "./contextBuilder";
import aiPatchSchema from "./patchSchema";
import { executeWithFallback } from "./providerManager";
import { optimizeImage } from "@/utils/imageOptimizer";
import { applyJsonPatch } from "@/utils/jsonPatch";
import { completionPass } from "@/utils/completionPass";
import { componentRegistry } from "@/registry/componentRegistry";

const DEFAULT_REGISTRY = Object.keys(componentRegistry);

export async function executeAICommand(command) {
  try {
    let referenceImage = command.referenceImage ?? null;
    if (referenceImage?.preview) {
      referenceImage = await optimizeImage(referenceImage);
    }

    const context = buildContext({
      componentTree: command.componentTree,
      selectedComponentId: command.selectedComponentId,
      editorMode: command.editorMode,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
      userPrompt: command.prompt,
      referenceImage,
    });

    const fallbackResult = await executeWithFallback({
      systemPrompt: SYSTEM_PROMPT,
      context,
      userPrompt: command.prompt,
      schema: aiPatchSchema,
    });

    if (!fallbackResult.success) {
      return {
        success: false,
        componentTree: null,
        error: fallbackResult.error,
      };
    }

    const validation = validateResponse(fallbackResult.response, {
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
      provider: fallbackResult.provider,
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
