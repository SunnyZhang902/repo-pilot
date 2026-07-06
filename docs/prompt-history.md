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

See also: ALTER-031 (Prompt Engineering Workflow), ALTER-040 (AI Onboarding Guide), [evaluation-guide.md](benchmark/evaluation-guide.md).

---

## Prompt Benchmark History

| Version | Benchmark | Status |
|---------|-----------|--------|
| v1 | Initial Benchmark | 🚧 In Progress |
| v2 | v1 vs v2 Comparison | 🚧 Benchmarking |
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

## Prompt v3

(TODO)
