import { SYSTEM_PROMPT } from "./systemPrompt";
import { validateResponse } from "./validator";
import { buildContext } from "./contextBuilder";
import aiPatchSchema from "./patchSchema";
import { executeWithFallback, executeWithResolution } from "./providerManager";
import { optimizeImage } from "@/utils/imageOptimizer";
import { applyJsonPatch } from "@/utils/jsonPatch";
import { completionPass } from "@/utils/completionPass";
import { componentRegistry } from "@/registry/componentRegistry";
import { optimizePrompt } from "./optimizer";
import { createIntentRoute, buildContextWithIntent } from "./router";
import { executeStrategy } from "./strategy";
import { getCapabilityForStrategy } from "./strategy/strategyRules";
import { resolveCapability } from "./resolver";
import { analyzeCanvasIntelligence } from "./canvas";
import { routeCapability } from "./capabilities";
import { buildDynamicPrompt } from "./constitution";
import { runRepairPipeline } from "./repair/repairPipeline";

const DEFAULT_REGISTRY = Object.keys(componentRegistry);
const IS_DEV = import.meta.env.DEV;

function devLog(stage, data) {
  if (IS_DEV) {
    console.log(`[Pipeline] ${stage}`, data);
  }
}

function devTime(label) {
  if (IS_DEV) console.time(`[Pipeline] ${label}`);
}

function devTimeEnd(label) {
  if (IS_DEV) console.timeEnd(`[Pipeline] ${label}`);
}

