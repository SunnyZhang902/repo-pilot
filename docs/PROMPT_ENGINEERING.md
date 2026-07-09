# Prompt Engineering

RepoPilot Prompt 工程方法论。本文档**不是** Prompt 模板，而是说明 RepoPilot 如何将 Prompt 开发作为**软件工程流程**来管理。

---

## Why Prompt Engineering Is Necessary

RepoPilot 的核心价值依赖 LLM 输出质量。同一模型在不同 Prompt 下表现差异巨大；若 Prompt 迭代依赖直觉或单次样例，将导致：

- 无法判断改进是否真实有效
- 无法在多个仓库、多个版本间对比
- 回归问题发现滞后，影响用户信任

**Prompt Engineering** 在此指：用 Benchmark、Issue 追踪、版本管理与 Regression 约束 Prompt 生命周期，使 AI 输出质量**可测量、可改进、可发布**。

---

## Core Philosophy

| Principle | Meaning |
|-----------|---------|
| **Benchmark First** | 任何 Prompt 变更须先在固定 Repository Suite 上评估，再讨论 Adoption |
| **Issue-driven Iteration** | 改进优先级由 [prompt-issues.md](./prompt-issues.md) 驱动，而非随机灵感 |
| **Evidence-driven Improvement** | 晋升 Stable 须有据：分数、Issue Verified、文档记录 |
| **Prompt Versioning** | 一版一 major improvement；v1 Stable、v2 Experimental 等状态明确 |
| **Regression Prevention** | 新版本不得无故降低已 Verified 维度的表现 |
| **Prompt Adoption** | 默认 Prompt 变更走 Adoption 流程（ALTER-038），非静默替换 |

**One Version → One Major Improvement** — 每次只改一件事，便于 Benchmark 归因。

---

## Architecture

```
Prompt Template (Markdown)
        ↓
Prompt Engine
        ↓
LLM
        ↓
Benchmark
        ↓
Issue Database
        ↓
Prompt Iteration
```

### Runtime: Prompt Engine

Prompt 正文与业务代码分离。`RepositorySummaryService` 调用 `PromptBuilder`，经 Engine 加载模板并注入 `RepositoryKnowledge`。

| Component | Path | Role |
|-----------|------|------|
| **Prompt Templates** | `backend/app/prompts/*.md` | Markdown 正文；版本化（v1、v2…） |
| **PromptRegistry** | `app/prompt/prompt_registry.py` | `task` + `version` → 模板文件名 |
| **PromptLoader** | `app/prompt/prompt_loader.py` | UTF-8 读取、缓存 |
| **PromptRenderer** | `app/prompt/prompt_renderer.py` | `{{PLACEHOLDER}}` 替换 |
| **PromptBuilder** | `app/prompt/prompt_builder.py` | 编排 Registry → Loader → Renderer |

配置入口：`backend/app/core/prompt_config.py`（`DEFAULT_SUMMARY_PROMPT`）。

### Quality Loop: Benchmark & Issues

| Component | Document / Path | Role |
|-----------|-----------------|------|
| **Benchmark Suite** | [benchmark/repositories.md](./benchmark/repositories.md) | 固定 10 仓库，跨版本可比 |
| **Evaluation** | [benchmark/evaluation-guide.md](./benchmark/evaluation-guide.md) | 8 维度 1–5 分 |
| **Results** | [benchmark/results/](./benchmark/results/) | 按 Prompt Version 归档 |
| **Issue Database** | [prompt-issues.md](./prompt-issues.md) | PI-XXX 跨仓库问题追踪 |

Engine 负责 **生成**；Benchmark + Issue Database 负责 **验证与驱动迭代**。二者通过 [prompt-workflow.md](./prompt-workflow.md) 衔接。

---

## Complete Lifecycle

```
Design
    ↓
Implementation
    ↓
Benchmark
    ↓
Issue Tracking
    ↓
Iteration
    ↓
Stable Release
```

| Phase | Activities | Artifacts |
|-------|------------|-----------|
| **Design** | 选定 Planned Issue；编写 prompt-vX.md；遵循 [prompt-guidelines.md](./prompt-guidelines.md) | 设计文档、ALTER |
| **Implementation** | 新增/修改 `summary_prompt_vX.md`；Registry 注册 | 模板文件、代码 PR |
| **Benchmark** | 全量或子集跑 Benchmark Suite | `results/vX/*.md` |
| **Issue Tracking** | Weaknesses → PI-XXX；Resolved → Verified | [prompt-issues.md](./prompt-issues.md) |
| **Iteration** | 未通过 Regression 则回到 Design；One major fix per version | prompt-history 更新 |
| **Stable Release** | Adoption；`DEFAULT_SUMMARY_PROMPT` 更新 | Stable 标记、用户文档 |

---

## Prompt as Software

RepoPilot 将 Prompt 视为**软件**，而非静态文本：

| Software Concept | Prompt Engineering Equivalent |
|------------------|-------------------------------|
| Source code | Markdown templates in `backend/app/prompts/` |
| Version control | Git + Prompt Version Registry + [prompt-history.md](./prompt-history.md) |
| Tests | Benchmark Suite + evaluation rubric |
| Bug tracker | [prompt-issues.md](./prompt-issues.md) |
| Release process | Regression Check → Adoption (ALTER-038) |
| Design doc | [prompt-v2.md](./prompt-v2.md), ALTER, [prompt-guidelines.md](./prompt-guidelines.md) |
| CI (planned) | ALTER-024 Benchmark Automation, ALTER-025 Regression Testing |

未来 Repository Chat、Architecture Analysis 等能力复用同一 Engine 与同一方法论，仅扩展 template task 与 evaluation rubric。

---

## Document Map

| Document | Role |
|----------|------|
| **[PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md)** | 方法论总览（本文档） |
| [prompt-workflow.md](./prompt-workflow.md) | 九阶段工作流与晋升规则 |
| [prompt-guidelines.md](./prompt-guidelines.md) | 模板设计规范 |
| [prompt-issues.md](./prompt-issues.md) | Issue Database |
| [prompt-history.md](./prompt-history.md) | 版本与 Benchmark 进度 |
| [prompt/README.md](./prompt/README.md) | 文档索引 |

---

## Related ALTER Records

- ALTER-031 — Prompt Engineering Workflow（早期流程）
- ALTER-033 — Prompt Template Library
- ALTER-036 — Prompt Engine
- ALTER-038 — Prompt v2 Adoption
- ALTER-042 — Prompt v2 Benchmark Baseline
- ALTER-043 — Prompt Issue Database
- ALTER-044 — Introduce Prompt Workflow
- ALTER-045 — Introduce Prompt Design Guidelines
- ALTER-046 — Document Prompt Engineering Methodology

Status: **Accepted** — 方法论文档化完成；Automation（ALTER-024/025）与 v2 Stable Adoption 仍属后续 Sprint。
