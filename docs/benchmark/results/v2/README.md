# Prompt v2 Benchmark Results

## Model

DeepSeek Chat (`deepseek-chat`)

## Prompt Version

v2（AI Onboarding Guide — Experimental）

## Benchmark Date

2026-07-10

## Repositories Benchmarked

| Repository | Report | Total Score |
|------------|--------|-------------|
| RepoPilot | [repopilot.md](./repopilot.md) | 38 / 40 |
| LangGraph | [langgraph.md](./langgraph.md) | 39 / 40 |
| FastAPI | [fastapi.md](./fastapi.md) | 38 / 40 |
| Next.js | [nextjs.md](./nextjs.md) | 34 / 40 |
| Django | [django.md](./django.md) | 31 / 40 |

**Progress:** 5 / 10 repositories in the [Benchmark Suite](../repositories.md)

**Pending:** Spring PetClinic, Gin, Tokio, fmt, LangChain

---

## Average Score

| Metric | Value |
|--------|-------|
| **Total (8 dimensions)** | **36.0 / 40** (90%) |
| **Per-dimension average** | **4.5 / 5** |

### Score by Dimension (average across 5 repos)

| Dimension | Avg Score |
|-----------|-----------|
| Project Understanding | 4.6 |
| Technology Stack | 4.4 |
| Core Dependency Analysis | 4.0 |
| Repository Structure | 4.6 |
| Reading Guide | 4.4 |
| Developer Guidance | 4.6 |
| Markdown Quality | 4.4 |
| Overall Usefulness | 4.4 |

---

## Prompt Status

**Experimental**

Prompt v2 尚未满足 Stable 晋升条件。当前仅完成 Benchmark Suite 的一半（5/10），且尚未与 v1 进行同仓库、同维度的正式对比评分。

---

## Current Conclusion

Prompt v2 在 **AI Onboarding Guide** 定位上明显优于 v1 的「仓库摘要」模式：

- **显著改进：** 「项目适合谁」、分步阅读指南、开发建议等 onboarding 章节结构稳定；LangGraph、FastAPI、RepoPilot 等中大型项目的架构解读与阅读路径质量较高。
- **仍存问题：** 部分输出仍 README-centric（Django 尤为明显）；核心依赖章节偶发 verbose 或混淆 runtime/dev 依赖（Django、Next.js）；存在无依据推测（如工具选型原因）；超大型 monorepo 深度不足；输出篇幅普遍偏长。
- **最低分项：** Django（31/40）暴露 v2 在 batteries-included 框架与依赖过滤上的 Prompt 缺陷，需优先修复后再扩大 Benchmark 范围。

**建议：** 保持 v2 为 Experimental 默认，完成剩余 5 个仓库 Benchmark、补齐 v1 vs v2 对比表，并按 [Prompt Issue Database](../../prompt-issues.md) 迭代 Prompt 后再评估 Stable 晋升。参见 ALTER-038、ALTER-042、ALTER-043。

---

## Related Documents

- [../../evaluation-guide.md](../../evaluation-guide.md) — 评分标准
- [../../repositories.md](../../repositories.md) — Benchmark 仓库列表
- [../../../prompt-history.md](../../../prompt-history.md) — Prompt 版本与 Benchmark 进度
- [../v1/README.md](../v1/README.md) — Prompt v1 结果（对比基准）
