# RepoPilot Architecture Improvement Backlog

This document records architectural improvements that are intentionally postponed.
These are not bugs. They are planned refactors that will improve maintainability,
scalability, and AI capability as the project evolves.

---

## ALTER-001 Prompt Template Externalization

**Target Sprint:** Sprint 6

### Current

PromptBuilder stores prompt templates directly in Python.

### Problem

As more AI capabilities are added (Summary, Architecture, Chat, Review, Reading Guide),
prompt templates will become large and difficult to maintain.

### Planned Solution

Move prompts into Markdown template files.

Example:

```
backend/prompts/
  summary.md
  architecture.md
  chat.md
  review.md
  reading_guide.md
```

PromptBuilder will become responsible only for:

- loading templates
- filling placeholders
- returning the final prompt

Benefits:

- Easier prompt iteration
- Cleaner Python code
- Model-specific prompts become possible
- Multi-language prompts become possible

Status: Planned

---

## ALTER-002 Prompt Registry

**Target Sprint:** Sprint 6

### Current

PromptBuilder dispatches using if statements.

### Planned Solution

Replace conditional logic with a registry.

Example:

```
PromptType -> Builder Function
```

Benefits:

- Open for extension
- Easier to add new prompt types
- Cleaner architecture

Status: Planned

---

## ALTER-003 Knowledge Registry

**Target Sprint:** Sprint 6

### Current

Document type mappings are stored inside RepositoryFileReaderService.

### Planned Solution

Move shared repository knowledge definitions into:

```
app/core/knowledge.py
```

Example:

- document types
- supported documents
- language mappings

Benefits:

- Single source of truth
- Shared by FileReader, PromptBuilder, CodeIndexer and future modules

Status: Planned

---

## ALTER-004 Stable Document Ordering

**Target Sprint:** Sprint 7

### Current

PromptBuilder renders documents in the order returned by FileReader.

### Planned Solution

Always sort documents before generating prompts.

Recommended order:

1. README
2. package
3. python_config
4. requirements
5. docker
6. compose
7. makefile
8. environment

Benefits:

- Stable prompts
- More consistent LLM outputs
- Easier testing

Status: Planned

---

## ALTER-005 Repository Tree Truncation

**Target Sprint:** Sprint 7

### Current

PromptBuilder renders the complete repository tree.

### Problem

Large repositories may exceed the LLM context window.

### Planned Solution

Introduce configurable tree truncation.

Example:

```
...
(remaining 523 files omitted)
```

Benefits:

- Smaller prompts
- Better scalability
- Predictable prompt size

Status: Planned

---

## ALTER-006 CodeIndexer

**Target Sprint:** Sprint 8

### Goal

Separate documentation understanding from source code understanding.

Current pipeline:

```
Repository
    ↓
Metadata / Tree / Documents
```

Future pipeline:

```
Repository
├── Metadata
├── Tree
├── Documents
└── Code Symbols
        ↓
RepositoryContext
        ↓
       LLM
```

Responsibilities:

**FileReader**

- README
- package files
- configuration files
- project documentation

**CodeIndexer**

- classes
- functions
- imports
- entry points
- module relationships
- code symbols

Benefits:

- Better repository understanding
- Richer AI context
- Enables architecture analysis and repository chat

Status: Planned

---

## ALTER-007 Workflow Layer

**Target Sprint:** Sprint 9

### Current

API routes directly coordinate service calls.

### Planned Solution

Introduce a dedicated Workflow layer.

Example:

```
API
    ↓
RepositoryWorkflow
    ↓
Services
```

Benefits:

- Cleaner controllers
- Easier orchestration
- Better support for multi-step AI workflows

Status: Planned

---

## ALTER-008 RepositoryContext Knowledge Layering

**Target Sprint:** Sprint 9

### Current

`RepositoryContext` uses a flat structure:

```
RepositoryContext
├── metadata
├── tree
└── documents
```

### Problem

As more knowledge sources are added (CodeIndexer, dependency analysis, architecture inference),
a flat context model becomes harder to extend. Each new capability adds another top-level field,
and the boundary between "structure" and "understanding" becomes unclear.

### Planned Solution

Introduce a nested `Knowledge` layer inside `RepositoryContext`:

