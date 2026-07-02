# RepoPilot

> **Understand any GitHub repository in 30 seconds.**

RepoPilot is **not** a GitHub repository browser.

RepoPilot is an **AI Software Onboarding Engineer**.

Its goal is to help developers understand any GitHub repository in less than 30 seconds.

Instead of simply displaying repository information, RepoPilot builds structured knowledge about a repository and lets AI explain the project.

🚧 The project is currently under active development.

## Core Features

- Import any public GitHub repository
- Fetch repository metadata
- Clone repository locally
- Parse repository structure
- Read important project documents
- Build structured repository knowledge
- Generate AI summaries
- Explain project architecture
- Recommend reading order
- Answer repository questions
- Suggest possible improvements

## Architecture

RepoPilot is designed as an **AI Knowledge Pipeline**:

```
GitHub URL
    ↓
RepositoryAnalyzer
    ↓
Metadata / Tree / Documents
    ↓
ContextBuilder
    ↓
RepositoryContext
    ↓
LLM (DeepSeek)
    ↓
AI Capabilities
```

**AI capabilities** include:

- Repository Summary
- Architecture Explanation
- Reading Guide
- Repository Chat
- Code Review
- Improvement Suggestions

## Design Principles

1. Every module has a single responsibility.
2. Parsing and AI reasoning are separated.
3. Repository knowledge is reusable across different AI tasks.
4. New AI capabilities should only require new prompts or workflows instead of re-parsing the repository.

## Planned Architecture

```
Repository
├── Metadata
├── Tree
├── Documents
└── Code Symbols (future)
        ↓
RepositoryContext
        ↓
       LLM
        ↓
Summary / Chat / Architecture / Review
```

**Code Symbols** will be implemented by a future `CodeIndexer` module.

- `FileReaderService` focuses on **documentation** — README, dependency files, Docker configs, and other project-level artifacts.
- `CodeIndexer` focuses on **source code understanding** — parsing source files, extracting symbols, and indexing functions and classes.

This separation keeps document context lightweight and code analysis deep, without mixing concerns in a single parser.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- React

### Backend

- FastAPI
- GitPython
- DeepSeek (planned)
- Tree-sitter (planned)

## Status

Sprint 4 — Knowledge Layer 🚧
