# Prompt Workflow

Prompt 开发完整生命周期。RepoPilot 将 Prompt 视为**软件工程产物**，而非一次性文案；迭代遵循固定工作流，而非主观「看起来更好」。

---

## Introduction

Prompt 直接影响 RepoPilot 的核心输出质量，但 LLM 输出具有非确定性，单次样例无法证明改进有效。因此 Prompt 开发必须像功能开发一样：**有输入、有输出、有验收标准、有回归检查**。

本工作流串联 Benchmark、Issue Database、设计、实现、回归与 Adoption，确保每次 Prompt 变更可追溯、可比较、可审计。

相关文档：[PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md)、[prompt-issues.md](./prompt-issues.md)、[benchmark/README.md](./benchmark/README.md)。

---

## Workflow Diagram

```
Repository Benchmark
        ↓
Benchmark Report
        ↓
Prompt Issue Database
        ↓
Issue Prioritization
        ↓
Prompt Design
        ↓
Prompt Implementation
        ↓
Prompt Benchmark
        ↓
Regression Check
        ↓
Prompt Adoption
```

---

## Stage Details

### 1. Repository Benchmark

| Field | Description |
|-------|-------------|
| **Purpose** | 在固定 Benchmark Repository 上运行当前 Prompt Version，收集可复现的 AI 输出 |
| **Input** | Prompt Version、Benchmark Repository URL、LLM 配置（模型、温度等）、RepositoryKnowledge |
| **Output** | 各仓库的原始 AI Summary（verbatim）、生成元数据（日期、模型、Prompt Version） |
| **Owner** | Prompt Engineer / Maintainer |
| **Success Criteria** | Benchmark Suite 中目标仓库全部成功生成；输出完整保存，无手工改写 |

---

### 2. Benchmark Report

| Field | Description |
|-------|-------------|
| **Purpose** | 对单次 Benchmark 运行进行结构化评估，记录仓库级观察与维度得分 |
| **Input** | Repository Benchmark 原始输出、[evaluation-guide.md](./benchmark/evaluation-guide.md) 评分标准 |
| **Output** | 单仓库 Markdown 报告（[results/result-template.md](./benchmark/results/result-template.md) 格式）：Evaluation、Strengths、Weaknesses、Improvement Suggestions |
| **Owner** | Prompt Engineer（人工 Review） |
| **Success Criteria** | 8 个评估维度均有 1–5 分；Weaknesses 诚实记录问题；AI Summary 与原始输出一致 |

---

### 3. Prompt Issue Database

| Field | Description |
|-------|-------------|
| **Purpose** | 从多份 Benchmark Report 中提炼**跨仓库共性**问题，抽象为可追踪 Issue |
| **Input** | 一份或多份 Benchmark Report 的 Weaknesses / Improvement Suggestions |
| **Output** | [prompt-issues.md](./prompt-issues.md) 中的 Issue 条目（PI-XXX）：Title、Severity、Found in、Description、Suggested direction、Status |
| **Owner** | Prompt Engineer |
| **Success Criteria** | Issue 描述可复用（非单仓库偶发）；Severity 与 Found in 准确；不重复 Benchmark Report 全文 |

---

### 4. Issue Prioritization

| Field | Description |
|-------|-------------|
| **Purpose** | 从 Open Issue 中选择本 Prompt Version 要解决的 1–2 项，遵循 One Version → One Major Improvement |
| **Input** | Open Issues（Severity、Found in 频率）、当前 Prompt Version 目标、[prompt-history.md](./prompt-history.md) 演进策略 |
| **Output** | 本版本 Issue 清单（Planned 状态）；对应 ALTER / design doc 中的改进范围说明 |
| **Owner** | Prompt Engineer + Product Owner（如适用） |
| **Success Criteria** | 每个 Prompt Version 仅引入一个主要改进方向；选定 Issue 状态更新为 Planned |

---

### 5. Prompt Design

