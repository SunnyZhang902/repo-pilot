# Prompt Design Guidelines

RepoPilot 通用 Prompt 设计规范。所有未来 Prompt 模板——Repository Summary、Chat、Reading Guide、Architecture Analysis 等——均应遵循本指南。

---

## Introduction

Prompt 是 RepoPilot 与 LLM 之间的**契约**：它定义 AI 的角色、输入边界、输出结构与质量底线。不同 AI 能力使用不同模板，但设计原则应一致，以保证：

- 输出风格统一（简体中文 Markdown、onboarding 视角）
- 质量可 Benchmark、问题可归类至 [prompt-issues.md](./prompt-issues.md)
- 新能力复用 [Prompt Engine](../backend/app/prompt/) 而非另起炉灶

本指南是 **设计约束**，不是 Prompt 正文。具体版本设计见 [prompt-v2.md](./prompt-v2.md) 等文档；流程见 [prompt-workflow.md](./prompt-workflow.md)。

---

## Core Principles

| # | Principle | Requirement |
|---|-----------|-------------|
| 1 | **Explain WHY before WHAT** | 先说明设计原因、问题背景，再描述模块或技术名称 |
| 2 | **Prefer explanation over enumeration** | 用因果与协作关系组织内容，避免纯列表堆砌 |
| 3 | **Avoid README paraphrasing** | 禁止改写 README 口号或官方宣传语；须基于 RepositoryKnowledge 独立解读 |
| 4 | **Avoid speculation** | 无仓库证据时不推断实现细节；无法确认则写「未在仓库中明确说明」 |
| 5 | **Infer architecture from repository evidence** | 架构结论须可追溯到目录结构、入口文件、依赖声明 |
| 6 | **Recommend learning strategy, not directory order** | 阅读指南按**概念阶段**组织，文件路径作为附录 |
| 7 | **Prefer developer insight over completeness** | 宁可少而精，不要全而空；标注必读 / 选读 / 可跳过 |
| 8 | **Explain collaboration between modules** | 说明模块如何串联（数据流、控制流、依赖链） |
| 9 | **Explain trade-offs whenever possible** | 技术选型须点明权衡（为何选 A 而非 B），有证据则引用，无则省略 |
| 10 | **Keep outputs concise but information-dense** | 控制篇幅；每段应有明确信息增量 |
| 11 | **Use Markdown consistently** | 固定标题层级、列表、表格、代码块；项目名保持英文 |
| 12 | **Maintain an onboarding perspective** | 默认读者为**首次加入项目的新开发者**，不是文档爬虫 |

---

## Application by Output Section

以下约定适用于当前 **AI Onboarding Guide**（Prompt v2）及同类 Summary 模板；其他 Prompt Type 可增减章节，但原则不变。

| Section | Guidelines |
|---------|------------|
| **项目简介** | Problem → Solution → 独特价值；禁止复制 README 首段 |
| **项目适合谁** | 明确适合 / 不适合 / 是否建议读源码；基于仓库规模与领域 |
| **技术栈** | 每项说明 *Why here*，而非仅列名称 |
| **核心依赖** | Top N 运行时依赖 + 协作链；dev 工具单独归类或省略 |
| **项目结构** | 解释组织意图；标注必读 / 选读；大型 monorepo 须覆盖关键包边界 |
| **推荐阅读顺序** | 概念里程碑 + 验证方式；路径来自 Knowledge 文件树 |
| **开发建议** | 可执行行动（跑测试、跟调用链、改 Prompt 实验） |
| **总结** | 架构特点、设计思想、复杂度、学习价值 — 各一句实质内容 |

---

## Anti-Patterns

以下行为在 Benchmark 中已反复出现（见 PI-001 – PI-005），**禁止**在新 Prompt 中延续：

- 复述「30 秒理解」类产品口号而无架构增量
- 将 package.json devDependencies 列为框架核心依赖
- 用「推测」「可能」填充工具选型原因
- 阅读顺序仅罗列文件路径，无概念说明
- 为显得完整而编造代码行数、模块数量等统计

---

## Future Prompt Types

本指南同样适用于 Phase 3 及以后的 AI 能力模板：

| Prompt Type | Primary Goal | Guideline Emphasis |
|-------------|--------------|-------------------|
| **Repository Chat** | 对话式答疑 | 引用 Knowledge 片段；禁止无依据断言；保持 onboarding 语气 |
| **Architecture Analysis** | 深度架构解读 | WHY + 模块协作 +  trade-offs；可配 mermaid/ASCII |
| **Reading Guide** | 个性化阅读路径 | 概念导向；学习策略优于目录遍历 |
| **Contribution Guide** | 贡献者 onboarding | 开发环境、测试、PR 约定；基于仓库实际脚本与 CI |
| **Code Review** | 变更理解辅助 | 变更意图、影响面、风险；不替代人工 Review |

新增 Prompt Type 时：在 `PromptRegistry` 注册 task → template 映射；编写独立设计 doc；纳入 Benchmark 或专用 Evaluation Rubric。

---

## Checklist Before Merge

Prompt 模板合并或版本发布前，确认：

- [ ] 遵循 [prompt-workflow.md](./prompt-workflow.md) 中 Planned Issue 范围
- [ ] 本指南 12 条 Core Principles 已逐项对照
- [ ] 输出语言为简体中文；项目 / 包 / 路径名保持英文
- [ ] 无 README 整段 paraphrase
- [ ] 推荐阅读路径中的路径存在于 RepositoryKnowledge
- [ ] Benchmark 或 Regression 已计划（非纯文档变更除外）

See also: [evaluation-guide.md](./benchmark/evaluation-guide.md) Prompt Evaluation Checklist, ALTER-045 (Introduce Prompt Design Guidelines).
