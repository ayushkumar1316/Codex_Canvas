# UI/UX Polish — Audit Fix Tracker

> **Date:** 2026-09-07
> **Status:** Phase 1 Complete (all Critical + High + Medium fixed)
> **Commit:** `2c47c03`

---

## Summary

Ran a full UI/UX audit on Codex Canvas. Found 42 issues across Critical/High/Medium/Low. Phase 1 addresses all Critical, High, and Medium issues in one sweep. Low items remain for future cleanup.

---

## Completed Fixes

### Critical (2/2)
| # | Issue | Fix | File |
|---|-------|-----|------|
| C1 | Command Palette hardcoded `bg-[#12121a]`, `text-zinc-*` | Replaced with theme tokens (`bg-surface-1`, `text-text-primary`, etc.) | `CommandPalette.jsx` |
| C2 | Sidebars don't collapse on mobile | LeftSidebar: `hidden md:block`, RightPanel: `hidden lg:block` | `Layout.jsx` |

### High (10/10)
| # | Issue | Fix | File |
|---|-------|-----|------|
| H1 | `aiPhase` fake setTimeout transitions | Replaced 3-phase (understanding→planning→applying) with single `"processing"` phase | `useAppStore.js` |
| H2 | Duplicate success feedback (SuccessToast + SuccessIndicator) | Removed `SuccessIndicator`, kept `SuccessToast` + `ConfidenceIndicator` | `FeedbackIndicators.jsx` |
| H3 | Provider details hardcoded `text-zinc-*` | Replaced with `text-text-muted`/`text-text-secondary` tokens | `ProviderSelector.jsx` |
| H4 | Incorrect ARIA `role="button"` on all canvas elements | Removed default `role="button"`, added meaningful `aria-label` | `Renderer.jsx` |
| H5 | InlineAIModifier doesn't track scroll | Added scroll/resize listeners with passive flags + cleanup | `InlineAIModifier.jsx` |
| H6 | Heading passes `level` as invalid DOM attribute | Destructured `level` from props, only spreads rest | `Heading.jsx` |
| H7 | `aiPhase` never resets to idle after error | Added `setTimeout → idle` auto-reset after 3s for error path | `useAppStore.js` |
| H8 | Delete button accidentally deletes globally | No change needed — was already scoped correctly in Header | `Header.jsx` |
| H9 | Streaming progress double-write flicker | Already fixed in prior commit (streaming skips repair pipeline) | `aiService.js` |
| H10 | All consumers reference old 3-phase names | Updated all 7 files to use `"processing"` | Multiple files |

### Medium (7/7)
| # | Issue | Fix | File |
|---|-------|-----|------|
| M1 | Token usage fake estimates | Removed fake `estimatedTokens`/`estimatedCost` from FeedbackIndicators | `FeedbackIndicators.jsx` |
| M2 | `alert()` in import handler | Replaced with `console.warn` + UI dismissal | `Header.jsx` |
| M3 | Error messages leak jargon (`Failed to fetch`) | Added user-friendly fallbacks for `provider_error`/`request` types | `providerManager.js` |
| M4 | Landing page context menu hardcoded dark colors | Replaced `bg-[#12121a]`, `text-zinc-*` with theme tokens | `Landing.jsx` |
| M5 | AITimeline hardcoded `text-violet-*` colors | Already using theme tokens via `activeTheme` — verified correct | `AITimeline.jsx` |
| M6 | ThinkingIndicator wrong color token | Changed `bg-violet-400` → `bg-primary`, `bg-text-muted` → `bg-border-default` | `ThinkingIndicator.jsx` |
| M7 | Inconsistent delete button dark mode | Added `dark:hover:bg-red-500/10` to both Header and Landing delete buttons | `Header.jsx`, `Landing.jsx` |

### Low (deferred)
| # | Issue | Status |
|---|-------|--------|
| L1 | `prompt()`/`confirm()` usage | Deferred — no critical user-facing impact |
| L2 | Full component tree re-render on edit | Deferred — performance optimization |
| L3 | historyEngine deep-clones entire tree | Deferred — performance optimization |
| L4 | `InteractiveTutorial` unused fields | Deferred — dead code cleanup |
| L5 | Canvas doesn't have `data-canvas-scroll` attr | InlineAIModifier scroll fallback uses window events |

---

## Files Changed (17)
- `src/components/ai/CommandPalette.jsx` — theme tokens
- `src/components/ai/AITimeline.jsx` — phase refactor
- `src/components/ai/AIPill.jsx` — phase refactor
- `src/components/ai/ChatInterface.jsx` — phase refactor
- `src/components/ai/ProviderSelector.jsx` — theme tokens + phase refactor
- `src/components/ai/ThinkingIndicator.jsx` — color tokens
- `src/components/ai/FeedbackIndicators.jsx` — remove fake estimates + duplicates
- `src/components/ai/AIStatus.jsx` — phase refactor
- `src/components/ui/InlineAIModifier.jsx` — scroll tracking + phase refactor
- `src/editor/Canvas.jsx` — phase refactor
- `src/editor/Layout.jsx` — responsive sidebars
- `src/editor/Header.jsx` — alert→console + delete styling
- `src/renderer/Renderer.jsx` — ARIA roles
- `src/renderer/components/Heading.jsx` — DOM attribute fix
- `src/store/useAppStore.js` — phase refactor + error auto-reset
- `src/ai/providerManager.js` — user-friendly errors
- `src/pages/Landing.jsx` — context menu theme tokens

---

## Next Steps (Phase 2)
1. Fix `ProviderType` enum bug — missing `GEMINI`/`GROQ` values in `modelTypes.js`
2. Add `data-canvas-scroll` attribute to Canvas for InlineAIModifier
3. Consider collapsing sidebars on tablet breakpoint
4. Performance: memoize Canvas children, lazy-load AI components
5. `prompt()`/`confirm()` → in-app modal dialogs