```
RepositoryContext
├── metadata
└── knowledge
    ├── documents
    ├── code_symbols
    ├── dependencies
    └── architecture
```

Example schema direction:

```python
class RepositoryKnowledge(BaseModel):
    documents: list[RepositoryDocument]
    code_symbols: list[CodeSymbol]       # from CodeIndexer
    dependencies: list[Dependency]       # from package/requirements analysis
    architecture: ArchitectureHint | None  # inferred or generated structure

class RepositoryContext(BaseModel):
    metadata: RepositoryMetadata
    knowledge: RepositoryKnowledge
```

The file tree (`RepositoryNode`) may move under `knowledge` or remain a separate field —
to be decided during implementation alongside CodeIndexer integration.

### Benefits

- Clear separation between repository identity (`metadata`) and accumulated understanding (`knowledge`)
- Natural home for CodeIndexer output without flattening the context model
- Easier to extend with new knowledge types (e.g. test coverage, CI config) without schema churn
- PromptBuilder can target specific knowledge slices (`knowledge.documents`, `knowledge.code_symbols`)

Status: Planned

---

## ALTER-009 RepositoryAnalyzer → RepositoryWorkflow

**Target Sprint:** Sprint 9

### Current

`RepositoryAnalyzer` orchestrates the repository preparation pipeline:

```
RepositoryAnalyzer
├── GitHub Metadata
├── Clone Repository
└── Parse Repository
```

It lives under `app/services/` alongside low-level services such as `GitHubService`
and `RepositoryCloneService`, but its role is fundamentally different — it coordinates
multiple steps rather than performing a single operation.

### Problem

As the pipeline grows, `RepositoryAnalyzer` will accumulate more orchestration concerns:

- Code indexing (`CodeIndexer`)
- Repository caching
- Dependency analysis
- Incremental re-indexing

Continuing to treat it as a regular Service blurs the boundary between **workflow orchestration**
and **single-responsibility services**. API routes and AI services should not need to know
the internal step order of repository preparation.

This overlaps with ALTER-007 (Workflow Layer) but focuses specifically on the evolution
of the existing `RepositoryAnalyzer` rather than introducing workflow from scratch.

### Planned Solution

Evolve `RepositoryAnalyzer` into `RepositoryWorkflow`:

```
app/workflows/repository_workflow.py

class RepositoryWorkflow:
    async def prepare(url: str) -> RepositoryAnalysis
    async def index(local_path: str) -> RepositoryKnowledge   # future
    async def get_or_prepare(url: str) -> RepositoryAnalysis  # cache-aware, future
```

Pipeline direction:

```
GitHub URL
    ↓
RepositoryWorkflow
    ├── GitHubService          (metadata)
    ├── RepositoryCloneService (clone)
    ├── RepositoryParserService (tree)
    ├── CodeIndexer            (symbols, future)
    ├── CacheLayer             (future)
    └── DependencyAnalyzer     (future)
    ↓
RepositoryAnalysis / RepositoryContext
```

`RepositoryAnalyzer` would be renamed or replaced; timing instrumentation (`Timer`)
remains at the workflow layer, not inside individual services.

### Benefits

- Clear naming: Workflow orchestrates, Services execute
- Natural extension point for Index, Cache, and Dependencies without bloating a "Service"
- API layer calls one workflow instead of chaining multiple services
- Aligns with ALTER-007 and prepares for ALTER-008 (Knowledge Layering)

Status: Planned

---

## ALTER-010 Clone Skip Logging

**Target Sprint:** Phase 2 Sprint 2

### Current

When a repository already exists in the workspace, `RepositoryCloneService` returns
immediately without cloning. The workflow-level `Timer` still logs:

```
Clone Repository completed in 0.00s
```

This is misleading — no clone occurred; the local workspace was reused.

### Problem

Performance logs should reflect **what actually happened**, not just elapsed time.
A `0.00s` completion gives no signal whether the repository was cloned, cached, or skipped.

As caching and incremental indexing are added (ALTER-007, Sprint 7), distinguishable
log messages become essential for debugging pipeline behavior.

### Planned Solution

Return clone outcome from `RepositoryCloneService` so the orchestration layer can log accurately.

