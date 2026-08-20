import { SYSTEM_PROMPT } from "./systemPrompt";
import { validateResponse } from "./validator";
import { buildContext } from "./contextBuilder";
import aiPatchSchema from "./patchSchema";
import { executeWithFallback, executeWithResolution } from "./providerManager";
import { optimizeImage } from "@/utils/imageOptimizer";
import { applyJsonPatchWithDiagnostics } from "@/utils/jsonPatch";
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
import { responseCache } from "./responseCache";

const DEFAULT_REGISTRY = Object.keys(componentRegistry);
const IS_DEV = import.meta.env.DEV;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

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
      context: {
        componentTree: command.componentTree,
        scope: command.selectedComponentId ? "component" : "page",
        selectedComponentId: command.selectedComponentId,
      },
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

    const cacheKey = {
      prompt: effectivePrompt,
      treeHash: hashString(JSON.stringify(command.componentTree)),
      strategy: strategy.strategy,
      intent: intentRoute.intent,
    };

    const cachedResponse = responseCache.get(
      effectivePrompt,
      command.componentTree,
      resolved?.primary?.provider || "auto"
    );

    if (cachedResponse) {
      devLog("Cache Hit", { provider: cachedResponse.provider });
      fallbackResult = cachedResponse;
    } else if (capabilityResult.success && resolved?.primary) {
      fallbackResult = await executeWithResolution(resolved, {
        systemPrompt: constitution || SYSTEM_PROMPT,
        context,
        userPrompt: effectivePrompt,
        schema: aiPatchSchema,
      });
      if (fallbackResult.success) {
        responseCache.set(
          effectivePrompt,
          command.componentTree,
          resolved?.primary?.provider || "auto",
          fallbackResult
        );
      }
    } else {
      fallbackResult = await executeWithFallback({
        systemPrompt: constitution || SYSTEM_PROMPT,
        context,
        userPrompt: effectivePrompt,
        schema: aiPatchSchema,
      });
    }
    devTimeEnd("Provider Selection + API Call");

    devLog("Provider Response Received", {
      provider: fallbackResult.provider,
      success: fallbackResult.success,
      responseKeys: fallbackResult.response ? Object.keys(fallbackResult.response) : null,
      operationsCount: fallbackResult.response?.operations?.length ?? (Array.isArray(fallbackResult.response) ? fallbackResult.response.length : 0),
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

    if (!pipelineResult.success) {
      const friendlyErrors = (pipelineResult.errors || []).map((err) => {
        if (err.kind === "patch-target-missing") return `Target not found: ${err.message}`;
        if (err.kind === "patch-parent-missing") return `Parent not found: ${err.message}`;
        if (err.kind === "response-extra-key") return `Unexpected field: ${err.message}`;
        if (err.kind === "op-type-unsupported") return `Unknown operation: ${err.message}`;
        if (err.kind === "node-type-unsupported") return `Unknown component type: ${err.message}`;
        if (err.kind === "registry-type-unregistered") return `Unregistered type: ${err.message}`;
        if (err.kind === "patch-cannot-delete-root") return `Cannot delete root`;
        if (err.kind === "patch-duplicate-update") return `Duplicate update: ${err.message}`;
        if (err.kind === "INVALID_JSON") return `Invalid JSON from AI`;
        return err.message || err.kind || "Unknown error";
      });
      return {
        success: false,
        componentTree: null,
        error: {
          type: "validation",
          message: friendlyErrors.join(" | ") || "AI response failed validation and repair",
        },
      };
    }

    console.log("[EDIT-TRACE-V2] Point 4 - before validateResponse:", pipelineResult.patchedResponse?.operations?.map(op => ({
      type: op.type,
      targetId: op.targetId,
      props: op.props,
      styles: op.styles
    })));
    const validation = validateResponse(pipelineResult.patchedResponse, {
      componentTree: command.componentTree,
      registry: command.registry ?? command.context?.registry ?? DEFAULT_REGISTRY,
      strategy: strategy.strategy,
    });
    console.log("[EDIT-TRACE-V2] Point 5 - after validateResponse:", validation?.patch?.operations?.map(op => ({
      type: op.type,
      targetId: op.targetId,
      props: op.props,
      styles: op.styles
    })));

    if (!validation.success) {
      const friendlyErrors = validation.errors.map((err) => {
        if (err.kind === "patch-target-missing") return `Target not found: ${err.message}`;
        if (err.kind === "patch-parent-missing") return `Parent not found: ${err.message}`;
        if (err.kind === "response-extra-key") return `Unexpected field: ${err.message}`;
        if (err.kind === "op-type-unsupported") return `Unknown operation: ${err.message}`;
        if (err.kind === "node-type-unsupported") return `Unknown component type: ${err.message}`;
        if (err.kind === "registry-type-unregistered") return `Unregistered type: ${err.message}`;
        if (err.kind === "patch-cannot-delete-root") return `Cannot delete root`;
        if (err.kind === "patch-duplicate-update") return `Duplicate update: ${err.message}`;
        return err.message || err.kind || "Unknown error";
      });
      return {
        success: false,
        componentTree: null,
        error: {
          type: "validation",
          message: friendlyErrors.join(" | ") || "Response format was invalid",
        },
      };
    }

    devTime("Completion Pass");
    const patchDiagnostics = applyJsonPatchWithDiagnostics(command.componentTree, validation.patch);
    const patchForCompletion = patchDiagnostics.tree;
    if (IS_DEV) {
      console.log("[Pipeline] patchDiagnostics:", {
        total: patchDiagnostics.total,
        applied: patchDiagnostics.applied,
        skippedCount: patchDiagnostics.skipped.length,
        skipped: patchDiagnostics.skipped,
      });
      console.log("[Pipeline] completionPass() input:", JSON.parse(JSON.stringify(patchForCompletion)));
    }
    const updatedComponentTree = completionPass(patchForCompletion);
    devTimeEnd("Completion Pass");

    const isFullGeneration = strategy.strategy === "FULL_GENERATION";
    const hasOperations = validation.patch.operations.length > 0;
    const allSkipped = patchDiagnostics.applied === 0 && hasOperations;
    const isEmptyTree = !updatedComponentTree?.children || updatedComponentTree.children.length === 0;

    if (allSkipped || (isFullGeneration && hasOperations && isEmptyTree)) {
      return {
        success: false,
        componentTree: null,
        error: {
          type: "patch-application",
          message: `Patch application failed: ${patchDiagnostics.skipped.length} of ${patchDiagnostics.total} operations could not be applied. ${
            patchDiagnostics.skipped[0]?.reason || "Operations targeted non-existent nodes."
          }`,
        },
      };
    }

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
      cached: !!cachedResponse,
      cacheStats: responseCache.stats(),
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
