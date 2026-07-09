# Prompt Documentation

RepoPilot Prompt 工程相关文档索引。

Prompt 迭代遵循 **Benchmark First**、**Issue-driven Iteration** 与 **One Version → One Major Improvement** 原则。设计、评估、问题追踪与方法论分文档维护，避免混在同一文件中。

**入口文档：** [PROMPT_ENGINEERING.md](../PROMPT_ENGINEERING.md)

---

## Core Methodology Documents

| Document | Purpose |
|----------|---------|
| **[PROMPT_ENGINEERING.md](../PROMPT_ENGINEERING.md)** | Prompt 工程方法论总览 — 哲学、架构、生命周期 |
| **[prompt-workflow.md](../prompt-workflow.md)** | 九阶段工作流 — Benchmark → Issue → Design → Adoption |
| **[prompt-guidelines.md](../prompt-guidelines.md)** | 通用 Prompt 设计规范 — 适用于 Summary 及未来 AI 能力 |

---

## Core Documents

| Document | Purpose |
|----------|---------|
| [prompt-history.md](../prompt-history.md) | Prompt 版本演进、Runtime 阶段、Benchmark 进度 |
| [prompt-v2.md](../prompt-v2.md) | Prompt v2（AI Onboarding Guide）设计说明 |
| **[prompt-issues.md](../prompt-issues.md)** | **Prompt Issue Database — 跨仓库共性问题追踪** |

---

## Benchmark & Evaluation

| Document | Purpose |
|----------|---------|
| [benchmark/README.md](../benchmark/README.md) | Benchmark 框架与工作流 |
| [benchmark/repositories.md](../benchmark/repositories.md) | 固定 Benchmark 仓库列表 |
| [benchmark/evaluation-guide.md](../benchmark/evaluation-guide.md) | 评分标准（1–5） |
| [benchmark/results/](../benchmark/results/) | 各 Prompt Version 的 Benchmark 输出 |

---

## Workflow

```
Repository Benchmark
        ↓
Benchmark Report
        ↓
Prompt Issue Database
        ↓
Issue Prioritization → Prompt Design → Implementation
        ↓
Prompt Benchmark → Regression Check → Adoption
```

详见 [prompt-workflow.md](../prompt-workflow.md)。

---

## Related ALTER Records

- ALTER-031 — Prompt Engineering Workflow
- ALTER-033 — Prompt Template Library
- ALTER-036 — Prompt Engine
- ALTER-038 — Prompt v2 Adoption
- ALTER-040 — AI Onboarding Guide
- ALTER-042 — Prompt v2 Benchmark Baseline
- ALTER-043 — Introduce Prompt Issue Database
- ALTER-044 — Introduce Prompt Workflow
- ALTER-045 — Introduce Prompt Design Guidelines
- ALTER-046 — Document Prompt Engineering Methodology
