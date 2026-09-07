import { validateStreamOperation } from "@/utils/streamParser";
import { applyJsonPatchWithDiagnostics } from "@/utils/jsonPatch";
import { completionPass } from "@/utils/completionPass";

/**
 * Progressive streaming handler for AI responses
 * Parses operations as they arrive and applies them immediately
 */
export class ProgressiveStreamHandler {
  constructor(initialTree, onProgressUpdate) {
    this.currentTree = JSON.parse(JSON.stringify(initialTree));
    this.onProgressUpdate = onProgressUpdate;
    this.operations = [];
    this.appliedCount = 0;
    this.buffer = "";
    this.operationBuffer = [];
  }

  /**
   * Process a chunk from the stream
   */
  processChunk(chunk) {
    this.buffer += chunk;
    this.attemptParseOperations();
  }

  /**
   * Try to parse and apply operations from buffer
   */
  attemptParseOperations() {
    let i = 0;
    let objectStart = -1;
    let inString = false;
    let depth = 0;

    while (i < this.buffer.length) {
      const char = this.buffer[i];

      // Handle string state
      if (char === '"' && (i === 0 || this.buffer[i - 1] !== "\\")) {
        inString = !inString;
      }

      // Only count braces outside strings
      if (!inString) {
        if (char === "{") {
          if (depth === 0) {
            objectStart = i;
          }
          depth++;
        } else if (char === "}") {
          depth--;

          // Complete object found
          if (depth === 0 && objectStart !== -1) {
            try {
              const jsonStr = this.buffer.substring(objectStart, i + 1);
              const obj = JSON.parse(jsonStr);

              // Validate and apply the operation immediately
              if (this.isValidOperation(obj)) {
                this.applyOperation(obj);
              }

              // Remove processed content
              this.buffer = this.buffer.substring(i + 1).trim();
              i = 0;
              objectStart = -1;
              continue;
            } catch {
              // Incomplete JSON, wait for more data
              break;
            }
          }
        }
      }

      i++;
    }
  }

  /**
   * Check if an object is a valid operation
   */
  isValidOperation(obj) {
    if (!obj || typeof obj !== "object") return false;

    const { type } = obj;
    if (!type) return false;

    const validTypes = [
      "updateProps",
      "updateStyles",
      "insertNode",
      "deleteNode",
      "replaceNode",
    ];

    return validTypes.includes(type);
  }

  /**
   * Apply a single operation to the current tree
   */
  applyOperation(operation) {
    try {
      const validation = validateStreamOperation(operation);
      if (!validation.valid) {
        console.warn("[Streaming] Skipped invalid operation:", validation.reason);
        return;
      }

      // Create a patch with single operation
      const patch = {
        operations: [operation],
      };

      // Apply the patch
      const diagnostics = applyJsonPatchWithDiagnostics(
        this.currentTree,
        patch
      );

      if (diagnostics.applied > 0) {
        this.currentTree = diagnostics.tree;
        this.appliedCount++;
        this.operations.push(operation);

        // Run completion pass for visual polish
        const polished = completionPass(this.currentTree);

        // Notify UI of progress
        this.onProgressUpdate({
          tree: polished,
          operationCount: this.appliedCount,
          totalOperations: null, // Unknown until stream ends
          status: "streaming",
          lastOperation: operation,
        });

        console.log(
          `[Streaming] Applied operation ${this.appliedCount}:`,
          operation.type
        );
      } else {
        console.warn("[Streaming] Operation failed to apply:", operation);
      }
    } catch (error) {
      console.error("[Streaming] Error applying operation:", error, operation);
    }
  }

  /**
   * Finalize streaming (called at stream end)
   */
  finalize() {
    this.buffer = this.buffer.trim();

    // Try to parse any remaining partial content
    if (this.buffer.length > 0) {
      try {
        const obj = JSON.parse(this.buffer);
        if (this.isValidOperation(obj)) {
          this.applyOperation(obj);
        }
      } catch (e) {
        console.error("[Streaming] Final buffer parse failed:", e);
      }
    }

    // Final update
    this.onProgressUpdate({
      tree: this.currentTree,
      operationCount: this.appliedCount,
      totalOperations: this.appliedCount,
      status: "complete",
      lastOperation: this.operations[this.operations.length - 1] || null,
    });

    return {
      tree: this.currentTree,
      operations: this.operations,
      operationCount: this.appliedCount,
    };
  }
}

/**
 * Execute streaming API call with progressive updates
 */
export async function executeStreamingCall(
  provider,
  config,
  onProgressUpdate
) {
  const { systemPrompt, context, userPrompt, schema, model } = config;

  const handler = new ProgressiveStreamHandler(
    context.componentTree,
    onProgressUpdate
  );

  try {
    // Call provider's executeStream method
    await provider.executeStream({
      systemPrompt,
      context,
      userPrompt,
      schema,
      model,
      onOperation: (operation) => {
        // Handle both delta chunks and complete operations
        if (operation.type === "delta" && operation.chunk) {
          handler.processChunk(operation.chunk);
        } else if (operation.type) {
          handler.applyOperation(operation);
        }
      },
    });

    // Finalize and return result
    const result = handler.finalize();
    return {
      success: true,
      componentTree: result.tree,
      operations: result.operations,
      operationCount: result.operationCount,
    };
  } catch (error) {
    console.error("[Streaming] Stream execution failed:", error);
    return {
      success: false,
      error: {
        type: "streaming",
        message: error.message || "Streaming failed",
      },
      componentTree: handler.currentTree,
      operationCount: handler.appliedCount,
    };
  }
}