Example:

```python
class CloneResult(BaseModel):
    local_path: str
    cloned: bool  # True = fresh clone, False = workspace already existed

async def clone_repository(url: str) -> CloneResult:
    if local_path.exists():
        return CloneResult(local_path=str(local_path), cloned=False)
    ...
    return CloneResult(local_path=str(local_path), cloned=True)
```

Workflow / Timer layer logging:

| Outcome | Log message |
|---------|-------------|
| Skipped | `Repository already cloned, skipping.` |
| Fresh clone | `Clone Repository completed in 2.31s` |

Alternative message for skip path: `Workspace exists, skipping clone.`

Logging stays at the **orchestration layer** (RepositoryAnalyzer / RepositoryWorkflow),
not inside `RepositoryCloneService` — the service returns outcome; the workflow decides what to log.

### Benefits

- Logs immediately reveal cache hits vs fresh clones
- Easier debugging when pipeline feels "too fast"
- Prepares for explicit cache layer without changing log format again

Status: Planned

---

## ALTER-011 LLMClient → LLMGateway

**Target Sprint:** Phase 2 Sprint 5

### Current

`LLMClient` wraps a single DeepSeek Chat Completions call:

```
LLMClient
├── configuration (API key, model, timeout, base URL)
├── network request
├── model invocation
└── error handling
```

It lives under `app/services/` with a name that suggests a thin HTTP wrapper,
but its responsibilities already span configuration, transport, and failure recovery.

### Problem

As LLM capabilities grow, `LLMClient` will need to support:

- Streaming responses
- Tool / function calling
- JSON mode
- Multiple model providers (DeepSeek, OpenAI, local models)
- Retry and rate-limit policies

A class named `LLMClient` no longer reflects its role as the **unified entry point**
for all model interactions across Summary, Chat, Architecture, and Review workflows.

### Planned Solution

Evolve `LLMClient` into `LLMGateway` (or `LLMProvider`):

```
app/core/llm_gateway.py   # or app/services/llm_gateway.py

class LLMGateway:
    async def complete(prompt: str, ...) -> str
    async def stream(prompt: str, ...) -> AsyncIterator[str]   # future
    async def complete_json(prompt: str, schema: ...) -> dict  # future
```

Infrastructure concerns stay in the gateway; business services (`RepositorySummaryService`,
future Chat service) call the gateway without knowing provider details.

PromptBuilder and RepositorySummaryService remain unchanged at the call site —
only the underlying implementation is renamed and extended.

### Benefits

- Name matches responsibility: gateway to all LLM capabilities, not a single HTTP client
- Natural home for streaming, tool calling, and multi-provider support
- Keeps AI transport separate from prompt construction and business orchestration
- Aligns with Design Principle #3: prompt generation and LLM invocation stay independent

Status: Planned

---

## ALTER-012 RepositoryKnowledge

**Target Sprint:** Phase 2 Sprint 3

### Current

`PromptBuilder` directly consumes `RepositoryContext`:

```
RepositoryContext (metadata + tree + documents)
        ↓
PromptBuilder
        ↓
LLM Prompt
```

`PromptBuilder` must understand raw repository data structures — file trees,
document lists, metadata fields — and decide how to format each for the LLM.

### Problem

As knowledge sources grow (CodeIndexer, dependencies, architecture hints),
`PromptBuilder` becomes a formatter for **raw pipeline output** rather than
**curated knowledge**. Prompt logic and data shape become tightly coupled.

Every new knowledge type requires changes inside `PromptBuilder` instead of
extending a knowledge model.

### Planned Solution

Introduce `RepositoryKnowledge` as an intermediate layer between context assembly
and prompt generation:

```
RepositoryContext
        ↓
KnowledgeBuilder (future)
        ↓
RepositoryKnowledge
        ↓
PromptBuilder
        ↓
LLM Prompt
```

`RepositoryKnowledge` holds LLM-ready, normalized knowledge slices — summarized
documents, indexed symbols, dependency graphs — rather than raw file contents
and unprocessed trees.

`PromptBuilder` should not understand raw repository data; it only formats
`RepositoryKnowledge` into prompts.

