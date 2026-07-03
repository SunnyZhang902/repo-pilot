# RepoPilot

> **Understand any GitHub repository in 30 seconds.**

RepoPilot is an **AI-powered Repository Understanding Platform**.

It is **not** a GitHub repository browser. RepoPilot is an **AI Software Onboarding Engineer** — it builds structured knowledge about a repository and uses AI to explain the project to developers in less than 30 seconds.

🚧 The project is currently under active development.

## Current Workflow

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
Repository Context
        ↓
  Prompt Builder
        ↓
  DeepSeek LLM
        ↓
Repository Summary
```

## Architecture

RepoPilot follows a layered architecture. Each layer has a single responsibility; upper layers orchestrate, lower layers execute.

### Infrastructure Layer

| Module | Role |
|--------|------|
| `Config` | Centralized settings (API keys, model, timeout) |
| `Logger` | Project-wide logging (`RepoPilot`) |
| `Timer` | Performance timing for pipeline stages |

### Repository Layer

| Module | Role |
|--------|------|
| `GitHubService` | Fetch repository metadata from GitHub API |
| `RepositoryCloneService` | Clone repository into local workspace |
| `RepositoryParserService` | Build recursive file tree |
| `RepositoryFileReaderService` | Read project documents (README, configs) |
| `RepositoryAnalyzer` | Orchestrate metadata → clone → parse |

### Knowledge Layer

| Module | Role |
|--------|------|
| `ContextBuilder` | Assemble `RepositoryContext` from analysis + documents |
| `PromptBuilder` | Build structured LLM prompts from context |

### AI Layer

| Module | Role |
|--------|------|
| `LLMClient` | DeepSeek Chat Completions integration |
| `RepositorySummaryService` | Generate AI repository summaries |

### API Layer

| Module | Role |
|--------|------|
| FastAPI Endpoints | `POST /api/repositories/import`, `POST /api/repositories/summary` |

## Current Features

✅ **Completed**

- GitHub Metadata
- Repository Clone
- Repository Parser
- Document Reader
- Context Builder
- Prompt Builder
- DeepSeek Integration
- Repository Summary API
- Performance Logging
- Workspace Cache

## Next Roadmap

- Knowledge Layer enhancements
- Repository Q&A
- Code Search
- Architecture Analysis
- Code Review

## Design Principles

1. Every module has a single responsibility.
2. Parsing and AI reasoning are separated.
3. Repository knowledge is reusable across different AI tasks.
4. New AI capabilities should only require new prompts or workflows instead of re-parsing the repository.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- React

### Backend

- FastAPI
- GitPython
- DeepSeek
- Tree-sitter (planned)

## Status

✅ First Production AI Pipeline Completed — Phase 2 Sprint 2 in progress

See [docs/TASK.md](docs/TASK.md) for the full roadmap and [docs/ALTER.md](docs/ALTER.md) for planned architectural improvements.
