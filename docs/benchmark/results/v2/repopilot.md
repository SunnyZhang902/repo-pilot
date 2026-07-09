# Repository
**Repository name:** RepoPilot
**Repository URL:** https://github.com/SunnyZhang902/repo-pilot
**Date:** 2026-07-10
**Prompt Version:** v2
**LLM Model:** deepseek-chat

---

# AI Summary

# 项目简介

RepoPilot 是一个 **AI 驱动的仓库理解平台**，旨在帮助开发者在 **30 秒内** 理解任意 GitHub 仓库。

它的核心价值在于：**将「阅读源码」这一高成本、高门槛的任务，转化为「AI 自动构建知识 + 生成结构化入职指南」的自动化流程**。它不是一个代码浏览器，而是一个 **AI Software Onboarding Engineer**，专门解决「新项目上手慢、理解成本高」的痛点。

# 项目适合谁

**适合：**

✔ **AI Agent / LLM 应用开发者** — 学习如何构建 Prompt Engine、集成 LLM、设计 Benchmark 流程  
✔ **Backend 工程师** — 学习 FastAPI 分层架构、服务编排、Git 操作集成  
✔ **Python 开发者** — 核心后端使用 Python，涉及 GitPython、异步任务、模板引擎  
✔ **对「AI + 开发者工具」方向感兴趣的开发者** — 了解如何用 AI 解决工程效率问题  

**不适合：**

✘ **前端初学者** — 前端仅作为演示界面，核心逻辑在后端，前端技术栈（Next.js + TypeScript）并非项目重点  
✘ **希望学习深度学习/模型训练的人** — 项目仅调用 LLM API，不涉及模型训练或微调  

**是否适合作为源码学习项目：** 是。项目规模适中（后端约 20 个模块），架构清晰，分层明确，适合学习 FastAPI 项目组织、服务编排、Prompt 工程等实践。

# 技术栈

- **Python 3.11+** — 后端核心语言。选择 Python 是因为 AI/LLM 生态成熟，FastAPI 性能优秀，且适合快速迭代。
- **FastAPI** — 后端 Web 框架。提供异步支持、自动 API 文档、类型校验，适合构建 AI 服务的 API 层。
- **GitPython** — 用于克隆仓库、获取 Git 元数据。直接操作 Git 仓库，而非依赖 GitHub API 的树结构，更灵活。
- **DeepSeek** — 作为 LLM 后端。根据 `backend/app/services/llm_client.py` 推测，项目集成了 DeepSeek Chat Completions API。选择 DeepSeek 可能是出于成本或性能考虑（仓库中未明确说明原因）。
- **Next.js + TypeScript** — 前端框架。用于构建演示界面，展示分析结果。选择 Next.js 是因为其 SSR 能力和 React 生态。
- **uv** — Python 包管理器。推荐使用，比 pip 更快，支持 lock 文件（`uv.lock` 存在）。

# 核心依赖

按重要程度排序：

1. **FastAPI** — 整个后端的骨架。所有 API 端点、服务编排、请求处理都依赖它。没有 FastAPI，项目无法对外提供服务。
2. **GitPython** — 核心能力「克隆仓库」的基石。用于 clone 仓库、读取文件树、获取 Git 元数据。与 `RepositoryCloneService` 和 `RepositoryParserService` 直接相关。
3. **DeepSeek API** — AI 能力的来源。`LLMClient` 封装了与 DeepSeek 的通信，所有 Prompt 最终都通过它生成结果。没有它，项目无法生成理解报告。
4. **Prompt 模板引擎**（自定义模块） — 包括 `PromptRegistry`、`PromptLoader`、`PromptRenderer`、`PromptBuilder`。这是项目的核心设计亮点：将 Prompt 与业务逻辑解耦，支持版本管理和模板化渲染。
5. **Tree-sitter**（规划中） — 根据 README 提及，未来可能用于代码解析。当前未实现，但值得关注。

# 项目结构

项目采用 **前后端分离** 架构，核心逻辑在后端。目录组织体现了 **分层架构** 和 **职责分离** 的设计思想。

