# RepoPilot

> **30 秒理解任意 GitHub 仓库。**

## 项目介绍

RepoPilot 是一个 **AI 驱动的仓库理解平台**。

它不是 GitHub 仓库浏览器，而是一位 **AI 软件入职工程师（AI Software Onboarding Engineer）** —— 自动构建仓库的结构化知识，并在 30 秒内用 AI 向开发者解释项目。

🚧 项目正在积极开发中。

## 功能特性

✅ **已完成**

- GitHub 元数据获取
- 仓库克隆
- 项目结构解析
- 文档读取
- 知识层构建
- Prompt 构建
- DeepSeek 集成
- 仓库总结 API
- 性能日志
- 工作区缓存

## 技术架构

RepoPilot 采用分层架构。每一层职责单一；上层编排，下层执行。

```
GitHub Repository
        ↓
    Metadata
        ↓
Repository Clone
        ↓
Repository Parser
        ↓
 Document Reader
        ↓
Repository Knowledge
        ↓
  Prompt Builder
        ↓
  DeepSeek LLM
        ↓
Repository Summary
```

### Infrastructure Layer

| 模块 | 职责 |
|------|------|
| `Config` | 集中配置（API Key、模型、超时） |
| `Logger` | 项目级日志（`RepoPilot`） |
| `Timer` | 流水线各阶段性能计时 |

### Repository Layer

| 模块 | 职责 |
|------|------|
| `GitHubService` | 从 GitHub API 获取仓库元数据 |
| `RepositoryCloneService` | 克隆仓库到本地工作区 |
| `RepositoryParserService` | 构建递归文件树 |
| `RepositoryFileReaderService` | 读取项目文档（README、配置文件等） |
| `RepositoryAnalyzer` | 编排 metadata → clone → parse |

### Knowledge Layer

| 模块 | 职责 |
|------|------|
| `RepositoryKnowledgeBuilder` | 组装 `RepositoryKnowledge` |
| `PromptBuilder` | 从知识构建结构化 LLM Prompt |

### AI Layer

| 模块 | 职责 |
|------|------|
| `LLMClient` | DeepSeek Chat Completions 集成 |
| `RepositorySummaryService` | 生成 AI 仓库总结 |

### API Layer

| 模块 | 职责 |
|------|------|
| FastAPI Endpoints | `POST /api/repositories/import`、`POST /api/repositories/summary` |

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv)（推荐）

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY

uv sync
uv run uvicorn app.main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 `http://localhost:3000`，输入 GitHub 仓库地址即可开始分析。

## Roadmap

### Phase 1 — Foundation

✅ **Completed**

---

### Phase 2 — AI Repository Understanding

🚧 **In Progress**

---

### Phase 2.5 — Product Validation

**Upcoming**

**Focus:**

- Repository Benchmark
- Prompt Evaluation
- Prompt Iteration
- User Validation

---

### Phase 3 — Advanced AI Capabilities

**Planned**

**Includes:**

- Repository Chat
- Architecture Analysis
- Code Review
- Reading Guide
- Prompt Versioning

## 开发理念

RepoPilot 遵循迭代式 AI 开发流程：

```
Build
    ↓
Validate
    ↓
Iterate Prompt
    ↓
Improve User Experience
    ↓
Introduce New AI Capabilities
```

与其不断堆叠新功能，RepoPilot 更优先保证**理解质量**、**可维护性**与**产品体验**。

完整路线图见 [docs/TASK.md](docs/TASK.md)，架构改进计划见 [docs/ALTER.md](docs/ALTER.md)。

## AI Benchmark

RepoPilot 使用固定 **Benchmark Repository** 持续评估 AI Summary。

**评估内容包括：**

- 项目理解
- 技术栈识别
- 核心依赖分析
- 项目结构分析
- 推荐阅读顺序
- Markdown 输出质量

保证 Prompt 更新不会降低 AI 输出质量。

Benchmark 文档见 [docs/benchmark/](docs/benchmark/)，Prompt 演进见 [docs/prompt-history.md](docs/prompt-history.md)。

## 技术栈

### Frontend

- Next.js
- TypeScript
- React

### Backend

- FastAPI
- GitPython
- DeepSeek
- Tree-sitter（规划中）

## License

License 待定。

## 语言规范

RepoPilot 当前面向中国开发者。

因此：

- 用户界面（UI）使用**简体中文**
- README 使用**简体中文**
- AI 输出使用**简体中文**

而：

- API 保持英文
- Python / TypeScript 代码保持英文
- Git Commit 保持英文
- 开发文档（TASK、ALTER）保持英文

这样既符合国内开发者的使用习惯，又保持工程代码的一致性。
