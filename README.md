# RepoPilot

> **30 秒读懂新项目。**

输入 GitHub 仓库地址，自动生成结构化项目报告，帮助开发者快速理解陌生代码仓库。

🚧 RepoPilot 正在积极开发中。

## 产品预览

> （预留截图位置）

- 首页：`docs/images/home.png`
- 项目报告：`docs/images/report.png`

## 功能特性

✅ GitHub 仓库导入  
✅ Repository Clone  
✅ Repository Structure Analysis  
✅ Repository Document Understanding  
✅ Repository Knowledge Builder  
✅ Prompt Engine  
✅ Prompt Template Library  
✅ Prompt Version Management  
✅ Benchmark Framework  
🚧 Code Understanding  
🚧 Repository Knowledge Graph  
🚧 Repository Chat  

## How It Works

```text
GitHub Repository
        ↓
Clone Repository
        ↓
Repository Analysis
        ↓
Knowledge Builder
        ↓
Prompt Engine
        ↓
LLM
        ↓
项目报告
```

RepoPilot 将 GitHub 仓库自动转换为结构化知识，再生成项目报告。

## Architecture

RepoPilot 采用分层架构：从仓库导入到知识构建，再到项目报告生成。

```text
Infrastructure
        ↓
Repository Layer
        ↓
Knowledge Layer
        ↓
Prompt Engine
        ↓
LLM
        ↓
Frontend
```

- **Infrastructure**：管理配置、日志、运行环境与基础能力。
- **Repository Layer**：负责仓库导入、克隆、结构解析与文档读取。
- **Knowledge Layer**：将仓库信息整理为可用于报告生成的结构化知识。
- **Prompt Engine**：将仓库知识注入稳定的 Prompt 模板。
- **LLM**：基于结构化上下文生成项目报告。
- **Frontend**：提供首页输入、分析进度与分页项目报告阅读体验。

详细模块设计请查看 [开发文档](#开发文档)。

## Quick Start

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

### Phase 1

✅ Repository Understanding

### Phase 2

🚧 Code Understanding

### Phase 3

- Architecture Analysis
- Dependency Graph
- Repository Chat

### Phase 4

- Knowledge Graph
- Incremental Analysis
- Multi-language Support

## Prompt Engineering

RepoPilot 使用 **Issue-driven Prompt Engineering**。

所有 Prompt 更新必须经过：

```text
Benchmark
        ↓
Issue Review
        ↓
Regression
        ↓
Stable
```

详细设计见 [docs/PROMPT_ENGINEERING.md](docs/PROMPT_ENGINEERING.md)。

## Benchmark

当前 Benchmark Repository Suite：

- FastAPI
- Next.js
- LangGraph
- Django
- Cooking（控制组）

所有 Prompt 更新必须通过 Benchmark 才能成为 Stable。

相关文档：

- [docs/benchmark/](docs/benchmark/)
- [docs/prompt-history.md](docs/prompt-history.md)
- [docs/prompt-issues.md](docs/prompt-issues.md)

## 开发文档

README 只介绍产品与入口，详细设计文档请查看：

- [docs/TASK.md](docs/TASK.md)
- [docs/ALTER.md](docs/ALTER.md)
- [docs/PROMPT_ENGINEERING.md](docs/PROMPT_ENGINEERING.md)
- [docs/benchmark/](docs/benchmark/)
- [docs/prompt-history.md](docs/prompt-history.md)

## 技术栈

### Frontend

- Next.js
- React
- TypeScript
- Framer Motion

### Backend

- FastAPI
- GitPython
- DeepSeek
- Tree-sitter（规划中）

## Development Philosophy

```text
Repository
        ↓
Knowledge
        ↓
Prompt
        ↓
Benchmark
        ↓
User Feedback
        ↓
Iteration
```

RepoPilot 更关注理解质量、可维护性和产品体验，而不是快速堆叠功能。

## License

License 待定。

## 语言规范

RepoPilot 当前面向中国开发者。

因此：

- 用户界面（UI）使用**简体中文**
- README 使用**简体中文**
- 项目报告使用**简体中文**

而：

- API 保持英文
- Python / TypeScript 代码保持英文
- Git Commit 保持英文
- 开发文档（TASK、ALTER）保持英文

这样既符合国内开发者的使用习惯，又保持工程代码的一致性。
