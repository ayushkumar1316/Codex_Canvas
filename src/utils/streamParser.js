/**
 * Incremental JSON Stream Parser
 * Safely parses incomplete/partial JSON chunks from streaming APIs
 * Emits complete operations as they become available
 */

export class StreamJSONParser {
  constructor(onOperation) {
    this.buffer = "";
    this.onOperation = onOperation;
    this.depth = 0;
    this.inString = false;
    this.escapeNext = false;
  }

  /**
   * Process a chunk from the stream
   */
  processChunk(chunk) {
    this.buffer += chunk;
    this.attemptParse();
  }

  /**
   * Try to parse complete JSON objects from buffer
   */
  attemptParse() {
    let i = 0;
    let objectStart = -1;

    while (i < this.buffer.length) {
      const char = this.buffer[i];

      // Handle string state
      if (char === '"' && (i === 0 || this.buffer[i - 1] !== "\\")) {
        this.inString = !this.inString;
      }

      // Only count braces outside strings
      if (!this.inString) {
        if (char === "{") {
          if (this.depth === 0) {
            objectStart = i;
          }
          this.depth++;
        } else if (char === "}") {
          this.depth--;

          // Complete object found
          if (this.depth === 0 && objectStart !== -1) {
            try {
              const jsonStr = this.buffer.substring(
                objectStart,
                i + 1
              );
              const obj = JSON.parse(jsonStr);

              // Emit the complete operation
              this.onOperation(obj);

              // Remove processed content from buffer
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
   * Finalize parsing (called at stream end)
   */
  flush() {
    this.buffer = this.buffer.trim();
    if (this.buffer.length > 0) {
      try {
        const obj = JSON.parse(this.buffer);
        this.onOperation(obj);
      } catch (e) {
        console.error("[StreamParser] Final buffer parse failed:", e);
      }
    }
    this.buffer = "";
  }
}

/**
 * Transform a readable stream into operation events
 */
export async function parseStreamAsOperations(reader, onOperation) {
  const parser = new StreamJSONParser(onOperation);
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        parser.flush();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      parser.processChunk(chunk);
    }
  } catch (error) {
    console.error("[StreamParser] Stream reading failed:", error);
    throw error;
  }
}

/**
 * Validate an operation before emitting
 */
export function validateStreamOperation(operation) {
  if (!operation || typeof operation !== "object") {
    return { valid: false, reason: "Invalid operation object" };
  }

  const { type, targetId, parentId, node } = operation;

  if (!type) {
    return { valid: false, reason: "Missing operation type" };
  }

  const validTypes = [
    "updateProps",
    "updateStyles",
    "insertNode",
    "deleteNode",
    "replaceNode",
  ];
  if (!validTypes.includes(type)) {
    return { valid: false, reason: `Unknown operation type: ${type}` };
  }

  // Type-specific validation
  if (
    (type === "updateProps" || type === "updateStyles") &&
    !targetId
  ) {
    return { valid: false, reason: `${type} requires targetId` };
  }

  if (type === "insertNode" && !parentId) {
    return { valid: false, reason: "insertNode requires parentId" };
  }

  if (type === "deleteNode" && !targetId) {
    return { valid: false, reason: "deleteNode requires targetId" };
  }

  if (type === "replaceNode" && (!targetId || !node)) {
    return { valid: false, reason: "replaceNode requires targetId and node" };
  }

  return { valid: true };
}
