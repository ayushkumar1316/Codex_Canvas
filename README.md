<div align="center">

# Codex Canvas

### AI-Powered Visual Website Builder & Editor

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Describe your idea in plain English. Codex Canvas transforms it into a polished, editable interface in seconds.

[Getting Started](#getting-started) | [Features](#features) | [How It Works](#ai-pipeline) | [Architecture](#architecture)

</div>

---

## About

Codex Canvas is a browser-based visual editor that turns natural language instructions into editable website components. Instead of writing code or dragging elements, you describe what you want — a hero section, a pricing table, a color change — and the AI generates structured patches that modify your canvas in real time.

The editor renders a live component tree that you can inspect, select, and refine. Every AI operation produces a deterministic JSON patch, meaning changes are predictable, reversible, and never silently overwrite your work.

---

## Features

### Core Editing

- **Live Canvas** — See changes render instantly as a nested component tree
- **Component Inspector** — Select any element to view and edit its props and styles
- **Component Palette** — Drag or click to add Heading, Text, Button, Input, Textarea, Image, Card, or Container components
- **Hierarchical Tree** — Navigate parent-child relationships in the left sidebar

### AI-Powered Editing

- **Natural Language Prompts** — Describe changes in plain English: "Make the heading blue" or "Add a pricing section"
- **Targeted Edits** — Select a component and the AI scopes its changes to that element
- **Page-Wide Edits** — Leave nothing selected to let the AI modify the full page
- **Voice Input** — Speak your prompt using the built-in speech recognition
- **Image Attachment** — Upload a screenshot to use as reference for AI modifications

### AI Pipeline

- **Structured Output** — AI responses are validated JSON patches, not free-form text
- **Response Normalization** — Handles inconsistent field names from the model gracefully
- **Patch Engine** — Applies `updateProps`, `updateStyles`, `insertNode`, `deleteNode`, and `replaceNode` operations immutably
- **Multi-Provider Support** — Works with OpenRouter and OpenAI APIs out of the box

### User Experience

- **Phase Indicators** — Real-time status: Understanding, Planning, Applying, Success, Error
- **Error Recovery** — Graceful handling of API failures, validation errors, and network issues
- **Empty State** — Clean onboarding with template suggestions and a "Create your first canvas" prompt
- **Responsive Layout** — Desktop-first editor with flexible panels

---

## Screenshots

Project screenshots will be added after the hackathon submission.

---

## How It Works

### The AI Pipeline

```
User Prompt
    |
    v
Context Builder          Assembles component tree, registry, selection state
    |
    v
OpenRouter / OpenAI      Sends prompt + context to the LLM
    |
    v
Structured JSON          Model returns a versioned patch with operations
    |
    v
Validator                Schema validation, business rules, registry checks
    |
    v
Patch Engine             Applies operations immutably to the component tree
    |
    v
Renderer                 React renders the updated tree to the canvas
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
│   │   ├── aiService.js            # Orchestrator: prompt -> API -> validate -> patch
│   │   ├── contextBuilder.js       # Assembles context from component tree
│   │   ├── patchSchema.js          # JSON Schema for structured output
│   │   ├── provider.js             # Provider abstraction
│   │   ├── systemPrompt.js         # AI Constitution v1.0
│   │   ├── validator.js            # Schema + business rule validation
│   │   └── providers/
│   │       ├── openai.js           # OpenAI Responses API provider
│   │       └── openrouter.js       # OpenRouter Chat Completions provider
│   ├── components/
│   │   ├── ai/                     # AI UI components
│   │   │   ├── AIPill.jsx          # Command bar with prompt, voice, image
│   │   │   ├── AIStatus.jsx        # Phase indicator
│   │   │   ├── AutoResizeTextarea.jsx
│   │   │   ├── ImageAttachment.jsx
│   │   │   ├── RotatingPlaceholder.jsx
│   │   │   └── ThinkingIndicator.jsx
│   │   ├── ui/                     # shadcn/ui primitives
│   │   └── ErrorBoundary.jsx       # Global error boundary
│   ├── editor/                     # Editor workspace
│   │   ├── Canvas.jsx              # Live preview area
│   │   ├── EmptyState.jsx          # Empty canvas state
│   │   ├── Header.jsx              # Top bar with logo
│   │   ├── Layout.jsx              # Editor layout shell
│   │   ├── LeftSidebar.jsx         # Component palette + tree
│   │   └── RightPanel.jsx          # Props/styles inspector
│   ├── hooks/
│   │   ├── useImageAttachment.js   # Drag/drop/paste image handling
│   │   └── useSpeechRecognition.js # Web Speech API wrapper
│   ├── pages/
│   │   ├── Editor.jsx              # Editor page
│   │   └── Landing.jsx             # Marketing landing page
│   ├── registry/
│   │   └── componentRegistry.js    # Type -> Component mapping
│   ├── renderer/
│   │   ├── Renderer.jsx            # Recursive tree renderer
│   │   └── components/             # 9 renderable component types
│   │       ├── Root.jsx
│   │       ├── Container.jsx
│   │       ├── Heading.jsx
│   │       ├── Text.jsx
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Textarea.jsx
│   │       ├── Image.jsx
│   │       └── Card.jsx
│   ├── store/
│   │   └── useAppStore.js          # Zustand store with Immer
│   ├── utils/
│   │   ├── initialComponentTree.js # Default empty canvas
│   │   └── jsonPatch.js            # Immutable patch engine
│   └── lib/
│       └── utils.js                # cn() utility
├── .env.example                    # Environment variable template
├── index.html                      # HTML entry point
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
| **State** | Zustand + Immer | Immutable state management |
| **Routing** | React Router 7 | Client-side navigation |
| **UI Kit** | shadcn/ui | Accessible component primitives |
| **Icons** | Lucide React | Consistent icon set |
| **AI** | OpenRouter / OpenAI | LLM API for structured output |
| **Schema** | JSON Schema (draft 2020-12) | Patch validation |

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm
- An OpenRouter API key (or OpenAI API key)

### Installation

```bash
git clone https://github.com/your-username/codex-canvas.git
cd codex-canvas
npm install
```

### Environment Variables

Copy the example file and add your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_AI_PROVIDER=openrouter

VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
VITE_OPENROUTER_MODEL=openai/gpt-5

# Optional: Use OpenAI directly instead
# VITE_AI_PROVIDER=openai
# VITE_OPENAI_API_KEY=sk-your-key-here
# VITE_OPENAI_MODEL=gpt-5
```

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

---

## Usage

### Creating a Canvas

1. On the landing page, type a description of what you want to build
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
3. Use the styles section to modify CSS properties
4. Add new components from the left sidebar palette

---

## AI Providers

### OpenRouter (Default)

OpenRouter provides access to multiple models through a single API. The default model is `openai/gpt-5`.

**Supported models:** Any model on OpenRouter that supports structured output or JSON mode.

### OpenAI

Direct OpenAI API access using the Responses API. Set `VITE_AI_PROVIDER=openai` to switch.

**Supported models:** `gpt-4o`, `gpt-4o-mini`, `gpt-5`, and newer models with structured output support.

---

## Validation Pipeline

Every AI response passes through a multi-stage validation pipeline:

1. **Schema Validation** — Ensures the response matches the expected JSON structure
2. **Business Rules** — Validates operation types and required fields
3. **Registry Validation** — Confirms component types exist in the registry
4. **Patch Validation** — Verifies target nodes exist, checks for duplicates, and ensures tree integrity
5. **Normalization** — Handles inconsistent field names from the model (`op` -> `type`, `id` -> `targetId`, etc.)

---

## Future Scope

- **Persistence** — Save and load canvases from local storage or a database
- **Undo/Redo** — Full history stack with immutable snapshots
- **Export** — Generate production-ready HTML, React, or Next.js code
- **Collaboration** — Real-time multi-user editing
- **Component Library** — Expand the registry with pre-built patterns
- **Theme System** — Design tokens and brand-aware styling
- **Version Control** — Track changes with diff views
- **Custom Models** — Support for local LLMs and fine-tuned models

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
- [OpenRouter](https://openrouter.ai) — Multi-model AI API
- [OpenAI](https://openai.com) — GPT models

---

<div align="center">

Built for ideas in motion.

</div>
