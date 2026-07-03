# RepoPilot Roadmap

---

# Phase 1 - Foundation ✅

## Sprint 1 - Project Initialization

- [x] GitHub repository setup
- [x] README
- [x] PRD
- [x] Project structure

## Sprint 2 - Frontend & Backend Scaffolding

- [x] Next.js frontend initialization
- [x] FastAPI backend initialization
- [x] CORS configuration

## Sprint 3 - Repository Import

- [x] Repository import API
- [x] GitHub metadata fetch (`GitHubService`)
- [x] Repository clone (`RepositoryCloneService`)
- [x] File tree parser (`RepositoryParserService`)
- [x] Frontend repository dashboard

## Sprint 4 - Knowledge Layer

- [x] `RepositoryDocument` schema
- [x] `RepositoryContext` schema
- [x] `RepositoryFileReaderService`
- [x] `ContextBuilder`
- [x] `RepositoryAnalyzer`

## Sprint 5 - AI Summary Pipeline

- [x] `PromptBuilder`
- [x] `RepositorySummaryService`
- [x] Summary API (`POST /api/repositories/summary`)
- [x] Service naming refactor (Infrastructure / Repository Business Layer)
- [x] Architecture documentation (`docs/ALTER.md`)

---

## Milestone

✅ **First Production AI Pipeline Completed**

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

---

# Phase 2 - AI Capability

## Sprint 2 - Production LLM ✅

- [x] DeepSeek Configuration
- [x] `LLMClient`
- [x] Repository Summary API
- [x] Performance Logging

## Sprint 3 - Knowledge Layer

- [ ] `RepositoryKnowledge`
- [ ] `CodeIndexer`
- [ ] README Summarization
- [ ] Prompt Optimization
- [ ] Context Cache

## Sprint 4 - Repository Chat

- [ ] Repository Q&A
- [ ] Context retrieval
- [ ] Multi-turn conversation

## Sprint 5 - Code Intelligence

- [ ] Symbol extraction
- [ ] Function & class indexing
- [ ] Entry point detection
- [ ] Symbol graph

## Sprint 6 - Architecture Analysis

- [ ] Architecture Summary
- [ ] Reading Guide
- [ ] Repository navigation

## Sprint 7 - Testing

- [ ] Unit test `RepositoryParserService`
- [ ] Unit test `RepositoryFileReaderService`
- [ ] Unit test `PromptBuilder`
- [ ] API test Summary endpoint
- [ ] Integration test AI pipeline

## Sprint 8 - Open Source Release

- [ ] Deployment
- [ ] Performance optimization
- [ ] Documentation
- [ ] Open source release
