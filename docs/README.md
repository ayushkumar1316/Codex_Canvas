# Codex Canvas - Documentation

Welcome to the comprehensive documentation for Codex Canvas V2.

---

## 📂 Documentation Structure

### 📦 [`v2-pipeline/`](./v2-pipeline/)
Core technical architecture and implementation details.

- **[`ARCHITECTURE.md`](./v2-pipeline/ARCHITECTURE.md)** - Overall system architecture
- **[`AI_Architecture_Planning.md`](./v2-pipeline/AI_Architecture_Planning.md)** - AI component planning
- **[`OPENROUTER_FIX.md`](./v2-pipeline/OPENROUTER_FIX.md)** - OpenRouter provider optimization

**Use when:** Understanding technical implementation, debugging provider issues, optimizing performance.

---

### 📋 [`planning/`](./planning/)
Roadmaps, scaling plans, and enhancement strategies.

- **[`V2_Scaling_Master_Plan.md`](./planning/V2_Scaling_Master_Plan.md)** - Master plan for V2 scaling
- **[`V2_Implementation_Roadmap.md`](./planning/V2_Implementation_Roadmap.md)** - Step-by-step implementation
- **[`Ui_enhancement_plan.md`](./planning/Ui%20enhancement%20plan.md)** - UI/UX enhancement strategy

**Use when:** Planning features, understanding project direction, scoping work.

---

### 📊 [`status/`](./status/)
Current state, launch summaries, and pipeline status.

- **[`V2_PIPELINE_STATUS.md`](./status/V2_PIPELINE_STATUS.md)** - Complete pipeline status
- **[`V2_LAUNCH_SUMMARY.md`](./status/V2_LAUNCH_SUMMARY.md)** - V2 launch summary
- **[`NOTES.md`](./status/NOTES.md)** - Development notes

**Use when:** Checking current status, understanding what's shipped, reviewing milestones.

---

### 🧪 [`testing/`](./testing/)
Test reports, guides, and validation procedures.

- **[`E2E_TEST_REPORT.md`](./testing/E2E_TEST_REPORT.md)** - 28/28 test results (100% pass)
- **[`MANUAL_TESTING_GUIDE.md`](./testing/MANUAL_TESTING_GUIDE.md)** - Step-by-step UI testing

**Use when:** Running tests, validating features, debugging issues.

---

### 📚 [`api-reference/`](./api-reference/)
API documentation and integration guides (coming soon).

**Planned:**
- Provider API reference
- Component registry docs
- Hook documentation
- Store API reference

---

## 🚀 Quick Navigation

### I want to...

**...understand the architecture**
→ [`v2-pipeline/ARCHITECTURE.md`](./v2-pipeline/ARCHITECTURE.md)

**...fix OpenRouter issues**
→ [`v2-pipeline/OPENROUTER_FIX.md`](./v2-pipeline/OPENROUTER_FIX.md)

**...see current status**
→ [`status/V2_PIPELINE_STATUS.md`](./status/V2_PIPELINE_STATUS.md)

**...run tests**
→ [`testing/MANUAL_TESTING_GUIDE.md`](./testing/MANUAL_TESTING_GUIDE.md)

**...plan new features**
→ [`planning/V2_Scaling_Master_Plan.md`](./planning/V2_Scaling_Master_Plan.md)

**...see test results**
→ [`testing/E2E_TEST_REPORT.md`](./testing/E2E_TEST_REPORT.md)

---

## 📈 Recent Updates

### 2026-09-07
- ✅ OpenRouter fast-fail optimization
- ✅ Provider priority reordered
- ✅ 28/28 E2E tests passing
- ✅ Docs organized into subfolders

### 2026-09-06
- ✅ V2 Phase 4 completed (UI/UX polish)
- ✅ V2 Phase 3 completed (Inline modifiers)
- ✅ V2 Phase 2 completed (Streaming integration)

---

## 🔗 External Links

- **Dev Server:** http://localhost:5174
- **Test Suite:** `node tests/e2e-standalone-tests.js`
- **Build Command:** `npm run build`

---

## 📝 Contributing

When adding new documentation:

1. **Technical docs** → `v2-pipeline/`
2. **Roadmaps/plans** → `planning/`
3. **Status updates** → `status/`
4. **Testing docs** → `testing/`
5. **API docs** → `api-reference/`

Keep this README updated with new files.

---

**Last Updated:** 2026-09-07T09:40:00Z  
**Maintainer:** Development Team
