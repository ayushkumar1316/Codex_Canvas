# V2 Scaling Master Plan: Project "Lovable / v0 Equivalent"

## 1. Executive Summary & Vision
Codex Canvas V1 has established a reliable, hallucination-free Abstract Syntax Tree (AST) patching engine using semantic mapping (`type_randomID`). However, to transition from a rigid component generator to an ultra-fluid, conversational "Lovable / v0-level" AI web editor, the architecture must evolve. 

V2 focuses on **conversational intuition, real-time feedback, and granular control**. The user should be able to speak naturally (*"make that hero section dark and add a pricing table"*), watch the UI render progressively like a live stream, and inject targeted components with pinpoint accuracy.

---

## 2. What We Are Scaling

| Capability | Current V1 State | Target V2 State (Lovable / v0 Level) |
| :--- | :--- | :--- |
| **Generation Speed & UX** | Latency heavily reliant on full JSON generation completion (20-30s wait). Skeleton loaders. | **Progressive Rendering & Streaming:** Sub-second TTFB. UI elements pop onto the canvas piece-by-piece as the JSON stream is decoded in real-time. |
| **Context & Memory** | Stateless API calls. The AI lacks awareness of previous turns or conversational context. | **Agentic Session Graph:** AI remembers complete chat history, understanding conversational references (e.g., "make *it* bigger" implies the component modified in the previous turn). |
| **Editing Control** | Generates/replaces large blocks of the AST tree at once via `replaceNode`. | **Granular Sub-Tree Slicing:** Point-and-click selection editing. Token usage drops 80% because we only send the selected subtree to the LLM. |
| **System Resiliency** | Repair engine catches invalid JSON strings post-generation. | **Streaming JSON Repair:** On-the-fly syntax correction during streaming chunks using buffer parsing (e.g., closing open brackets temporarily to render). |

---

## 3. The Technical Approach

### Approach A: Live Streamed Rendering (v0 Style)
Instead of waiting for `fallbackResult = await executeWithResolution(...)` to finish the entire API response block, we will switch our API adaptors (Groq/Gemini/OpenAI) to standard server-sent events (`stream: true`).
- **Streaming JSON Decoder:** We will implement an incremental JSON parser (like `flexible-json` or a custom stream buffer in `src/ai/streamParser.js`) that safely parses incomplete JSON chunks.
- **Progressive Patch Application:** As new objects complete in the stream, they get flushed to Zustand (`useAppStore.js`) immediately, triggering instant React re-renders so the user sees the page "typing" itself onto the Canvas.

### Approach B: Agentic Memory & Chat History
The AI needs to converse like an engineer pair-programming with the user.
- **Chat History State:** Introduce a `src/store/useChatStore.js` to persist messages (`role: user | assistant`).
- **Context Combiner:** Update `src/ai/contextBuilder.js` to prepend the past 3-4 conversational turns. 
- **Contextual Intent Routing:** Modify `src/ai/router.js` to analyze pronouns (like "this", "it", "them"). If the system detects cross-turn referencing, it looks up the last targeted node ID in the state graph.

### Approach C: Granular Element Control (Point & Click Modifiers)
We will transition from whole-page generations to hyper-targeted AST modifications to save LLM tokens and maximize speed/precision.
- **Sub-Tree Slicing:** When a user clicks a button and says "make this wider", the UI captures the ID (`button_1234_abc`). Instead of sending the 500-node `componentTree` to the LLM, `aiService.js` will slice the exact AST branch for `button_1234_abc` and send only that branch.
- **Targeted Patch Bounds:** The AI System Prompt will restrict the patch target to `targetId: "button_1234_abc"`, enforcing complete isolation and preventing unintended style bleeding across the canvas.
- **UI Magic (Pill / Context):** Integrating floating, inline AI input pills directly on top of selected DOM elements.

---

## 4. Implementation Phasing

### Phase 1: Foundation (Agentic Memory & Isolation)
*Focus: Expanding the AI's brain.*
1. **Module:** Create `useChatStore` for conversational persistence.
2. **Module:** Implement Sub-Tree Slicing in `contextBuilder.js` to minimize token overhead on targeted edits.
3. **Module:** Refine `intentRouter` to map chat history context to specific actions.

### Phase 2: Live Engine (Streaming & Progressive Render)
*Focus: Expanding the UX.*
1. **Module:** Update `providerManager.js` adaptors to request and handle `stream: true`.
2. **Module:** Inject a new parser pipeline `src/utils/streamParser.js` that can safely stringify and parse half-complete AST structures.
3. **Module:** Route streamed payloads safely into `useAppStore` mutations to flush UI frames continuously.

### Phase 3: The "Lovable" UX Shift (Action Tooling)
*Focus: Expanding user interaction.*
1. **Module:** Floating inline element modifier widget (`<ComponentContextMenu />` -> `<InlineAIModifier />`).
2. **Module:** Interactive diffs—allowing users to hit "Undo/Redo" quickly across conversational generation boundaries without losing tree integrity.

---
*Prepared for the Codex Canvas V2 Scale Up Initiative.*