Related: ALTER-008 (RepositoryContext Knowledge Layering).

Status: Planned

---

## ALTER-013 CodeIndexer

**Target Sprint:** Phase 2 Sprint 3

### Current

Source code is represented only as a file tree (`RepositoryNode`) inside
`RepositoryContext`. No symbols, functions, classes, or import relationships
are extracted.

### Planned Solution

Introduce a dedicated indexing layer:

```
Repository (local path)
        ↓
CodeIndexer
        ↓
RepositoryKnowledge (code_symbols)
        ↓
PromptBuilder / RAG retrieval
```

**CodeIndexer** responsibilities:

- Parse source files (Python, TypeScript, etc.)
- Extract classes, functions, imports
- Identify entry points
- Build module relationship graph

**Purpose:**

- Reduce prompt size (send symbols instead of full files)
- Improve retrieval accuracy for Chat and Q&A
- Support future RAG pipelines

Related: ALTER-006 (CodeIndexer overview), ALTER-012 (RepositoryKnowledge).

Status: Planned

---

## ALTER-014 LLMProvider

**Target Sprint:** Phase 2 Sprint 5

### Current

`LLMClient` is hard-wired to DeepSeek via `AsyncOpenAI` with a fixed base URL.

### Problem

Production deployments may require switching or combining providers:

- DeepSeek
- OpenAI
- Ollama (local)
- Qwen
- Claude

Business services (`RepositorySummaryService`, future Chat service) should not
need changes when the underlying provider changes.

### Planned Solution

Rename `LLMClient` to `LLMProvider` with a provider-agnostic interface:

```python
class LLMProvider:
    async def complete(prompt: str, temperature: float = 0.2) -> str
    async def stream(prompt: str, ...) -> AsyncIterator[str]   # future
```

Provider selection driven by configuration:

```
LLM_PROVIDER=deepseek   # or openai, ollama, qwen, claude
```

Each provider implements the same interface; business logic remains unchanged.

Related: ALTER-011 (LLMClient → LLMGateway — overlapping concern; consolidate during implementation).

Status: Planned

---

## ALTER-015 Knowledge Extractor Package

**Target Sprint:** Phase 2 Sprint 6

### Reason

The number of Repository Knowledge extractors will continue to grow:

- `DependencyExtractor`
- `EntryPointExtractor`
- `LanguageExtractor`
- `ConfigurationExtractor`
- `ArchitectureExtractor`
- …

To keep the project modular and discoverable, move all repository knowledge extractors into:

```
app/services/knowledge/
    dependency_extractor.py
    entry_point_extractor.py
    language_extractor.py
    ...
```

This is a **structural refactor only**. No behavior changes.

Import paths update; extraction logic, public APIs, and test coverage remain identical.

Related: ALTER-003 (Knowledge Registry), ALTER-012 (RepositoryKnowledge).

Status: Deferred

---

## ALTER-016 Dependency Injection for RepositoryKnowledgeBuilder

**Target Sprint:** Phase 2 Sprint 6

### Reason

`RepositoryKnowledgeBuilder` should not instantiate `DependencyExtractor`,
`EntryPointExtractor`, `LanguageExtractor`, or other extractors internally.

Instead, dependencies should be injected through the constructor:

```python
class RepositoryKnowledgeBuilder:
    def __init__(
        self,
        dependency_extractor: DependencyExtractor,
        entry_point_extractor: EntryPointExtractor,
        language_extractor: LanguageExtractor,
        ...
    ) -> None:
        ...
```

### Benefits

- Easier testing (mock individual extractors in isolation)
- Better extensibility (swap or add extractors without modifying the builder)
- Lower coupling between orchestration and extraction logic
- Clear orchestration responsibilities — the builder assembles; extractors extract

Related: ALTER-015 (Knowledge Extractor Package), ALTER-012 (RepositoryKnowledge).

Status: Deferred

---

## ALTER-019 RepositoryAnalyzer → RepositoryPipelineService

**Target Sprint:** Phase 2 Sprint 6

### Reason

`RepositoryAnalyzer` has evolved into the orchestration entry point for the entire
Repository Pipeline — it no longer only performs "analyze".

