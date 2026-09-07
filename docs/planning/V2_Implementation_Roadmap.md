# V2 Implementation Roadmap

## Overview
V2 will transform Codex Canvas from a reliable AI web generator into a **Lovable/v0-level conversational web builder** with real-time streaming, agentic memory, and granular control.

---

## Phase 1: Agentic Memory & Sub-Tree Slicing (Week 1-2)

### 1.1 Chat History Store
**File:** `src/store/useChatStore.js` (new)
```javascript
// Zustand store for conversational memory
// Structure:
// - messages: Array<{id, role, content, timestamp, metadata}>
// - lastTargetedNode: string | null (tracks pronoun references)
```

**Tasks:**
- [ ] Create `useChatStore` with message persistence
- [ ] Add conversation turn tracking
- [ ] Implement `lastTargetedNode` state for pronoun resolution

### 1.2 Context Builder Enhancement
**File:** `src/ai/contextBuilder.js`
```javascript
// Prepend chat history to AI context
// Add selected component subtree context
// Track conversation flow for intent routing
```

**Tasks:**
- [ ] Add `chatHistory` to context payload
- [ ] Implement sub-tree slicing for selected components
- [ ] Optimize token usage by sending minimal context

### 1.3 Intent Router Upgrade
**File:** `src/ai/router/intentRouter.js`
```javascript
// Detect pronoun references ("it", "this", "that")
// Resolve to last targeted node ID
// Support multi-turn conversation patterns
```

**Tasks:**
- [ ] Add pronoun detection logic
- [ ] Map pronouns to `lastTargetedNode`
- [ ] Test conversational edit flows

---

## Phase 2: Live Streamed Rendering (Week 3-4)

### 2.1 Provider Streaming Support
**Files:** `src/ai/providers/*.js`
```javascript
// Enable stream: true in API calls
// Handle SSE (Server-Sent Events) responses
```

**Tasks:**
- [ ] Update Groq adapter for streaming
- [ ] Update Gemini adapter for streaming
- [ ] Update OpenRouter adapter for streaming
- [ ] Test streaming endpoints

### 2.2 Stream Parser
**File:** `src/utils/streamParser.js` (new)
```javascript
// Incremental JSON parser for partial streams
// Buffer incomplete chunks
// Safely parse and emit complete operations
```

**Tasks:**
- [ ] Implement chunk buffering
- [ ] Handle incomplete JSON structures
- [ ] Emit valid JSON operations progressively

### 2.3 Progressive Patch Application
**File:** `src/store/useAppStore.js`
```javascript
// Apply patches as they arrive from stream
// Trigger React re-renders incrementally
```

**Tasks:**
- [ ] Modify `submitAICommand` to handle streams
- [ ] Apply operations as they parse
- [ ] Visual feedback during streaming

---

## Phase 3: Granular Element Control (Week 5-6)

### 3.1 Inline AI Modifier
**File:** `src/components/ui/InlineAIModifier.jsx` (new)
```javascript
// Floating widget on selected component
// Quick AI prompt input for targeted edits
```

**Tasks:**
- [ ] Create floating position logic
- [ ] Add prompt input with suggestions
- [ ] Wire to sub-tree slicing pipeline

### 3.2 Visual Selection Feedback
**File:** `src/editor/Canvas.jsx`
```javascript
// Highlight selected component
// Show quick action toolbar
// Indicate AI editing state
```

**Tasks:**
- [ ] Enhanced selection visuals
- [ ] Quick action buttons (edit, duplicate, delete)
- [ ] AI edit mode indicator

---

## Phase 4: UI/UX Polish (Week 7-8)

### 4.1 Conversational UI
**File:** `src/components/ai/ChatInterface.jsx` (new)
```javascript
// ChatGPT-style conversation view
// Message bubbles with streaming text
// Code preview cards
```

**Tasks:**
- [ ] Design chat bubble layout
- [ ] Implement streaming text animation
- [ ] Add code preview components

### 4.2 Progress & Feedback
**Files:** `src/components/ai/*`
```javascript
// Token usage indicator
// Confidence badges
// Progress bars for generation
```

**Tasks:**
- [ ] Token counter component
- [ ] Confidence indicator
- [ ] Progress visualization

### 4.3 Onboarding Flow
**File:** `src/components/onboarding/*` (new)
```javascript
// Interactive tutorial
// Prompt library
// Feature highlights
```

**Tasks:**
- [ ] First-time user flow
- [ ] Prompt suggestions
- [ ] Feature discovery tour

---

## Testing & Validation

### Unit Tests
- [ ] Chat store operations
- [ ] Stream parser edge cases
- [ ] Sub-tree slicing logic
- [ ] Pronoun resolution

### E2E Tests
- [ ] Multi-turn conversation flow
- [ ] Streaming generation
- [ ] Targeted edit operations
- [ ] UI interaction patterns

### Performance Benchmarks
- [ ] Token usage comparison (V1 vs V2)
- [ ] Time to first render (TTFB)
- [ ] Patch application latency
- [ ] Memory footprint

---

## Success Metrics

| Metric | V1 Baseline | V2 Target |
|--------|-------------|-----------|
| TTFB (Time to First Byte) | 15-20s | < 1s |
| Edit Latency | 20-30s | 2-4s |
| Token Usage (Targeted Edit) | ~3000 | ~500 |
| Conversational Turns | 1 | Unlimited |
| User Satisfaction (NPS) | - | > 50 |

---

## Launch Checklist

- [ ] All Phase 1-4 features implemented
- [ ] Tests passing (>90% coverage)
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] UI/UX review completed
- [ ] Beta testing with real users
- [ ] Production deployment ready

---

*Last Updated: 2026-09-07*
