# Prompt Issue Database

Prompt 问题数据库。集中追踪 Benchmark 过程中发现的、**可复用的 Prompt 层面问题**。

---

## Introduction

Benchmark 报告（[benchmark/results/](./benchmark/results/)）记录的是**特定仓库**上的观察结果：某次运行中 AI 输出在哪些维度得分、该仓库有哪些 Strengths 与 Weaknesses。

**Prompt Issue Database** 则从多份 Benchmark 报告中**提炼共性**，将重复出现的问题抽象为独立 Issue。每个 Issue 描述一类应在未来 Prompt 迭代中解决的通用缺陷，而非某一仓库的一次性现象。

| 文档 | 粒度 | 用途 |
|------|------|------|
| Benchmark Report | 单仓库 × 单 Prompt Version | 评分、verbatim 输出、仓库级 Weaknesses |
| **Prompt Issue Database** | 跨仓库、跨版本 | 驱动 Prompt 改进优先级与验收标准 |

新增 Issue 时：先在 Benchmark 报告中记录观察，再判断是否属于可复用模式；若是，在此登记并关联 **Found in** 仓库列表。Issue 解决后，通过 Regression Benchmark 验证，状态流转至 Verified。

See also: [prompt-history.md](./prompt-history.md), [benchmark/evaluation-guide.md](./benchmark/evaluation-guide.md), ALTER-043.

---

## Issue Lifecycle

每个 Prompt Issue 按以下状态流转：

```
Open
  ↓
Planned
  ↓
Resolved
  ↓
Verified
```

| Status | Meaning |
|--------|---------|
| **Open** | 已在 Benchmark 中确认，尚未纳入具体 Prompt 版本的改进计划 |
| **Planned** | 已分配至某一 Prompt Version（如 v3），改进方向已写入设计文档或 ALTER |
| **Resolved** | 对应 Prompt 模板已修改并合并；待 Regression Benchmark 验证 |
| **Verified** | 在相关 Benchmark 仓库上重新跑分，Issue 不再复现，或评分/Weaknesses 明显改善 |

**规则：** Issue 不得从 Open 直接标记为 Verified；必须经过 Planned → Resolved → Verified 完整路径，以保证 Prompt 演进可审计。

---

## Current Issues

以下 Issue 提炼自 Prompt v2 基线 Benchmark（2026-07-10）。**v2.1**（ALTER-047）已在模板中 address；状态 **Resolved**，待 Regression 后 **Verified**。详见 [prompt-history.md](./prompt-history.md#prompt-v21)。

---

### PI-001

| Field | Value |
|-------|-------|
| **Title** | README-centric Output |
| **Severity** | High |
| **Found in** | RepoPilot, Next.js, Django |
| **Status** | Open → **Resolved** (template v2.1, ALTER-047; pending Verified) |

**Description**

AI 有时改写 README 内容，而非从 onboarding 视角解释项目。表现为复述产品口号、官方宣传语或文档目录结构，缺少基于 RepositoryKnowledge 的独立架构解读。

**Suggested direction**

要求模型从仓库结构与代码组织**推断**架构与设计哲学，而非 paraphrase README。项目简介须引用 Knowledge 中的独特信息（入口文件、模块边界、数据流），并显式禁止复制 README 营销用语。

---

### PI-002

| Field | Value |
|-------|-------|
| **Title** | Architecture Explanation Too Shallow |
| **Severity** | High |
| **Found in** | LangGraph, FastAPI, Django |
| **Status** | Open → **Resolved** (template v2.1, ALTER-047; pending Verified) |

**Description**

AI 能正确识别模块与目录，但未解释**为何**采用此种架构组织。输出停留在「是什么」的枚举层，缺少设计意图、模块协作关系与关键抽象（如 Pregel 超步、ASGI 分层、MTV 请求生命周期）的因果说明。

**Suggested direction**

Prompt 增加「设计意图」章节要求：每个核心模块须回答 *Why this split?* 与 *How modules collaborate?*；对框架类项目要求画出或文字描述请求/数据流路径。

---

### PI-003

| Field | Value |
|-------|-------|
| **Title** | Reading Guide Lacks Learning Strategy |
| **Severity** | Medium |
| **Found in** | Next.js, Django |
| **Status** | Open → **Resolved** (template v2.1, ALTER-047; pending Verified) |

**Description**

阅读顺序以**文件路径**为导向，而非**概念**为导向。列出「先读 A.py 再读 B.py」但缺少概念里程碑（如「先理解请求生命周期，再理解 ORM 编译」），新人难以建立 mental model。

**Suggested direction**

阅读指南须按**概念阶段**组织（建立全局模型 → 核心抽象 → 扩展模块），每步说明要掌握的**概念**及验证理解的方式（如运行哪个测试、跟踪哪条调用链），文件路径作为概念阶段的附录而非主体。

---

### PI-004

| Field | Value |
|-------|-------|
| **Title** | Dependency Analysis Focuses on Listing |
| **Severity** | Medium |
| **Found in** | RepoPilot, Django |
| **Status** | Open → **Resolved** (template v2.1, ALTER-047; pending Verified) |

**Description**

依赖章节逐个介绍包的作用，但未说明依赖之间的**协作关系**。例如 runtime 与 dev 工具混列、缺少「Starlette → FastAPI → Pydantic」或「asgiref 如何支撑 ASGI 异步」等链路式解释。

**Suggested direction**

限制 Top N 运行时依赖，并要求用一句话描述**协作链**；dev/test 工具单独归类或省略；禁止将 package.json devDependencies 误列为框架核心依赖。

---

### PI-005

| Field | Value |
|-------|-------|
| **Title** | Speculative Statements |
| **Severity** | Medium |
| **Found in** | RepoPilot, Django |
| **Status** | Open → **Resolved** (template v2.1, ALTER-047; pending Verified) |

**Description**

AI 偶尔推断 RepositoryKnowledge 中无充分证据支持的实现细节。例如工具选型原因、未实现功能的优先级、Workspace 行为等，使用「推测」「可能」等措辞仍可能误导读者。

**Suggested direction**

Prompt 显式禁止无依据推测；无法确认的信息统一表述为「未在仓库中明确说明」；推荐阅读路径中的文件/Notebook 必须来自 Knowledge 文件树。

---

## Statistics

| Metric | Count |
|--------|-------|
| **Total Issues** | 5 |
| **Open** | 0 |
| **Planned** | 0 |
| **Resolved** | 5 |
| **Verified** | 0 |

### By Severity

| Severity | Count |
|----------|-------|
| High | 2 |
| Medium | 3 |
| Low | 0 |

---

## Future Work

每次 Prompt 迭代（v3、v4…）**必须引用本数据库**：

1. **规划阶段** — 从 Open Issue 中选择本版本要解决的 1–2 项（遵循 One Version → One Major Improvement）
2. **设计阶段** — 在 [prompt-v2.md](./prompt-v2.md) 或新版本设计文档 / ALTER 中标注对应 Issue ID（如 PI-001）
3. **验收阶段** — Prompt 版本视为成功，须同时满足：
   - Benchmark 总分或关键维度得分提升
   - 相关 Issue 在 **Found in** 仓库上 Regression 后不再复现
4. **关闭阶段** — Issue 状态更新为 Verified，并在 [prompt-history.md](./prompt-history.md) 中记录

Benchmark 报告负责**发现**问题；Prompt Issue Database 负责**归类、 prioritization 与闭环**。二者配合，使 Prompt 演进从直觉驱动转为 **Issue-driven**。

See ALTER-043 (Introduce Prompt Issue Database).
