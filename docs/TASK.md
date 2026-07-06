# RepoPilot Roadmap

---

# Phase 1 - Foundation ✅

## Sprint 1 - Project Initialization

- [x] GitHub repository setup
- [x] README
- [x] PRD
- [x] Project structure

## Sprint 2 - Frontend & Backend Scaffolding

- [x] Next.js frontend initialization
- [x] FastAPI backend initialization
- [x] CORS configuration

## Sprint 3 - Repository Import

- [x] Repository import API
- [x] GitHub metadata fetch (`GitHubService`)
- [x] Repository clone (`RepositoryCloneService`)
- [x] File tree parser (`RepositoryParserService`)
- [x] Frontend repository dashboard

## Sprint 4 - Knowledge Layer

- [x] `RepositoryDocument` schema
- [x] `RepositoryContext` schema
- [x] `RepositoryFileReaderService`
- [x] `ContextBuilder`
- [x] `RepositoryAnalyzer`

## Sprint 5 - AI Summary Pipeline

- [x] `PromptBuilder`
- [x] `RepositorySummaryService`
- [x] Summary API (`POST /api/repositories/summary`)
- [x] Service naming refactor (Infrastructure / Repository Business Layer)
- [x] Architecture documentation (`docs/ALTER.md`)

---

## Milestone

✅ **First Production AI Pipeline Completed**

```
GitHub Repository
        ↓
    Metadata
        ↓
Repository Clone
        ↓
Repository Parser
        ↓
 Document Reader
        ↓
Repository Context
        ↓
  Prompt Builder
        ↓
  DeepSeek LLM
        ↓
Repository Summary
```

---

# Phase 2 - Frontend Demo

## Sprint — Dashboard & Summary UI

### Completed

- [x] Dashboard Layout
- [x] Responsive Two-Column Design
- [x] AI Summary Card

### Remaining Tasks

- [ ] **Repository Tree Panel**
  - Display parsed repository tree on the left side
  - Read-only tree
  - Scrollable
  - Responsive

- [ ] **Markdown Summary Rendering**
  - Render AI summary using Markdown
  - Support headings, lists, bold text, code blocks
  - Replace plain text rendering

- [ ] **Chinese Localization**
  - Translate frontend UI into Simplified Chinese
  - Translate loading messages
  - Translate error messages

- [ ] **UX Improvements**
  - Better loading state
  - Better empty state
  - Better error state

- [ ] **End-to-End Testing**
  - Verify import pipeline
  - Verify summary pipeline
  - Verify repository tree
  - Verify markdown rendering
  - Verify responsive layout

---

## Sprint — Frontend Experience

- [x] Analysis Progress Timeline
- [x] Copy Markdown（SummaryCard）
- [x] Repository Information 完善
- [x] Repository Tree 展开 / 折叠
- [x] Repository Tree Selected 状态
- [x] Recent Repositories（LocalStorage）
- [x] Example Repositories

---

## Sprint — Frontend Polish

本 Sprint 仅优化产品体验，不新增 AI 能力。

- [ ] User-friendly error messages
- [ ] Analyze button loading & disabled state
- [ ] Summary header enhancement
- [ ] Summary metadata（Model / Prompt Version / Generation Time）
- [ ] Empty state for first-time users
- [ ] Loading skeleton for summary card
- [ ] Responsive refinement
- [ ] Dark Mode（Deferred）

---

# Phase 2.5 — Product Validation

After the core AI pipeline and frontend MVP are completed, the focus shifts from
feature development to validating repository understanding quality, prompt quality,
and overall user experience before introducing more advanced AI features.

## Sprint — Benchmark & Prompt Optimization

🚧 **In Progress**

- [x] Repository Benchmark Suite ([repositories.md](../benchmark/repositories.md))
- [x] Benchmark Template ([benchmark-template.md](../benchmark/benchmark-template.md))
- [x] Prompt History ([prompt-history.md](../prompt-history.md))
- [ ] Prompt Version Management
- [ ] Prompt Optimization v2

### Prompt Optimization Workflow

RepoPilot 后续 Prompt 的迭代流程：

```
Repository
    ↓
Generate Summary
    ↓
Benchmark Evaluation
    ↓
Identify Problems
    ↓
Improve Prompt
    ↓
Prompt Version +1
    ↓
Run Benchmark Again
```

RepoPilot 的 Prompt 优化遵循 **"Benchmark First"** 原则。

任何 Prompt 修改，都必须经过 Benchmark 验证后才能进入正式版本。

See also: [prompt-history.md](../prompt-history.md), [evaluation-guide.md](../benchmark/evaluation-guide.md), ALTER-026 (Prompt Engineering Workflow).

---

## Sprint — Repository Benchmark

**Goals:**

- Build a fixed benchmark repository list
- Cover multiple ecosystems (Python, JavaScript, Go, Rust, Java, C++, AI Frameworks, Frontend)
- Use the same repositories for every Prompt iteration
- Record summary quality and generation performance

**Deliverables:**

- `benchmark-repositories.md`
- Benchmark results

---

## Sprint — Prompt Evaluation

**Goals:**

Create a repeatable evaluation rubric.

**Metrics:**

- Project understanding
- Technology stack accuracy
- Dependency understanding
- Repository structure understanding
- Reading guide quality

Each metric uses a **0–2** score. Maximum score: **10**.

---

## Sprint — Prompt Iteration

**Goals:**

Continuously improve `PromptBuilder`.

**Roadmap:**

```
Prompt v1
    ↓
Evaluation
    ↓
Prompt v2
    ↓
Evaluation
    ↓
Prompt v3
```

**Requirement:** Every Prompt change must be benchmarked before adoption.

---

## Sprint — User Validation

**Goals:**

Collect feedback from real users.

**Suggested testers:**

- Classmates
- Developers
- Open-source contributors

**Focus:**

- Is the summary understandable?
- Is the reading guide useful?
- Does the AI correctly identify the project?

---

> Only after Product Validation is completed should new AI capabilities such as
> Chat, Architecture Analysis, and Code Review be developed.

---

# Phase 3 - Product Polish

## Sprint — Product Polish

- [ ] Project Logo
- [ ] Landing Page Polish
- [ ] Product Branding
- [ ] Animation Improvements
- [ ] Open Source Assets

---

# Phase 4 - AI Capability

## Sprint 2 - Production LLM ✅

- [x] DeepSeek Configuration
- [x] `LLMClient`
- [x] Repository Summary API
- [x] Performance Logging

## Sprint 3 - Knowledge Layer

- [ ] `RepositoryKnowledge`
- [ ] `CodeIndexer`
- [ ] README Summarization
- [ ] Prompt Optimization
- [ ] Context Cache

## Sprint 4 - Repository Chat

- [ ] Repository Q&A
- [ ] Context retrieval
- [ ] Multi-turn conversation

## Sprint 5 - Code Intelligence

- [ ] Symbol extraction
- [ ] Function & class indexing
- [ ] Entry point detection
- [ ] Symbol graph

## Sprint 6 - Architecture Analysis

- [ ] Architecture Summary
- [ ] Reading Guide
- [ ] Repository navigation

## Sprint 7 - Testing

- [ ] Unit test `RepositoryParserService`
- [ ] Unit test `RepositoryFileReaderService`
- [ ] Unit test `PromptBuilder`
- [ ] API test Summary endpoint
- [ ] Integration test AI pipeline

## Sprint 8 - Open Source Release

- [ ] Deployment
- [ ] Performance optimization
- [ ] Documentation
- [ ] Open source release
