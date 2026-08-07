import { SYSTEM_PROMPT } from "./systemPrompt";
import { validateResponse } from "./validator";
import { buildContext } from "./contextBuilder";
import aiPatchSchema from "./patchSchema";
import { executeWithFallback } from "./providerManager";
import { optimizeImage } from "@/utils/imageOptimizer";
import { applyJsonPatch } from "@/utils/jsonPatch";
import { completionPass } from "@/utils/completionPass";
import { componentRegistry } from "@/registry/componentRegistry";
import { optimizePrompt } from "./optimizer";
import { buildDynamicPrompt } from "./constitution";
import { validateAIOperation } from "./localValidator";

const DEFAULT_REGISTRY = Object.keys(componentRegistry);

export async function executeAICommand(command) {
  try {
    let referenceImage = command.referenceImage ?? null;
    if (referenceImage?.preview) {
      referenceImage = await optimizeImage(referenceImage);
    }

    const optimized = optimizePrompt(command.prompt, {
      hasImage: !!referenceImage?.preview,
      hasVoice: !!command.hasVoice,
    });

    const effectivePrompt = optimized.optimizedPrompt || optimized.rawPrompt;

    const { constitution, promptType, size } = buildDynamicPrompt(command.prompt, {
      hasImage: !!referenceImage?.preview,
      hasVoice: !!command.hasVoice,
    });

    const context = buildContext({
      componentTree: command.componentTree,
      selectedComponentId: command.selectedComponentId,
      editorMode: command.editorMode,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
      userPrompt: effectivePrompt,
      referenceImage,
    });

    const fallbackResult = await executeWithFallback({
      systemPrompt: constitution || SYSTEM_PROMPT,
      context,
      userPrompt: effectivePrompt,
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

    const localValidation = validateAIOperation(
      fallbackResult.response,
      command.componentTree,
      command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY
    );

    const updatedComponentTree = completionPass(
      applyJsonPatch(command.componentTree, validation.patch)
    );

    return {
      success: true,
      componentTree: updatedComponentTree,
      error: null,
      provider: fallbackResult.provider,
      optimization: {
        promptType: optimized.promptType,
        confidence: optimized.confidence,
        wasOptimized: optimized.optimizedPrompt !== optimized.rawPrompt,
        complexity: optimized.metadata.estimatedComplexity,
      },
      constitution: {
        promptType,
        size,
      },
      validation: {
        score: localValidation.score,
        errors: localValidation.errors.length,
        warnings: localValidation.warnings.length,
        repairRequired: localValidation.repairRequired,
      },
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
