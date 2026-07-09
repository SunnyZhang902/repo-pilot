# Prompt History

Prompt 演进记录。每次 Prompt 版本变更后更新本节，并与 [benchmark/](benchmark/) 中的 Benchmark 结果对应。

---

# Prompt Runtime

| Stage | Description | Status |
|-------|-------------|--------|
| Inline Prompt | Python strings in `services/prompt_builder.py` | Superseded |
| Prompt Template | Markdown files in `backend/app/prompts/` | Active |
| Prompt Engine | `backend/app/prompt/` — Registry → Loader → Renderer | **Current** |

```
Inline Prompt
    ↓
Prompt Template (Markdown)
    ↓
Prompt Engine (Registry / Loader / Renderer)
    ↓
LLM
```

Default runtime version: `DEFAULT_SUMMARY_PROMPT` in `backend/app/core/prompt_config.py` (currently **v2**).

---

# Prompt Versions at a Glance

| Version | Status | Product Goal | Benchmark |
|---------|--------|--------------|-----------|
| **v1** | Stable | Repository Summary | Initial benchmark 🚧 |
| **v2** | Experimental | AI Onboarding Guide | Benchmarking 🚧 |
| **v2.1** | Experimental | PI-001 – PI-005 fixes | Pending regression |
| **v3** | Planned | TBD | Pending |

---

# Prompt Evolution Strategy

RepoPilot **不采用**一次修改多个 Prompt 行为的策略。

**原则：One Prompt Version → One Major Improvement**

| Version | Planned Focus |
|---------|---------------|
| Prompt v2 | AI Onboarding Guide（Reduce README Copying） |
| Prompt v3 | Better Reading Order |
| Prompt v4 | Improve Architecture Understanding |
| Prompt v5 | Shorter Output |

每个 Prompt Version 应尽可能只引入**一个主要变化**，方便 Benchmark 判断改动收益。

See also: ALTER-031 (Prompt Engineering Workflow), ALTER-040 (AI Onboarding Guide), ALTER-043 (Prompt Issue Database), [PROMPT_ENGINEERING.md](PROMPT_ENGINEERING.md), [evaluation-guide.md](benchmark/evaluation-guide.md), [prompt-issues.md](prompt-issues.md).

---

## Prompt Benchmark History

| Version | Benchmark | Status |
|---------|-----------|--------|
| v1 | Initial Benchmark | 🚧 In Progress |
| v2 | v1 vs v2 Comparison | 🚧 **5 / 10 repos — avg 36.0/40** ([results/v2/](benchmark/results/v2/)) |
| v3 | Pending | - |

每个 Prompt Version 完成后，都应进行完整 Benchmark，并将结果保存至 [benchmark/results/](benchmark/results/)。

---

## Prompt v1

| Field | Value |
|-------|-------|
| **Status** | Stable |
| **Product Goal** | Repository Summary |
| **Location** | `backend/app/prompts/summary_prompt_v1.md` |
| **Runtime** | `PromptBuilder.build_summary_prompt(knowledge, version="v1")` |

**Features:**

- RepositoryKnowledge injection
- 中文 Markdown 输出
- 六个固定章节：项目简介、技术栈、核心依赖、项目结构、推荐阅读顺序、总结

**Notes:** First production-ready prompt. Available via `version="v1"`; no longer the experimental default.

---

## Prompt v2

| Field | Value |
|-------|-------|
| **Status** | Experimental |
| **Product Goal** | AI Onboarding Guide |
| **Location** | `backend/app/prompts/summary_prompt_v2.md` |
| **Runtime** | `DEFAULT_SUMMARY_PROMPT = "v2"` |
| **Benchmark** | 🚧 Benchmarking — must outperform v1 before Stable promotion |

**Design:** [prompt-v2.md](./prompt-v2.md)

**Major change:**

- AI role: Senior Software Engineer（非 Summary Generator）
- Explain Why / Don't enumerate
- 新增：项目适合谁、开发建议
- 输出定位：帮助新人 Onboarding，而非仓库摘要

See ALTER-038 (Prompt v2 Adoption), ALTER-040 (AI Onboarding Guide).

---

## Prompt v2.1

| Field | Value |
|-------|-------|
| **Status** | Experimental |
| **Product Goal** | AI Onboarding Guide（Issue-driven refinement） |
| **Location** | `backend/app/prompts/summary_prompt_v2.md`（同 v2 文件，内容迭代） |
| **Runtime** | `DEFAULT_SUMMARY_PROMPT = "v2"`（Registry 版本号不变） |
| **Benchmark** | Pending — 需在 PI Found-in 仓库上 Regression |

**Goals（resolve [PI-001 – PI-005](./prompt-issues.md)）：**

| Issue | Target improvement |
|-------|-------------------|
| PI-001 | README 仅作 Knowledge 之一；禁止逐段 paraphrase；onboarding 独立表述 |
| PI-002 | 项目结构改为系统组织：Why + 工程问题 + 模块协作 |
| PI-003 | 推荐阅读按目标分路径（使用 / 贡献 / 架构），概念优先、WHY 必填 |
| PI-004 | 核心依赖写协作链，Top 3–5 runtime，禁止枚举 |
| PI-005 | 低置信用「仓库表明…」；禁止编造实现细节 |

**Other changes:**

- 强化「项目适合谁」：值得学习 vs 收益有限
- 新增 `# AI Insights`：Biggest Engineering Idea、Most Important Module、Learning Difficulty、Recommended Audience、Estimated Learning Time

See ALTER-047 (Prompt v2.1).

---

## Prompt v3

(TODO)

---

# Benchmark Progress

Prompt v2 Benchmark & Adoption Sprint 进度（文档基准，2026-07-10）。

| Field | Value |
|-------|-------|
| **Repositories evaluated** | 5 / 10 |
| **Current average score** | 36.0 / 40 (90%) |
| **Results location** | [benchmark/results/v2/](benchmark/results/v2/) |
| **Prompt status** | Experimental |

### Repositories Completed

- RepoPilot — 38/40
- LangGraph — 39/40
- FastAPI — 38/40
- Next.js — 34/40
- Django — 31/40

### Known Issues

v2.1 模板已针对 PI-001 – PI-005 修订（ALTER-047）；**待 Regression Benchmark 验证**后 Issue 方可标记 Verified。

v2 基线（2026-07-10）遗留观察：

- **超大型 monorepo 深度不足：** Next.js 仅覆盖 packages/next
- **输出篇幅：** v2.1 已精简 Prompt 指令，输出长度待 Benchmark 确认
- **未完成 v1 vs v2 正式对比**

### Next Actions

1. 对 PI Found-in 仓库（RepoPilot、LangGraph、FastAPI、Next.js、Django）运行 **v2.1 Regression Benchmark**
2. 更新 [prompt-issues.md](prompt-issues.md)：PI-001 – PI-005 → Verified（若通过）
3. 完成剩余 5 个 Benchmark 仓库
4. 全量通过后评估 ALTER-038 Stable 晋升

See ALTER-042, ALTER-043, ALTER-047.