Related: ALTER-009 (RepositoryAnalyzer → RepositoryWorkflow), ALTER-007 (Workflow Layer).

Status: Deferred

---

## ALTER-020 Introduce RepositoryKnowledgePipeline

**Target Sprint:** Phase 2 Sprint 6

### Reason

`RepositoryKnowledgeBuilder` currently coordinates multiple Extractors while also
assembling `RepositoryKnowledge`.

As the number of Extractors grows, a dedicated `RepositoryKnowledgePipeline` should
handle orchestration while the Builder remains responsible for object assembly only.

Related: ALTER-015 (Knowledge Extractor Package), ALTER-016 (Dependency Injection for RepositoryKnowledgeBuilder).

Status: Deferred

---

## ALTER-021 Prompt Versioning Framework

**Target Sprint:** Phase 3

### Reason

`PromptBuilder` will gradually support multiple prompt types — Summary, Architecture,
Chat, Reading Guide, Code Review, and more.

A **Prompt Version** mechanism (e.g. v1, v2, v3) is recommended to enable continuous
prompt iteration while keeping the API stable.

### Plan

- Version prompts independently of API contracts
- Allow callers or configuration to select prompt version
- Track version in summary metadata for reproducibility and debugging

Related: ALTER-001 (Prompt Template Externalization), ALTER-002 (Prompt Registry), ALTER-012 (RepositoryKnowledge).

Status: Deferred

---

## ALTER-022 Prompt Context Layer

**Target Sprint:** Phase 2 Sprint 7

### Reason

`PromptBuilder` should remain responsible only for rendering prompt templates.

Selection, filtering, and transformation of `RepositoryKnowledge` should be handled
by dedicated **PromptContext** objects:

```
RepositoryKnowledge
        ↓
SummaryPromptContext      # selects metadata, top-level tree, readme doc
        ↓
PromptBuilder             # renders template with prepared variables
        ↓
LLM Prompt
```

Different AI capabilities produce different context slices from the same knowledge:

| Capability | PromptContext |
|------------|---------------|
| Summary | `SummaryPromptContext` |
| Architecture | `ArchitecturePromptContext` |
| Chat | `ChatPromptContext` |
| Reading Guide | `ReadingGuidePromptContext` |

### Benefits

- Keeps `PromptBuilder` small — template rendering only
- Allows different AI capabilities to reuse `RepositoryKnowledge` differently
- Filtering logic (document ordering, tree truncation) lives in context objects, not templates
- Easier to test prompt inputs independently of template format

Related: ALTER-001 (Prompt Template Externalization), ALTER-012 (RepositoryKnowledge).

Status: Deferred

---

## ALTER-023 Repository Knowledge Cache

**Target Sprint:** Phase 2 Sprint 7

### Reason

`RepositoryKnowledge` generation will become more expensive as additional extractors
are introduced (`DependencyExtractor`, `EntryPointExtractor`, `LanguageExtractor`,
`CodeIndexer`, etc.).

Each Summary or Chat request currently re-runs the full extraction pipeline even when
the underlying repository has not changed.

### Planned Solution

Persist generated knowledge alongside the cloned repository:

```
workspace/
    langchain-ai/
        langgraph/
            .repopilot/
                knowledge.json
```

Future updates compare the current Git commit hash against the hash stored in the cache
to determine whether knowledge should be regenerated:

```
Clone / cache hit
        ↓
Read HEAD commit hash
        ↓
Cache exists and hash matches? → load knowledge.json
Cache missing or hash differs?  → regenerate and persist
```

### Benefits

- Faster Summary generation on repeat requests
- Instant Repository Chat startup for cached repositories
- Reduced repeated parsing and extraction across AI capabilities
- Knowledge reused across Summary, Chat, Architecture, and Review without re-extraction

Related: ALTER-010 (Clone Skip Logging), ALTER-012 (RepositoryKnowledge), Sprint 7 Scalability tasks.

Status: Deferred

---

## ALTER-024 Benchmark Automation

**Target Sprint:** Phase 3

### Reason

Manual benchmark runs do not scale as the repository list and prompt versions grow.
A scripted workflow is needed to run evaluations consistently and produce comparable reports.

### Planned Solution