export async function executeAICommand(command) {
  const timings = {};
  const totalStart = performance.now();

  try {
    devLog("Stage", { prompt: command.prompt?.slice(0, 50), hasImage: !!command.referenceImage, mode: command.editorMode });

    let referenceImage = command.referenceImage ?? null;
    if (referenceImage?.preview) {
      devTime("Image Optimization");
      referenceImage = await optimizeImage(referenceImage);
      devTimeEnd("Image Optimization");
    }

    devTime("Prompt Optimization");
    const optimized = optimizePrompt(command.prompt, {
      hasImage: !!referenceImage?.preview,
      hasVoice: !!command.hasVoice,
    });
    devTimeEnd("Prompt Optimization");
    timings.promptOptimization = performance.now() - totalStart;

    devLog("Prompt Optimized", {
      type: optimized.promptType,
      confidence: optimized.confidence,
      complexity: optimized.metadata.estimatedComplexity,
    });

    const effectivePrompt = optimized.optimizedPrompt || optimized.rawPrompt;

    devTime("Intent Routing");
    const intentRoute = createIntentRoute(optimized, {
      hasImage: !!referenceImage?.preview,
      hasVoice: !!command.hasVoice,
      selectedComponentId: command.selectedComponentId,
    });
    devTimeEnd("Intent Routing");

    devLog("Intent Detected", {
      intent: intentRoute.intent,
      confidence: intentRoute.confidence,
      operations: intentRoute.operations,
      vision: intentRoute.requiresVision,
      complexity: intentRoute.estimatedComplexity,
    });

    devTime("Strategy Resolution");
    const strategy = executeStrategy(intentRoute, {
      providerSelection: command.aiProvider || "auto",
      canvasState: command.canvasState,
      hasReferenceImage: !!referenceImage?.preview,
      hasVoiceInput: !!command.hasVoice,
    });
    devTimeEnd("Strategy Resolution");

    devLog("Strategy Resolved", {
      strategy: strategy.strategy,
      complexity: strategy.complexity,
      executionType: strategy.executionType,
      provider: strategy.recommendedProvider,
      reason: strategy.diagnostics?.reason,
    });

    devTime("Canvas Intelligence");
    const canvas = analyzeCanvasIntelligence(command.componentTree, intentRoute.intent, command.canvasState);
    devTimeEnd("Canvas Intelligence");

    devLog("Canvas Analyzed", {
      state: canvas.canvasState,
      score: canvas.completenessScore,
      components: canvas.componentCount,
      sections: canvas.sectionTypes?.length || 0,
      action: canvas.recommendedAction,
    });

    devTime("Capability Routing");
    const capability = routeCapability({
      strategy: strategy.strategy,
      providerSelection: command.aiProvider || "auto",
      hasReferenceImage: !!referenceImage?.preview,
      hasVoiceInput: !!command.hasVoice,
    });
    devTimeEnd("Capability Routing");

    devLog("Capability Resolved", {
      providerMode: capability.providerMode,
      selectedProvider: capability.selectedProvider,
      requiresSwitch: capability.requiresProviderSwitch,
      score: capability.capabilityScore,
      confidence: capability.confidence,
    });

    devTime("Context Building");
    const baseContext = buildContext({
      componentTree: command.componentTree,
      selectedComponentId: command.selectedComponentId,
      editorMode: command.editorMode,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
      userPrompt: effectivePrompt,
      referenceImage,
    });
    devTimeEnd("Context Building");

    const context = buildContextWithIntent(baseContext, intentRoute);

    devTime("Constitution Building");
    const { constitution, promptType, size } = buildDynamicPrompt(command.prompt, {
      hasImage: !!referenceImage?.preview,
      hasVoice: !!command.hasVoice,
    });
    devTimeEnd("Constitution Building");

    devLog("Constitution Built", {
      promptType,
      size: size.characters,
      tokens: size.estimatedTokens,
    });

    const timingsEnd = performance.now();
    timings.localProcessing = timingsEnd - totalStart;

    devLog("Timings", {
      localProcessing: `${timings.localProcessing.toFixed(1)}ms`,
      totalBeforeAPI: `${(timingsEnd - totalStart).toFixed(1)}ms`,
    });

    devTime("Capability Resolution");
    const capabilityId = getCapabilityForStrategy(strategy.strategy);
    const capabilityConstraints = {
      requireVision: !!referenceImage?.preview,
      requireStructuredOutput: true,
      requireFreeModel: false,
      minimumCoding: true,
      minimumReasoning: strategy.complexity === "complex",
    };
    const capabilityResult = resolveCapability({
      capability: capabilityId,
      ...capabilityConstraints,
    });
    devTimeEnd("Capability Resolution");

    devLog("Capability Resolved", {
      capabilityId,
      success: capabilityResult.success,
      primary: capabilityResult.resolution?.resolution?.primary,
      fallbackCount: capabilityResult.resolution?.resolution?.fallbacks?.length || 0,
      confidence: capabilityResult.resolution?.resolution?.confidence,
    });

    devTime("Provider Selection + API Call");
    let fallbackResult;
    const resolved = capabilityResult.resolution?.resolution;
    if (capabilityResult.success && resolved?.primary) {
      fallbackResult = await executeWithResolution(resolved, {
        systemPrompt: constitution || SYSTEM_PROMPT,
        context,
        userPrompt: effectivePrompt,
        schema: aiPatchSchema,
      });
    } else {
      fallbackResult = await executeWithFallback({
        systemPrompt: constitution || SYSTEM_PROMPT,
        context,
        userPrompt: effectivePrompt,
        schema: aiPatchSchema,
      });
    }
    devTimeEnd("Provider Selection + API Call");

    devLog("Provider Selected", {
      provider: fallbackResult.provider,
      success: fallbackResult.success,
      responseType: typeof fallbackResult.response,
      hasVersion: !!fallbackResult.response?.version,
      hasOperations: !!fallbackResult.response?.operations,
      operationCount: fallbackResult.response?.operations?.length || 0,
      responseKeys: fallbackResult.response ? Object.keys(fallbackResult.response) : [],
      firstOpType: fallbackResult.response?.operations?.[0]?.type || "none",
    });

    if (!fallbackResult.success) {
      return {
        success: false,
        componentTree: null,
        error: fallbackResult.error,
      };
    }

    devTime("Validation + Repair");
    const repairContext = {
      componentTree: command.componentTree,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
      strategy: strategy.strategy,
    };
    const pipelineResult = runRepairPipeline(
      fallbackResult.response,
      fallbackResult.provider,
      repairContext
    );
    devTimeEnd("Validation + Repair");

    if (IS_DEV) {
      console.log("[Pipeline] runRepairPipeline() returned:", JSON.parse(JSON.stringify(pipelineResult)));
      console.log("[Pipeline] pipelineResult keys:", Object.keys(pipelineResult));
      console.log("[Pipeline] repair diagnostics:", {
        repaired: pipelineResult.repaired || false,
        repairLevel: pipelineResult.repairLevel || null,
        repairedFields: pipelineResult.repairedFields || [],
        warnings: (pipelineResult.warnings || []).length,
      });
    }

    if (!pipelineResult.success) {
      const errSummary = (pipelineResult.errors || []).map((e) => `[${e.severity||"?"}] ${e.code||"?"}: ${e.message||""} @ ${e.path||""}`).join("\n");
      console.error("[Pipeline] Repair FAILED — all errors:\n" + errSummary);
      return {
        success: false,
        componentTree: null,
        error: {
          type: "validation",
          message: (pipelineResult.errors || [])
            .map((err) => `[${err.code}] ${err.message}`)
            .join("\n") || "AI response failed validation and repair",
        },
      };
    }

    const validation = validateResponse(pipelineResult.patchedResponse, {
      componentTree: command.componentTree,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
    });

    if (IS_DEV) {
      console.log("[Pipeline] final strict validateResponse() result:", JSON.parse(JSON.stringify(validation)));
    }

    if (!validation.success) {
      devLog("Final Validation Failed (invariant)", { errors: validation.errors });
      return {
        success: false,
        componentTree: null,
        error: {
          type: "validation",
          message: validation.errors
            .map((err) => `[${err.code}] ${err.message}`)
            .join("\n") || "Response format was invalid",
        },
      };
    }

    devTime("Completion Pass");
    const patchForCompletion = applyJsonPatch(command.componentTree, validation.patch);
    if (IS_DEV) {
      console.log("[Pipeline] completionPass() input:", JSON.parse(JSON.stringify(patchForCompletion)));
    }
    const updatedComponentTree = completionPass(patchForCompletion);
    devTimeEnd("Completion Pass");

    devLog("Completion Finished", {
      components: Object.keys(updatedComponentTree).length,
    });

    const totalEnd = performance.now();
    timings.total = totalEnd - totalStart;

    devLog("Pipeline Complete", {
      total: `${timings.total.toFixed(1)}ms`,
      provider: fallbackResult.provider,
    });

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
      intent: {
        type: intentRoute.intent,
        confidence: intentRoute.confidence,
        operations: intentRoute.operations,
        requiresVision: intentRoute.requiresVision,
        estimatedComplexity: intentRoute.estimatedComplexity,
      },
      strategy: {
        type: strategy.strategy,
        complexity: strategy.complexity,
        executionType: strategy.executionType,
        recommendedProvider: strategy.recommendedProvider,
        requiresConfirmation: strategy.requiresConfirmation,
        diagnostics: strategy.diagnostics,
      },
      capability: {
        providerMode: capability.providerMode,
        selectedProvider: capability.selectedProvider,
        recommendedProvider: capability.recommendedProvider,
        requiresProviderSwitch: capability.requiresProviderSwitch,
        requiredCapability: capability.requiredCapability,
        capabilityScore: capability.capabilityScore,
        confidence: capability.confidence,
        diagnostics: capability.diagnostics,
      },
      canvas: {
        state: canvas.canvasState,
        completenessScore: canvas.completenessScore,
        componentCount: canvas.componentCount,
        sectionTypes: canvas.sectionTypes,
        recommendedAction: canvas.recommendedAction,
        requiresConfirmation: canvas.requiresConfirmation,
        missingSections: canvas.missingSections,
        diagnostics: canvas.diagnostics,
      },
      constitution: {
        promptType,
        size,
      },
      validation: {
        score: pipelineResult.score,
        errors: (pipelineResult.errors || []).length,
        warnings: (pipelineResult.warnings || []).length,
        repairRequired: false,
        repaired: pipelineResult.repaired || false,
        repairLevel: pipelineResult.repairLevel || null,
        repairedFields: pipelineResult.repairedFields || [],
      },
      performance: timings,
    };
  } catch (error) {
    const totalEnd = performance.now();
    devLog("Pipeline Error", { error: error.message, total: `${(totalEnd - totalStart).toFixed(1)}ms` });

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
