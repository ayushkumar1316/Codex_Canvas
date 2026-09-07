# Codex Canvas — Architecture Guide

> **Quick reference**: Confused about where something lives or how it works? Start here.

---

## Table of Contents

1. [What is Codex Canvas?](#what-is-codex-canvas)
2. [Tech Stack](#tech-stack)
3. [Folder Overview](#folder-overview)
4. [Detailed Folder Guide](#detailed-folder-guide)
5. [Data Flow](#data-flow)
6. [AI Pipeline](#ai-pipeline)
7. [Quick File Finder](#quick-file-finder)

---

## What is Codex Canvas?

An **AI-powered visual builder & editor** — you describe what you want, and AI generates/edits UI components on a canvas. Think "Figma meets ChatGPT."

**Example**: Type "Create a modern portfolio" → AI generates the full layout on canvas.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React** | UI framework |
| **Vite** | Build tool (fast dev server) |
| **Zustand** | State management |
| **TailwindCSS** | Styling |
| **Zod** | Schema validation |
| **Lucide Icons** | Icon set |

---

## Folder Overview

```
codex_canvas/
├── docs/                   ← You are here
├── public/                 ← Static assets (favicon, manifest)
├── src/                    ← All source code
│   ├── ai/                 ← 🧠 AI Brain
│   ├── components/         ← 🎨 UI Components
│   ├── editor/             ← 🖼️ Canvas Editor
│   ├── renderer/           ← 🔧 Component Renderer
│   ├── store/              ← 📦 Global State
│   ├── hooks/              ← ⚡ Reusable Logic
│   ├── registry/           ← 📋 Component Registry
│   ├── schemas/            ← ✅ Validation Schemas
│   ├── config/             ← ⚙️ Configuration
│   ├── lib/                🔧 Shared Utilities
│   ├── utils/              🔧 Specific Utilities
│   └── pages/              📄 Page Components
├── prompts/                ← Development prompts
├── dist/                   ← Build output (auto-generated)
└── node_modules/           ← Dependencies (auto-installed)
```

---

## Detailed Folder Guide

### `src/pages/` — Page Screens

> **Purpose**: Top-level screens users navigate between.

| File | What It Does |
|---|---|
| `Landing.jsx` | Home/landing page |
| `Editor.jsx` | The main canvas editor page |

---

### `src/components/` — Reusable UI

> **Purpose**: Building blocks used across the app.

#### `components/ai/` — AI Interface

| File | What It Does |
|---|---|
| `AIStatus.jsx` | Shows "Gemini · Thinking..." status |
| `ProviderSelector.jsx` | Dropdown to pick AI provider (Gemini/Groq/OpenAI/OpenRouter) |
| `CommandPalette.jsx` | The AI chat input box |
| `ImageAttachment.jsx` | Upload images for AI reference |
| `ThinkingIndicator.jsx` | Loading dots animation |
| `AITimeline.jsx` | Shows AI action history |
| `AIPill.jsx` | Small AI indicator badge |
| `AutoResizeTextarea.jsx` | Growing text input |
| `RotatingPlaceholder.jsx` | Animated placeholder text |
| `SuccessToast.jsx` | Success notification |

#### `components/ui/` — Basic UI Primitives

| File | What It Does |
|---|---|
| `button.jsx` | Button component |
| `input.jsx` | Input field component |
| `ComponentContextMenu.jsx` | Right-click menu for components |
| `DeleteConfirmationDialog.jsx` | "Are you sure?" delete dialog |

---

### `src/editor/` — Canvas Editor

> **Purpose**: The visual editing workspace.

| File | What It Does |
|---|---|
| `Canvas.jsx` | The main canvas area (where components appear) |
| `Layout.jsx` | Editor page layout structure |
| `Header.jsx` | Top toolbar with actions |
| `LeftSidebar.jsx` | Left panel (component library) |
| `RightPanel.jsx` | Right panel (properties/settings) |
| `EmptyState.jsx` | Placeholder when canvas is empty |

---

### `src/renderer/` — Component Renderer

> **Purpose**: Takes component data and renders it visually on canvas.

| File | What It Does |
|---|---|
| `Renderer.jsx` | Main renderer logic |
| `components/Button.jsx` | Renders a Button on canvas |
| `components/Card.jsx` | Renders a Card on canvas |
| `components/Container.jsx` | Renders a Container on canvas |
| `components/Heading.jsx` | Renders a Heading on canvas |
| `components/Image.jsx` | Renders an Image on canvas |
| `components/Input.jsx` | Renders an Input on canvas |
| `components/Text.jsx` | Renders Text on canvas |
| `components/Textarea.jsx` | Renders a Textarea on canvas |
| `components/Root.jsx` | Renders the root container |

---

### `src/ai/` — AI Brain

> **Purpose**: All AI logic — from receiving user input to getting AI response.

#### Core Files

| File | What It Does |
|---|---|
| `aiService.js` | **Orchestrator** — runs the entire AI pipeline |
| `systemPrompt.js` | The master instructions sent to AI |
| `contextBuilder.js` | Gathers canvas state into AI-readable context |
| `validator.js` | Validates AI response format |
| `patchSchema.js` | Defines JSON patch structure |
| `providerManager.js` | Manages providers, fallback, health checks |

#### `ai/providers/` — AI Provider APIs

| File | What It Does |
|---|---|
| `gemini.js` | Google Gemini API integration |
| `groq.js` | Groq API integration |
| `openai.js` | OpenAI API integration |
| `openrouter.js` | OpenRouter API integration |

#### `ai/optimizer/` — Prompt Optimizer (Phase 6.0)

> **Purpose**: Cleans and improves user prompts before sending to AI.

| File | What It Does |
|---|---|
| `promptOptimizer.js` | Main optimizer — expands vague prompts |
| `promptNormalizer.js` | Trims whitespace, fixes punctuation, removes duplicates |
| `optimizationRules.js` | Rules for type detection, expansion, complexity |

#### `ai/router/` — Intent Router (Phase 6.1)

> **Purpose**: Determines what the user actually wants (generate/edit/delete/etc).

| File | What It Does |
|---|---|
| `intentRouter.js` | Main router — creates intent routes |
| `intentPatterns.js` | Pattern definitions for each intent |
| `routingRules.js` | Deterministic routing logic |

#### `ai/providerRegistry/` — Provider Registry (Phase 6.2)

> **Purpose**: Single source of truth for all provider metadata.

| File | What It Does |
|---|---|
| `providerRegistry.js` | All provider data (name, models, capabilities, colors) |
| `capabilityResolver.js` | Recommends best provider for a task |

---

### `src/store/` — Global State

> **Purpose**: App-wide state using Zustand.

| File | What It Does |
|---|---|
| `useAppStore.js` | All app state: components, selection, AI state, settings + actions |

---

### `src/hooks/` — Custom Hooks

> **Purpose**: Reusable React logic.

| File | What It Does |
|---|---|
| `useImageAttachment.js` | Image upload & management |
| `useSpeechRecognition.js` | Voice input (Web Speech API) |
| `useUndoRedoShortcuts.js` | Ctrl+Z / Ctrl+Y keyboard shortcuts |
| `useReducedMotion.js` | Respects user's motion preference |
| `useNewComponentTracker.js` | Tracks newly added components |

---

### `src/registry/` — Component Registry

> **Purpose**: Maps component types to their implementations.

| File | What It Does |
|---|---|
| `componentRegistry.js` | Registry of all available component types |

---

### `src/schemas/` — Validation

> **Purpose**: Data shape definitions.

| File | What It Does |
|---|---|
| `componentSchema.js` | Defines what a valid component looks like |

---

### `src/config/` — Configuration

> **Purpose**: App configuration.

| File | What It Does |
|---|---|
| `providerTheme.js` | Provider theming (wraps providerRegistry) |

---

### `src/utils/` — Utilities

| File | What It Does |
|---|---|
| `colorUtils.js` | Color manipulation helpers |
| `exportEngine.js` | Export canvas as code/image |
| `historyEngine.js` | Undo/redo history management |
| `imageOptimizer.js` | Compress/resize images |
| `jsonPatch.js` | JSON Patch operations |
| `completionPass.js` | Fill missing component props |
| `initialComponentTree.js` | Default starting components |

---

### `src/lib/` — Shared Utilities

| File | What It Does |
|---|---|
| `utils.js` | General helper functions |

---

## Data Flow

### Full Pipeline (User → AI → Canvas)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER TYPES INPUT                         │
│                    "Make the header blue"                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. COMMAND PALETTE (components/ai/CommandPalette.jsx)          │
│     → Captures user input                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. APP STORE (store/useAppStore.js)                            │
│     → Saves command, sets aiLoading = true                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. AI SERVICE (ai/aiService.js) — Orchestrator                 │
│     → Runs the full pipeline                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 4a. OPTIMIZER    │ │ 4b. ROUTER       │ │ 4c. PROVIDER     │
│    (ai/optimizer)│ │    (ai/router)   │ │    REGISTRY      │
│                  │ │                  │ │    (ai/provider  │
│ "make header     │ │ intent: "edit"   │ │     Registry)    │
│  blue"           │ │ confidence: high │ │                  │
│      ↓           │ │ operations:      │ │ Best: Gemini     │
│ "Change the      │ │  [modify_styles] │ │ (fastest +       │
│  header color    │ │                  │ │  has vision)     │
│  to blue."       │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. CONTEXT BUILDER (ai/contextBuilder.js)                      │
│     → Gathers: canvas state + selected component + intent       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. PROVIDER MANAGER (ai/providerManager.js)                    │
│     → Picks provider, handles fallback if one fails             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. AI PROVIDER (ai/providers/gemini.js)                        │
│     → Makes the actual API call                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. VALIDATOR (ai/validator.js)                                 │
│     → Validates AI response format                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. JSON PATCH (utils/jsonPatch.js)                             │
│     → Applies AI changes to component tree                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  10. RENDERER (renderer/Renderer.jsx)                           │
│      → Updates canvas with new component tree                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Pipeline

### Phase 6.0 — Prompt Optimizer

```
"make it modern"
      │
      ▼
┌─────────────────────────────┐
│ 1. Normalize                │  Trim, fix punctuation, remove duplicates
│ 2. Detect type              │  → "style"
│ 3. Expand vague prompts     │  → "Improve spacing, typography..."
│ 4. Calculate complexity     │  → "simple"
└─────────────────────────────┘
      │
      ▼
Optimized prompt: "Improve the existing design using modern SaaS design principles..."
```

### Phase 6.1 — Intent Router

```
Optimized prompt
      │
      ▼
┌─────────────────────────────┐
│ → intent: "style"           │
│ → confidence: "high"        │
│ → operations: [modify_styles, update_theme] │
│ → requiresVision: false     │
│ → requiresExistingCanvas: true │
└─────────────────────────────┘
```

### Phase 6.2 — Provider Registry

```
Intent: "style"
      │
      ▼
┌─────────────────────────────┐
│ Score each provider:        │
│ • Gemini: 85 (fast + vision)│
│ • Groq:   60 (fastest)      │
│ • OpenAI: 75 (premium)      │
│ • OpenRouter: 65 (variety)  │
└─────────────────────────────┘
      │
      ▼
Winner: Gemini (highest score)
```

---

## Quick File Finder

| I want to... | Go to... |
|---|---|
| Change how the app looks | `src/App.jsx`, `src/index.css` |
| Add a new page | `src/pages/` |
| Add a new UI component | `src/components/` |
| Change canvas behavior | `src/editor/Canvas.jsx` |
| Add a new component type | `src/renderer/components/` |
| Change AI instructions | `src/ai/systemPrompt.js` |
| Add a new AI provider | `src/ai/providers/` + `src/ai/providerRegistry/` |
| Change prompt optimization | `src/ai/optimizer/` |
| Change intent detection | `src/ai/router/` |
| Change provider metadata | `src/ai/providerRegistry/providerRegistry.js` |
| Change app state/actions | `src/store/useAppStore.js` |
| Add a new hook | `src/hooks/` |
| Change export logic | `src/utils/exportEngine.js` |
| Change undo/redo | `src/utils/historyEngine.js` |
| Change component types | `src/registry/componentRegistry.js` |

---

## Restaurant Analogy

| Layer | Analogy | Folder |
|---|---|---|
| Dining room | What customer sees | `pages/` |
| Menu & tableware | UI components | `components/` |
| Kitchen layout | Editor workspace | `editor/` |
| Plating | Visual rendering | `renderer/` |
| Chef's brain | AI logic | `ai/` |
| Recipe refinement | Prompt optimizer | `ai/optimizer/` |
| Order routing | Intent router | `ai/router/` |
| Ingredient suppliers | Provider registry | `ai/providerRegistry/` |
| Order tickets | State management | `store/` |
| Kitchen tools | Custom hooks | `hooks/` |
| Prep tools | Utilities | `utils/`, `lib/` |

---

## Glossary

| Term | Meaning |
|---|---|
| **Canvas** | The visual editing area where components live |
| **Component** | A UI element (Button, Card, Heading, etc.) |
| **Provider** | An AI service (Gemini, Groq, OpenAI, OpenRouter) |
| **Intent** | What the user wants to do (generate, edit, delete, etc.) |
| **Context** | The current canvas state sent to AI |
| **Patch** | A JSON diff describing what to change |
| **Fallback** | Auto-switch to another provider if one fails |

---

> **Tip**: When adding a new AI provider, you only need to:
> 1. Add a file in `src/ai/providers/`
> 2. Add an entry in `src/ai/providerRegistry/providerRegistry.js`
> 3. Add import + mapping in `src/ai/providerManager.js`
>
> The UI will automatically pick it up — no changes needed in components.
