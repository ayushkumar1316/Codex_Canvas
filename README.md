<div align="center">

# Codex Canvas

### AI-Powered Visual Website Builder & Editor

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Design with anything. Refine naturally.**

Describe your idea in plain English. Codex Canvas transforms it into a polished, editable interface in seconds.

[Getting Started](#getting-started) • [Features](#features) • [How It Works](#how-it-works) • [Architecture](#architecture)

</div>

---

## About

Codex Canvas is a browser-based visual editor that turns natural language instructions into editable website components. Instead of writing code or dragging elements, you describe what you want — a hero section, a pricing table, a color change — and the AI generates structured patches that modify your canvas in real time.

The editor renders a live component tree that you can inspect, select, and refine. Every AI operation produces a deterministic JSON patch, meaning changes are predictable, reversible, and never silently overwrite your work.

**Built as a product, not a prototype.** After extensive development and testing, Codex Canvas is now a production-ready tool for designers, developers, and teams who want to build web interfaces faster.

---

## Features

### Core Editing

- **Multi-Canvas Workspace** — Create, rename, duplicate, and switch between multiple canvases in the left sidebar
- **Live Canvas** — See changes render instantly as a nested component tree
- **Component Inspector** — Select any element to view and edit its props and styles
- **Component Palette** — Drag or click to add Heading, Text, Button, Input, Textarea, Image, Card, or Container components
- **Hierarchical Tree** — Navigate parent-child relationships in the left sidebar
- **Undo / Redo** — Full history stack (snapshot-batched for rapid prop/style edits) via toolbar, `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`, and the command palette
- **Preview Modes** — Desktop, Tablet (768px), and Mobile (375px) device frame with an editor/preview mode toggle
- **Theme Switching** — Light, Dark, and System themes
- **Right-Click Menu** — Duplicate, delete, select-parent, and clipboard-style actions per component

### AI-Powered Editing

- **Natural Language Prompts** — Describe changes in plain English: "Make the heading blue" or "Add a pricing section"
- **Targeted Edits** — Select a component and the AI scopes its changes to that element
- **Page-Wide Edits** — Leave nothing selected to let the AI modify the full page
- **Voice Input** — Speak your prompt using the built-in speech recognition
- **Image Attachment** — Attach a screenshot as a reference (auto-resized/compressed client-side) for AI modifications
- **Command Palette** — `Ctrl/Cmd+K` for canvas actions, mode switching, undo/redo, and more
- **Quick-Start Templates** — SaaS, Portfolio, Dashboard, and Agency templates on the empty state

### AI Pipeline

- **Structured Output** — AI responses are validated JSON patches, not free-form text
- **Multi-Provider with Auto Fallback** — Runs Gemini, Groq, OpenRouter, and OpenAI; an Auto mode resolves the best provider/model per task (capability-aware, health-aware), with cascading fallbacks on failure
- **Response Normalization** — Handles inconsistent field names from the model gracefully (`op` → `type`, `id` → `targetId`, etc.)
- **Patch Engine** — Applies `updateProps`, `updateStyles`, `insertNode`, `deleteNode`, and `replaceNode` operations immutably
- **Repair Engine** — Recovers from malformed JSON, invalid operation types, and shape mismatches before applying
- **Design Completion Pass** — Post-edit polish that enforces contrast, spacing, sizing, layout, and visual consistency

### User Experience

- **Phase Indicators** — Animated timeline: Understanding → Planning → Applying → Success / Error
- **Provider Selector** — Inspect live provider/model health, run test connections, and view diagnostics
- **Error Recovery** — Graceful handling of API failures, validation errors, and network issues
- **Export / Import** — Export canvases to JSON, standalone HTML, or a downloadable Vite + React project (ZIP), and import canvases or full workspaces back
- **Empty State** — Clean onboarding with template suggestions and a "Create your first canvas" prompt
- **Responsive Layout** — Desktop-first editor with flexible panels

---

## How It Works

### The AI Pipeline

```
User Prompt
    |
    v
Optimizer                  Normalizes and classifies intent
    |
    v
Intent Router              Detects GENERATE / EDIT / INSERT / DELETE / STYLE intent
    |
    v
Strategy Engine            Resolves strategy + required capabilities
    |
    v
Model Resolution           Picks best provider + model (capability & health aware)
    |
    v
Context Builder            Assembles component tree, registry, selection, reference image
    |
    v
Constitution               Builds system prompt from AI rules
    |
    v
Provider Execution         Calls the selected LLM (Gemini / Groq / OpenRouter / OpenAI)
    |
    v
Validator                  Schema validation, business rules, registry checks
    |
    v
Repair Engine              Fixes malformed/invalid responses when validation fails
    |
    v
Patch Engine               Applies operations immutably to the component tree
    |
    v
Completion Pass            Design polish (contrast, spacing, sizing, layout)
    |
    v
Renderer                   React renders the updated tree to the canvas
```

### Patch Operations

The AI generates JSON patches using five operation types:

| Operation | Purpose | Example |
|-----------|---------|---------|
| `updateProps` | Change component properties | `{ type: "updateProps", targetId: "h1-01", props: { text: "New Title" } }` |
| `updateStyles` | Modify CSS styles | `{ type: "updateStyles", targetId: "btn-01", styles: { backgroundColor: "#7C3AED" } }` |
| `insertNode` | Add a new component | `{ type: "insertNode", parentId: "root", position: "end", node: { ... } }` |
| `deleteNode` | Remove a component | `{ type: "deleteNode", targetId: "card-02" }` |
| `replaceNode` | Swap one component for another | `{ type: "replaceNode", targetId: "old-01", node: { ... } }` |

---

## Architecture

```
codex-canvas/
├── public/
│   ├── favicon.svg                 # Custom SVG favicon
│   └── site.webmanifest            # PWA manifest
├── src/
│   ├── ai/                         # AI integration layer
│   │   ├── aiService.js            # Orchestrator: prompt -> resolve -> call -> validate -> repair -> patch
│   │   ├── contextBuilder.js       # Assembles context from component tree
│   │   ├── patchSchema.js          # JSON Schema for structured output
│   │   ├── systemPrompt.js         # AI Constitution v1.0
│   │   ├── validator.js            # Schema + business + registry + patch validation
│   │   ├── intentRouter/           # Intent detection & routing (intentPatterns, routingRules)
│   │   ├── capabilities/           # Capability engine (registry, resolver, router, rules)
│   │   ├── constitution/           # Rule modules: core, style, composition, generation, editing, design system, responsive, modern design
│   │   ├── models/                 # Model catalog + capability-model map (30+ free models)
│   │   ├── orchestrator/           # Multi-phase execution + diagnostics
│   │   ├── strategy/               # Strategy engine + resolver
│   │   ├── resolver/               # Capability + health model resolution
│   │   ├── health/                 # Per-model health scoring & cooldowns
│   │   ├── providerRegistry/       # Provider capability resolution & ranking
│   │   ├── providers/              # Provider adapters
│   │   │   ├── gemini.js           # Google Gemini (system instruction + vision)
│   │   │   ├── groq.js             # Groq chat completions (+ vision)
│   │   │   ├── openai.js           # OpenAI Responses API
│   │   │   └── openrouter.js       # OpenRouter chat completions
│   │   ├── providerManager.js      # Auto provider selection + fallback chains
│   │   ├── repair/                 # Repair pipeline (JSON repair, operation normalization, tree repair)
│   │   ├── optimizer/              # Prompt normalization, optimization, design-intent enrichment
│   │   ├── telemetry/              # Event analytics store
│   │   ├── canvas/                 # Canvas analysis & intelligence (completeness, sections)
│   │   ├── localValidator/         # Component + style validation rules
│   │   └── responseCache.js        # Response caching for repeat prompts
│   ├── components/
│   │   ├── ai/                     # AI UI: AIPill, AIStatus, AITimeline, ProviderSelector, CommandPalette, ThinkingIndicator, ImageAttachment, SuccessToast
│   │   ├── ui/                     # UI primitives: Button, Input, Select, Slider, ColorPicker, NumberInput, Skeleton, ThemeSelector, DevicePreview, DeleteConfirmationDialog, ComponentContextMenu
│   │   └── ErrorBoundary.jsx       # Global error boundary
│   ├── editor/                     # Editor workspace
│   │   ├── Canvas.jsx              # Live preview area (device frames, AI animations)
│   │   ├── EmptyState.jsx          # Empty canvas state + templates
│   │   ├── Header.jsx              # Top bar: canvases, undo/redo, preview, theme, export/import
│   │   ├── Layout.jsx              # Editor layout shell
│   │   ├── LeftSidebar.jsx         # Canvas list + component palette + tree
│   │   └── RightPanel.jsx          # Props/styles inspector
│   ├── hooks/                      # useTheme, useSpeechRecognition, useImageAttachment, useEditorShortcuts, useReducedMotion, useNewComponentTracker
│   ├── pages/
│   │   ├── Editor.jsx              # Editor route wrapper
│   │   └── Landing.jsx             # Marketing landing page
│   ├── registry/
│   │   └── componentRegistry.js    # Type -> Component mapping (9 types)
│   ├── renderer/
│   │   ├── Renderer.jsx            # Recursive tree renderer
│   │   └── components/             # Root, Container, Heading, Text, Button, Input, Textarea, Image, Card
│   ├── store/
│   │   └── useAppStore.js          # Zustand store with Immer + localStorage persistence
│   ├── utils/                      # jsonPatch, historyEngine, treeDiff, completionPass, colorUtils, exportEngine, importExport, imageOptimizer, initialComponentTree
│   ├── schemas/
│   │   └── componentSchema.js      # Component shape schema
│   └── lib/
│       └── utils.js                # cn() utility
├── .env.example                    # Environment variable template
├── index.html                      # HTML entry point
├── playwright.config.ts            # Playwright test configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite build configuration
└── package.json
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | UI rendering and component model |
| **Build Tool** | Vite 8 | Fast HMR and optimized builds |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **State** | Zustand + Immer | Immutable state management with persistence |
| **Routing** | React Router 7 | Client-side navigation |
| **UI Kit** | shadcn/ui style primitives (CVA) | Accessible component primitives |
| **Icons** | Lucide React | Consistent icon set |
| **AI** | Gemini, Groq, OpenRouter, OpenAI | Multi-provider LLM access with auto fallback |
| **Schema** | JSON Schema (draft 2020-12) + Zod | Patch validation |
| **Export** | JSZip + file-saver | Vite/React project ZIP export |
| **Testing** | Playwright | End-to-end browser tests |

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm
- At least one AI API key — Gemini (default), Groq, OpenRouter, or OpenAI

### Installation

```bash
git clone https://github.com/your-username/codex-canvas.git
cd codex-canvas
npm install
```

### Environment Variables

Copy the example file and add at least one API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_AI_PROVIDER=gemini

VITE_GEMINI_API_KEY=your-gemini-key-here

# Optional: Use OpenRouter instead
# VITE_AI_PROVIDER=openrouter
# VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
# VITE_OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free

# Optional: Use OpenAI directly
# VITE_AI_PROVIDER=openai
# VITE_OPENAI_API_KEY=sk-your-key-here
# VITE_OPENAI_MODEL=gpt-4o-mini

# Optional: Use Groq
# VITE_GROQ_API_KEY=gsk-your-key-here
# VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

Set `VITE_AI_PROVIDER=auto` (the default) to let Codex Canvas pick the best provider and model for each task, with automatic fallback if one provider fails.

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Testing

```bash
npx playwright install chromium
npx playwright test --headed
```

---

## Usage

### Creating a Canvas

1. On the landing page, type a description of what you want to build, or pick a quick-start template
2. Optionally attach a screenshot or use voice input
3. Click the arrow button or press Enter to generate

### Editing with AI

1. In the editor, type a command in the AI bar at the bottom
2. To edit a specific component, click it on the canvas first
3. The AI will generate a patch and apply it to your canvas

**Example prompts:**

- "Change the heading to 'Welcome Back'"
- "Make the button green with rounded corners"
- "Add three feature cards below the hero section"
- "Remove the footer"
- "Increase spacing between sections"

### Manual Editing

1. Click any component on the canvas to select it
2. Use the right panel to edit props (text, placeholder, src, alt)
3. Use the styles section to modify CSS properties (color, spacing, typography, layout)
4. Add new components from the left sidebar palette
5. Right-click a component for quick duplicate/delete/select-parent actions

---

## AI Providers

### Gemini (Default)

Uses the Google Generative AI SDK with system instructions and built-in vision support. **Default model:** `gemini-3.6-flash`.

### Groq

Fast inference via the Groq chat-completions API. **Default model:** `llama-3.3-70b-versatile`.

### OpenRouter

Provides access to many models through a single API, including free NVIDIA Nemotron and Google Gemma tiers. **Default model:** `nvidia/nemotron-3-ultra-550b-a55b:free`.

### OpenAI

Direct OpenAI API access. **Default model:** `gpt-4o-mini`.

### Auto Mode

With `VITE_AI_PROVIDER=auto` (default), the capability resolver ranks providers per task by capability coverage, speed, context window, and live health scores. If a provider fails, subsequent providers are tried in priority order with health-aware cooldowns.

---

## Validation Pipeline

Every AI response passes through a multi-stage validation and repair pipeline:

1. **Schema Validation** — Ensures the response matches the expected JSON structure
2. **Business Rules** — Validates operation types and required fields
3. **Registry Validation** — Confirms component types exist in the registry
4. **Patch Validation** — Verifies target nodes exist, checks for duplicates, and ensures tree integrity
5. **Normalization** — Handles inconsistent field names from the model (`op` -> `type`, `id` -> `targetId`, etc.) and maps legacy operation names to the five canonical types
6. **Repair Engine** — When validation fails, repairs malformed JSON, missing fields, and invalid operation/payload shapes before re-validating
7. **Completion Pass** — Applies design polish such as contrast, spacing, sizing, and layout consistency after a successful patch

---

## Roadmap

- **Cloud Persistence** — Save/load workspaces from the cloud (currently local `localStorage`)
- **History Persistence** — Persist undo/redo snapshots across sessions (currently in-memory)
- **Collaboration** — Real-time multi-user editing
- **Component Library** — Expand the registry with pre-built patterns beyond the 9 core types
- **Advanced Theme System** — Design tokens and brand-aware styling
- **Version Control** — Track changes with diff views
- **Vision E2E** — End-to-end screenshot-to-site flows with full repair coverage
- **Custom Local Models** — Support for local LLMs (Ollama, etc.)

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Acknowledgements

- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — Build tooling
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [Zustand](https://github.com/pmndrs/zustand) — State management
- [Immer](https://immerjs.github.io/immer/) — Immutable updates
- [shadcn/ui](https://ui.shadcn.com) — Component primitives
- [Lucide](https://lucide.dev) — Icons
- [Google](https://ai.google.dev) — Gemini API
- [Groq](https://groq.com) — Fast LLM inference
- [OpenRouter](https://openrouter.ai) — Multi-model AI API
- [OpenAI](https://openai.com) — GPT models
- [Playwright](https://playwright.dev) — End-to-end testing

---

<div align="center">

**Built for ideas in motion.**

</div>