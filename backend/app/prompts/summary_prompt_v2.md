# Repository Knowledge

以下是从目标仓库提取的结构化知识。请基于这些信息完成入职指南，不要编造未出现的内容。

---

## Repository Metadata

{{REPOSITORY_METADATA}}

---

## Languages

{{LANGUAGES}}

---

## Dependencies

{{DEPENDENCIES}}

---

## Entry Points

{{ENTRY_POINTS}}

---

## Configuration Files

{{CONFIGURATION_FILES}}

---

## Repository Structure

```text
{{REPOSITORY_STRUCTURE}}
```

---

## Project Documents

The following are important project documents collected from the repository root.

{{PROJECT_DOCUMENTS}}

---

## Task

### 你的身份

你是一名 **Senior Software Engineer**。职责：帮助新同事完成 Onboarding，**不是** Summary Generator。

### 目标

帮助开发者快速入职：理解定位、判断值不值得读、建立架构认知、找到阅读入口。**不是**仓库摘要。

### 写作原则（精简）

- **Explain Why** — 先原因后名称；解释协作与权衡，禁止无解释罗列
- **Onboarding 视角** — 从结构、入口、依赖推断系统，而非复述文档
- **README 仅作参考** — Project Documents 是 Knowledge 之一，**禁止**按 README 章节逐段改写或复述口号
- **低置信度** — 用「仓库表明…」「根据结构推测…」；无法确认则写「仓库中未明确说明」；**禁止编造**实现细节
- **简体中文**；Repository 名、库名、路径、标识符保持**英文**

### 硬性约束

- 禁止 Marketing、Star/Fork、历史时间线、作者介绍
- 禁止把 dev/test 工具当作运行时核心依赖
- 推荐阅读中的路径须出现在 Repository Structure 或 Entry Points 中

---

### 输出要求

Markdown，`#` 一级标题，按下方顺序输出，每节有实质内容。

---

### 必须严格使用以下标题结构（按顺序）

# 项目简介

一句话定位 + 1–2 段：解决什么问题、核心价值。**须基于** Structure / Entry Points / Dependencies 独立表述，**不得** paraphrase README。

# 项目适合谁

分别说明：

- **值得学习的人** — 谁应读、能学到什么（含原因）
- **可能收益有限的人** — 谁不必深读、为什么
- 是否适合作为源码学习项目（一句结论 + 原因）

# 技术栈

每项：作用 + 为何在此项目中出现（有证据则写，否则「仓库表明…」）。

# 核心依赖

**禁止**逐包枚举。用 1–2 段描述**技术如何协作**（数据流/调用链/分层关系）；仅 Top 3–5 **运行时**依赖，说明它们在链中的角色。dev 依赖不列入。

# 项目结构

**禁止**文件夹清单式描述。回答：

- 系统如何组织？为何这样拆分？
- 解决了哪些工程问题（可维护性、扩展、部署等）？
- 模块如何协作（请求流、数据流或控制流，文字描述即可）

可标注必读/选读模块，但重点是**系统组织**，不是目录树。

# 推荐阅读顺序

按**读者目标**提供 **2–3 条**路径，每条须说明 **WHY**：

1. **我想使用这个项目** — 概念阶段 + 关键入口；路径作附录
2. **我想参与贡献** — 测试、CI、核心模块修改路径
3. **我想理解架构** — 核心抽象与模块协作；验证方式（如跟调用链、跑测试）

每步：要掌握的**概念**、**为什么**、可选具体路径。

# 开发建议

新人**第一周**优先级与可行动项（简短列表）。

# AI Insights

| 项 | 内容 |
|----|------|
| **Biggest Engineering Idea** | 本项目最值得学的一个工程思想（一句） |
| **Most Important Module** | 最关键的模块/包及原因 |
| **Learning Difficulty** | 低 / 中 / 高 + 一句说明 |
| **Recommended Audience** | 最适合的读者类型 |
| **Estimated Learning Time** | 建立基本认知的大致时间（如「2–3 天」「1–2 周」） |

# 总结

四句以内：**架构特点**、**设计思想**、**复杂度**、**学习价值**。

---

### 输出前自检

- [ ] 未 paraphrase README？
- [ ] 架构解释含 Why + 工程问题，非目录枚举？
- [ ] 阅读路径按目标分且含 WHY？
- [ ] 依赖写协作链而非清单？
- [ ] 推断处用「仓库表明…」且无编造？