```
repo-pilot/
├── backend/          # 核心后端（必读）
│   ├── app/
│   │   ├── api/          # API 层（必读）
│   │   │   └── repository.py  # 仓库相关 API 端点
│   │   ├── core/         # 基础设施层（选读）
│   │   │   ├── config.py          # 集中配置
│   │   │   ├── git_environment.py # Git 环境初始化
│   │   │   ├── logger.py          # 日志
│   │   │   ├── prompt_config.py   # Prompt 版本配置
│   │   │   └── timer.py           # 性能计时
│   │   ├── models/       # 数据模型（选读）
│   │   ├── prompt/       # Prompt 引擎（必读）
│   │   │   ├── prompt_builder.py   # 编排 Prompt 构建
│   │   │   ├── prompt_loader.py    # 加载模板文件
│   │   │   ├── prompt_registry.py  # 任务→模板映射
│   │   │   └── prompt_renderer.py  # 注入占位符
│   │   ├── prompts/      # Prompt 模板文件（必读）
│   │   │   ├── summary_prompt_v1.md
│   │   │   └── summary_prompt_v2.md
│   │   ├── schemas/      # Pydantic 模型（选读）
│   │   ├── services/     # 核心服务层（必读）
│   │   │   ├── repository_analyzer.py      # 编排分析流程
│   │   │   ├── repository_knowledge_builder.py # 构建知识结构
│   │   │   ├── repository_summary_service.py  # 生成最终摘要
│   │   │   ├── llm_client.py               # LLM 调用
│   │   │   ├── github_service.py           # GitHub API
│   │   │   ├── repository_clone_service.py # 克隆仓库
│   │   │   ├── repository_parser_service.py # 解析文件树
│   │   │   ├── repository_file_reader_service.py # 读取文档
│   │   │   ├── context_builder.py          # 构建上下文
│   │   │   ├── configuration_extractor.py  # 提取配置
│   │   │   ├── dependency_extractor.py     # 提取依赖
│   │   │   ├── entry_point_extractor.py    # 提取入口
│   │   │   └── language_extractor.py       # 提取语言
│   │   ├── utils/        # 工具（选读）
│   │   │   └── workspace.py  # Workspace 管理
│   │   └── main.py       # 应用入口
│   ├── pyproject.toml    # 项目配置
│   └── README.md
├── frontend/         # 前端演示（选读）
│   ├── src/
│   │   ├── app/          # 页面
│   │   ├── components/   # UI 组件
│   │   ├── services/     # API 调用
│   │   └── types/        # TypeScript 类型
│   └── package.json
├── docs/             # 文档（选读）
│   ├── benchmark/    # Benchmark 评估
│   ├── ALTER.md      # 架构改进计划
│   ├── PRD.md        # 产品需求文档
│   ├── TASK.md       # 开发任务
│   └── prompt-history.md # Prompt 演进历史
└── README.md
```

**关键设计决策：**

- **分层架构**：API → Service → Knowledge → Prompt → LLM，每一层职责单一，上层编排下层。这种设计使得替换 LLM 或修改 Prompt 模板时，不影响业务逻辑。
- **Prompt 与业务解耦**：Prompt 正文存放在 Markdown 文件中，通过 `PromptRegistry` 映射任务和版本，`PromptLoader` 加载，`PromptRenderer` 注入变量。这是项目的核心设计亮点。
- **Hash-based Workspace**：根据 `workspace.py` 推测，每个仓库分析使用 hash 作为工作目录，避免冲突，支持缓存。

# 推荐阅读顺序

### 第一步：理解项目定位和架构

**阅读对象：** `README.md`、`docs/ALTER.md`、`docs/TASK.md`

**为什么先读：** 了解项目目标、架构设计、当前开发阶段，建立全局认知。

**阅读收益：**
- 理解项目为什么存在，解决什么问题
- 了解分层架构的设计意图
- 知道当前开发进度和未来方向

### 第二步：理解核心数据流

**阅读对象：** `backend/app/services/repository_analyzer.py`、`backend/app/services/repository_knowledge_builder.py`、`backend/app/services/repository_summary_service.py`

**为什么先读：** 这三个服务构成了核心流水线：分析 → 构建知识 → 生成摘要。理解它们就理解了项目的主流程。

**阅读收益：**
- 理解仓库分析的完整流程
- 了解 Knowledge 结构如何构建
- 理解 Prompt 如何与 LLM 交互

### 第三步：理解 Prompt 引擎

**阅读对象：** `backend/app/prompt/` 目录下的所有文件，以及 `backend/app/prompts/` 目录下的模板文件

**为什么先读：** Prompt 引擎是项目的核心设计亮点，理解它才能理解如何扩展和优化 AI 输出。

**阅读收益：**
- 理解 Prompt 与业务逻辑的解耦方式
- 了解如何添加新的 Prompt 模板
- 理解版本管理和模板渲染机制

### 第四步：理解基础设施

**阅读对象：** `backend/app/core/` 目录下的文件

**为什么先读：** 了解配置、日志、计时等基础设施，有助于理解项目如何运行和调试。

**阅读收益：**
- 理解配置管理方式
- 了解日志和性能监控
- 知道 Git 环境初始化做了什么

### 第五步：理解 API 层

**阅读对象：** `backend/app/api/repository.py`

**为什么先读：** 了解对外暴露的接口，理解用户如何与系统交互。