| Field | Description |
|-------|-------------|
| **Purpose** | 将 Planned Issue 转化为可实现的 Prompt 设计，明确 AI 角色、输出结构与约束 |
| **Input** | Planned Issues、[prompt-guidelines.md](./prompt-guidelines.md)、上一版设计文档（如 [prompt-v2.md](./prompt-v2.md)） |
| **Output** | Prompt 设计文档（如 `prompt-v3.md`）或 ALTER 中的 Design 章节；章节结构、禁止项、示例方向 |
| **Owner** | Prompt Engineer |
| **Success Criteria** | 设计直接对应 Issue ID；遵循 Core Principles；不含实际 Prompt 模板正文混在设计 doc 中（模板归 `backend/app/prompts/`） |

---

### 6. Prompt Implementation

| Field | Description |
|-------|-------------|
| **Purpose** | 将设计落地为 Markdown Prompt Template，并通过 Prompt Engine 接入运行时 |
| **Input** | Prompt Design、`PromptRegistry` 版本映射、`RepositoryKnowledge` 占位符约定 |
| **Output** | `backend/app/prompts/<template>.md`；Registry 条目；必要时 `prompt_config.py` 版本开关（**代码变更由独立 Sprint 执行，本阶段文档定义范围**） |
| **Owner** | Backend Engineer / Prompt Engineer |
| **Success Criteria** | 模板可经 `PromptBuilder` 正确渲染；占位符与 Knowledge 字段对齐；对应 Issue 状态更新为 Resolved |

---

### 7. Prompt Benchmark

| Field | Description |
|-------|-------------|
| **Purpose** | 对新 Prompt Version 在完整或子集 Benchmark Suite 上重新跑分 |
| **Input** | 新 Prompt Version、Benchmark Repository 列表、evaluation-guide |
| **Output** | 新版本 Benchmark Report（`results/vX/`）；维度得分与总分 |
| **Owner** | Prompt Engineer |
| **Success Criteria** | 全量或约定的 Regression 子集完成；分数可与此前一版本横向对比 |

---

### 8. Regression Check

| Field | Description |
|-------|-------------|
| **Purpose** | 确认新 Prompt 未引入质量回退，且 Planned Issue 在 Found in 仓库上改善或消除 |
| **Input** | 新旧版本 Benchmark Report、Planned Issue 列表、prompt-issues 验收标准 |
| **Output** | Regression 结论（通过 / 不通过）；Issue 状态 → Verified 或回退至 Open；[prompt-history.md](./prompt-history.md) 更新 |
| **Owner** | Prompt Engineer |
| **Success Criteria** | 总分或关键维度不低于上一 Stable 版本（或 documented exception）；相关 Issue 在 Found in 仓库 Weaknesses 中不再出现 |

---

### 9. Prompt Adoption

| Field | Description |
|-------|-------------|
| **Purpose** | 将通过 Regression 的 Prompt Version 提升为默认（Stable），更新产品与文档状态 |
| **Input** | 通过的 Regression Check、`DEFAULT_SUMMARY_PROMPT` 变更提案、ALTER-038 Adoption 条件 |
| **Output** | Stable 标记（prompt-history、模板 README）；`prompt_config.py` 默认值更新；前端/API 文档中的版本说明 |
| **Owner** | Maintainer |
| **Success Criteria** | Benchmark 证据与 Verified Issue 齐备；ALTER-038 条件满足；用户可见行为与文档一致 |

---

## Promotion Rule

**Prompt 不得仅因「看起来更好」而晋升为 Stable。**

晋升必须同时满足：

1. **Benchmark** — 在固定 Repository Suite 上完成评估，分数达到或超过既定门槛，且无未解释的维度回退
2. **Issue Resolution** — 本版本 Planned 的 Prompt Issue 在相关仓库上 Regression 后标记为 **Verified**
3. **Documentation** — [prompt-history.md](./prompt-history.md)、Benchmark results、Issue Database 均已更新

主观阅读若干样例可以作为辅助，**不能替代** Benchmark 与 Issue 闭环。

See also: ALTER-038 (Prompt v2 Adoption), ALTER-044 (Introduce Prompt Workflow), [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md).