```
python benchmark.py
    ↓
Run all benchmark repositories
    ↓
Save Markdown outputs
    ↓
Record generation time
    ↓
Generate report
```

### Benefits

- Repeatable benchmark execution with one command
- Automated artifact collection for prompt history
- Performance tracking alongside quality scores
- Foundation for prompt regression testing

Related: [repositories.md](./benchmark/repositories.md), [evaluation-guide.md](./benchmark/evaluation-guide.md), ALTER-025 (Prompt Regression Testing), Phase 2.5 Product Validation.

Status: Deferred

---

## ALTER-025 Prompt Regression Testing

**Target Sprint:** Phase 3

### Reason

Each prompt change can improve one dimension while regressing another. Without
automated comparison, teams rely on subjective review and miss subtle quality drops.

This is a common **prompt regression testing** practice in AI product development.

### Planned Solution

```
Prompt v5
    ↓
Run Benchmark
    ↓
Prompt v4
    ↓
Diff
    ↓
Report (e.g. tech stack improved, reading guide degraded)
```

Compare rubric scores and outputs across prompt versions before adopting a new prompt.

### Benefits

- Detect regressions before release
- Per-metric diff (project understanding, tech stack, reading guide, etc.)
- Data-driven prompt iteration instead of guesswork
- Pairs with ALTER-024 (Benchmark Automation), [repositories.md](./benchmark/repositories.md), and [evaluation-guide.md](./benchmark/evaluation-guide.md)

Status: Deferred

---

## ALTER-026 Prompt Engineering Workflow

**Target Sprint:** Benchmark & Prompt Optimization

### Reason

Prompt changes must be traceable and measurable. Without a fixed workflow, multiple
behaviors may change in a single edit, making it impossible to attribute benchmark
improvements or regressions to a specific change.

### Workflow

```
Benchmark
    ↓
Problem Analysis
    ↓
Single Improvement
    ↓
New Prompt Version
    ↓
Regression Benchmark
```

Avoid modifying multiple prompt behaviors in one release — each version should isolate
one major improvement so benchmark results clearly indicate what worked.

Related: ALTER-027 (Prompt Evaluation Checklist), [prompt-history.md](./prompt-history.md), [benchmark/](./benchmark/).

Status: Accepted

---

## ALTER-027 Prompt Evaluation Checklist

**Target Sprint:** Benchmark & Prompt Optimization

### Reason

A unified checklist ensures every prompt version is reviewed against the same quality
bar before release, complementing numeric benchmark scores with structured human review.

### Plan

Establish a standard **Prompt Evaluation Checklist** in [evaluation-guide.md](./benchmark/evaluation-guide.md).

Every Prompt Version must pass the checklist before adoption as a production prompt.

Related: ALTER-026 (Prompt Engineering Workflow), [benchmark-template.md](./benchmark/benchmark-template.md).

Status: Accepted

---

## ALTER-028 Prompt Template Externalization

**Target Sprint:** Phase 3

### Reason

`PromptBuilder` currently stores prompt templates directly in Python.

As prompt complexity increases, templates should be moved into a dedicated `prompts/`
directory (e.g. `summary.md`, `architecture.md`, `chat.md`, `review.md`).

`PromptBuilder` should only be responsible for template rendering and variable injection.

### Benefits

- Easier prompt iteration
- Cleaner architecture
- Better collaboration
- Version management

Related: ALTER-001 (Prompt Template Externalization), ALTER-021 (Prompt Versioning Framework), ALTER-024 (Benchmark Automation).

Status: Deferred

---

## ALTER-029 Developer Metrics Mode

**Target Sprint:** Phase 3

### Reason

Performance metrics such as:

- Clone Time
- Parse Time
- Knowledge Build Time
- Prompt Build Time
- LLM Time
- Total Time

should eventually be displayed in an optional **Developer Mode** panel instead of
only backend logs.

This feature is intended for development and debugging, not for normal end users.

Status: Deferred

---

## Guiding Principles

1. Every module should have a single responsibility.
2. Knowledge construction and AI reasoning must remain separate.
3. Prompt generation and LLM invocation should be independent.
4. Repository knowledge should be reusable across multiple AI capabilities.
5. Refactoring should improve architecture without changing external behavior.