**阅读收益：**
- 理解 API 端点设计
- 了解请求和响应格式
- 知道如何测试和调试

# 开发建议

### 第一周重点关注

1. **`backend/app/services/repository_analyzer.py`** — 这是整个分析流程的编排者。理解它就能理解数据流。建议先画出流程图，标注每个步骤调用的服务。
2. **`backend/app/prompt/` 目录** — Prompt 引擎是项目的核心设计。建议先理解 `PromptRegistry` 的映射逻辑，再理解 `PromptBuilder` 如何编排加载和渲染。
3. **`backend/app/prompts/summary_prompt_v1.md` 和 `summary_prompt_v2.md`** — 对比两个版本的 Prompt，理解 Prompt 工程如何演进。这是理解项目「Benchmark First」理念的关键。
4. **`backend/app/services/llm_client.py`** — 理解如何与 DeepSeek API 交互，包括请求格式、错误处理、超时等。

### 可行动建议

- **先跑通后端**：按照 README 的快速开始步骤，配置 DeepSeek API Key，启动后端服务。用 curl 或 Postman 测试 `POST /api/repositories/import` 和 `POST /api/repositories/summary` 接口。
- **理解 Benchmark 流程**：阅读 `docs/benchmark/` 目录下的文档，了解如何评估 Prompt 质量。这是项目保证质量的核心机制。
- **尝试修改 Prompt 模板**：在 `backend/app/prompts/` 下复制一个模板，修改内容，然后通过 `prompt_config.py` 切换版本，观察输出变化。这是理解 Prompt 引擎的最佳实践。
- **关注 `docs/ALTER.md` 和 `docs/TASK.md`**：了解当前开发阶段和未来计划，有助于判断哪些模块需要优先理解。

# 总结

**架构特点：** 清晰的分层架构（API → Service → Knowledge → Prompt → LLM），职责单一，易于扩展。Prompt 引擎与业务逻辑完全解耦，支持版本管理和模板化渲染，是项目的核心设计亮点。

**设计思想：** 遵循「Benchmark First」原则，通过固定的 Benchmark Repository Suite 持续评估 AI 输出质量，确保 Prompt 更新不会降低质量。体现了迭代式 AI 开发流程：Build → Validate → Iterate Prompt → Improve UX → Introduce New Capabilities。

**复杂度：** 中等偏低。项目规模适中（后端约 20 个模块），架构清晰，没有复杂的异步任务或分布式系统。主要复杂度在于理解 Prompt 引擎的设计和 Benchmark 流程。

**学习价值：** 高。适合学习：
- FastAPI 分层架构和服务编排
- Prompt 工程和模板引擎设计
- AI 应用中的 Benchmark 和质量保证
- Git 操作集成和 Workspace 管理
- 如何将 AI 能力封装为可维护的工程产品

---

# Evaluation

Score every dimension from 1–5.

| Dimension | Score | Notes |
|-----------|-------|-------|
| Project Understanding | 5 | 准确描述 AI 入职指南定位、Benchmark First 与分层架构 |
| Technology Stack | 4 | 技术栈识别正确；DeepSeek 选型原因属推测 |
| Core Dependency Analysis | 4 | 核心依赖排序合理；Tree-sitter 标注为规划项 |
| Repository Structure | 5 | 目录树完整，必读/选读标注清晰 |
| Reading Guide | 5 | 五步阅读顺序可执行，与数据流一致 |
| Developer Guidance | 5 | 第一周重点与可行动建议具体 |
| Markdown Quality | 5 | 章节结构规范，列表与代码块格式良好 |
| Overall Usefulness | 5 | 新人可据此快速建立全局认知 |
| **Total Score** | **38 / 40** | |

---

# Strengths

- 「项目适合谁」章节精准，区分适合/不适合读者
- 项目结构树与分层架构解读与仓库实际一致
- 推荐阅读顺序按数据流编排，从文档到核心服务再到 Prompt 引擎
- 开发建议包含可执行的 API 测试与 Prompt 实验步骤

---

# Weaknesses

- 部分表述仍接近 README 复述（如「30 秒内理解」等产品口号）
- DeepSeek 选型原因、Hash-based Workspace 等细节含「推测」措辞，存在轻微幻觉风险
- Tree-sitter 列为核心依赖第 5 项，但实际未实现，优先级偏高
- 输出篇幅较长，信息密度可进一步压缩

---

# Improvement Suggestions

（仅 Prompt 层面改进，不涉及后端或前端代码变更）

1. Prompt 中要求：对无法从 RepositoryKnowledge 确认的信息禁止推测，改用「未在仓库中明确说明」
2. Prompt 中要求：核心依赖仅列出 pyproject/package 中已声明且与主流程相关的包
3. 增加输出长度上限或「Executive Summary」段落，避免重复产品营销用语
