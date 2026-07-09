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

## ALTER-026 Workspace Hash Cache & Git Environment Initialization

**Target Sprint:** Benchmark & Prompt Optimization

### Reason

The previous `workspace/{owner}/{repository}/` layout deepens directory nesting on
Windows and contributes to path-length failures during clone and checkout.

A hash-based workspace provides a flat, stable cache key for future Cache, Benchmark,
Chat, and Embedding features while shortening on-disk paths.

### Solution

**WorkspaceManager** (`app/utils/workspace.py`):

- `get_cache_key(url)` → first 10 chars of `sha256(repository_url)`
- `get_workspace_path(url)` → `workspace/{cache_key}/`

**GitEnvironment** (`app/core/git_environment.py`):

- Runs once at application startup via FastAPI lifespan
- Ensures `git config --global core.longpaths true` on Windows when needed
- Failures log WARNING and do not block startup

**RepositoryCloneService**:

- All clone, cache, mkdir, and cleanup operations use `WorkspaceManager`
- Long-path clone failures return a user-safe HTTP 500 message

### Benefits

- Shorter workspace paths on Windows
- Unified workspace layout for future cache layers
- Git long-path support initialized automatically
- No API, Schema, or Frontend changes

Related: ALTER-010 (Clone Skip Logging), ALTER-023 (Repository Knowledge Cache).

Status: Completed

---

## ALTER-031 Prompt Engineering Workflow

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

Related: ALTER-032 (Prompt Evaluation Checklist), [prompt-history.md](./prompt-history.md), [benchmark/](./benchmark/).

Status: Accepted

---

## ALTER-032 Prompt Evaluation Checklist

**Target Sprint:** Benchmark & Prompt Optimization

### Reason

A unified checklist ensures every prompt version is reviewed against the same quality
bar before release, complementing numeric benchmark scores with structured human review.

### Plan

Establish a standard **Prompt Evaluation Checklist** in [evaluation-guide.md](./benchmark/evaluation-guide.md).

Every Prompt Version must pass the checklist before adoption as a production prompt.

Related: ALTER-031 (Prompt Engineering Workflow), [benchmark-template.md](./benchmark/benchmark-template.md).

Status: Accepted

---

## ALTER-033 Introduce Prompt Template Library

**Target Sprint:** Prompt Engineering

### Reason

`PromptBuilder` previously embedded prompt templates as Python multiline strings.
As prompts grow (Summary v2, Architecture, Chat, Review), inline strings become hard to
review, version, and benchmark.

### Solution

Introduce `backend/app/prompts/` as the **Prompt Template Library**:

```
backend/app/prompts/
    README.md
    summary_prompt_v1.md    # Stable
    summary_prompt_v2.md    # Experimental
```

- Prompt text lives in human-readable Markdown files
- Templates use `{{PLACEHOLDER}}` for `RepositoryKnowledge` injection
- Version history tracked in [prompt-history.md](./prompt-history.md)
- Changes require Benchmark before adoption

**Status:** Template library established. `PromptBuilder` code integration is the next step (not yet wired).

Related: ALTER-001 (Prompt Template Externalization), ALTER-021 (Prompt Versioning Framework), [prompt-v2.md](./prompt-v2.md).

Status: Completed

---

## ALTER-035 Prompt Template Externalization (PromptBuilder Integration)

**Target Sprint:** Phase 3

### Reason

Templates now exist under `backend/app/prompts/`, but `PromptBuilder` still assembles
prompts from Python strings. This ALTER tracks wiring the builder to load Markdown
templates and inject placeholders at runtime.

**Future direction:** `PromptBuilder` must **not** embed prompt content in Python.
It should only **load templates by version / capability** and render `RepositoryKnowledge`
into placeholders. This is a critical step for Prompt A/B testing, Benchmark regression,
and switching AI capabilities (Summary, Architecture, Chat, Review).

### Planned Solution

**Option A — Version-aware builder:**

```python
PromptBuilder(version="v2").build(knowledge)
```

**Option B — Explicit template loader:**

```python
PromptLoader.load("summary_prompt_v2.md")
# → load file from backend/app/prompts/
# → inject {{PLACEHOLDER}} from RepositoryKnowledge
# → return final prompt string
```

Both approaches keep prompt text out of code. Configuration or API metadata can select
`v1` vs `v2` without changing business services.

```
RepositoryKnowledge
        ↓
PromptLoader / PromptBuilder(version=...)
        ↓
backend/app/prompts/summary_prompt_v{version}.md
        ↓
Rendered prompt string
        ↓
LLMClient
```

`PromptBuilder` responsibilities after refactor:

- Load template file (by version or explicit path)
- Inject knowledge placeholders
- Return assembled prompt — **no inline prompt strings**

### Benefits

- Easier prompt iteration without code deploys
- Natural **Prompt A/B Test** (swap version via config)
- **Benchmark / regression** compares v1 vs v2 on same loader path
- **Multi-capability** — `summary_prompt_v2.md`, `architecture_prompt.md`, `chat_prompt.md` share one loader
- Cleaner architecture and collaboration (edit Markdown, not Python)

Related: ALTER-033 (Introduce Prompt Template Library), ALTER-021 (Prompt Versioning Framework), ALTER-024 (Benchmark Automation), ALTER-036 (Introduce Prompt Engine).

Status: Deferred

---

## ALTER-036 Introduce Prompt Engine

**Target Sprint:** Prompt Engine

### Reason

Prompt templates existed under `backend/app/prompts/`, but assembly still lived in
`services/prompt_builder.py` as Python string concatenation. Prompt content and
rendering logic remained coupled to the service layer.

### Solution

Introduce `backend/app/prompt/` as a pure Python **Prompt Engine**:

```
RepositorySummaryService
        ↓
  PromptBuilder
        ↓
  PromptRegistry      → summary_prompt_v2.md (filename)
        ↓
  PromptLoader        → read Markdown template (cached)
        ↓
  PromptRenderer      → inject {{PLACEHOLDER}} from RepositoryKnowledge
        ↓
  Final Prompt
        ↓
  LLMClient
```

Module responsibilities:

| Module | Role |
|--------|------|
| `PromptRegistry` | Map task/version to filename; does not read files |
| `PromptLoader` | Read `prompts/*.md`; UTF-8; in-memory cache; no knowledge |
| `PromptRenderer` | Template + knowledge → string; no prompt type awareness |
| `PromptBuilder` | Orchestration only; no embedded prompt content |

Default summary version: `DEFAULT_SUMMARY_PROMPT` in `app/core/prompt_config.py`.

Legacy `services/prompt_builder.py` removed.

### Benefits

- Prompt 与业务逻辑彻底解耦
- Enables version switching, Benchmark, and future A/B tests via config
- Pure module — no FastAPI, LLM, or service dependencies in the engine

Related: ALTER-033 (Prompt Template Library), ALTER-035 (PromptBuilder Integration — superseded by this ALTER).

Status: Completed

---

## ALTER-037 Developer Metrics Mode

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

## ALTER-038 Prompt v2 Adoption

**Target Sprint:** Benchmark & Prompt Optimization

### Reason

Prompt v2 has been implemented as `summary_prompt_v2.md` and wired through the
Prompt Engine. `DEFAULT_SUMMARY_PROMPT` is currently set to `"v2"`, but v2 remains
**Experimental** until benchmark evaluation completes.

The default prompt should only be promoted to **Stable** after benchmark repositories
consistently outperform v1 across the evaluation rubric, with no significant regressions.

### Plan

1. Run full benchmark suite on v1 and v2
2. Compare scores per repository and per metric
3. Document results in [benchmark/results/](./benchmark/results/)
4. Promote v2 to Stable only if adoption criteria met; otherwise iterate to v2.1 / v3

Related: ALTER-025 (Prompt Regression Testing), ALTER-040 (AI Onboarding Guide), [prompt-v2.md](./prompt-v2.md).

Status: Accepted

---

## ALTER-039 Repository Knowledge Extractors

**Target Sprint:** Phase 3

### Reason

`RepositoryKnowledgeBuilder` will grow as more extractors are added:

- `DependencyExtractor`
- `LanguageExtractor`
- `EntryPointExtractor`
- `ConfigurationExtractor`
- `ArchitectureExtractor`
- …

Without a clear extraction layer, the Builder becomes responsible for both
orchestration and assembly, violating Single Responsibility Principle.

### Plan

Evolve toward `RepositoryKnowledgePipeline` (see ALTER-020) with dedicated extractors
under `app/services/knowledge/` (see ALTER-015). Builder remains a pure assembler.

Related: ALTER-015, ALTER-016, ALTER-020.

Status: Deferred

---

## ALTER-040 AI Onboarding Guide

**Target Sprint:** Phase 2.5 / Phase 3

### Reason

RepoPilot's primary AI output is no longer a generic **Repository Summary**.

Prompt v2 repositions the product as an **AI Onboarding Guide** — helping developers
join a project like a new team member, not merely describing the repository.

Future capabilities (Chat, Architecture Analysis, Reading Guide, Code Review) are
extensions of this onboarding mission, not separate "summary" features.

### Plan

- Align product language: Summary API → Onboarding output
- Prompt templates and Benchmark rubrics target onboarding quality
- Frontend may evolve labels from "AI Summary" to "AI 入职指南" when UX sprint allows

Related: [prompt-v2.md](./prompt-v2.md), ALTER-038 (Prompt v2 Adoption).

Status: Accepted

---

## ALTER-041 Prompt Context Layer

**Target Sprint:** Phase 3

### Reason

The Prompt Engine decouples **template loading/rendering** from business logic, but
different AI capabilities still need different **slices** of `RepositoryKnowledge`.

Today the full knowledge block is injected into every template. Future capabilities
need selective context:

```
RepositoryKnowledge
        ↓
PromptContext          # e.g. SummaryPromptContext, ChatPromptContext
        ↓
Prompt Template
        ↓
Prompt Engine (Renderer)
        ↓
LLM
```

`PromptContext` selects, filters, and transforms knowledge before rendering —
keeping templates small and capability-specific.

Related: ALTER-022 (Prompt Context Layer), ALTER-036 (Prompt Engine).

Status: Deferred

---

## ALTER-042 Prompt v2 Benchmark Baseline

**Target Sprint:** Phase 2.5 — Prompt Engineering

### Reason

Prompt v2（AI Onboarding Guide）需要可复现的 Benchmark 证据，才能支撑 ALTER-038 中的 Stable 晋升决策。
在 Promote v2 为默认 Prompt 之前，必须对固定 Benchmark Repository Suite 建立基线评分与问题清单。

### Completed

- 对 Benchmark Suite 中 **5 / 10** 个仓库运行 Prompt v2（DeepSeek Chat），生成完整报告：
  - [repopilot.md](./benchmark/results/v2/repopilot.md)
  - [langgraph.md](./benchmark/results/v2/langgraph.md)
  - [fastapi.md](./benchmark/results/v2/fastapi.md)
  - [nextjs.md](./benchmark/results/v2/nextjs.md)
  - [django.md](./benchmark/results/v2/django.md)
- 建立 [v2 Benchmark README](./benchmark/results/v2/README.md)：平均分 **36.0 / 40**，Prompt 状态 **Experimental**
- 更新 [prompt-history.md](./prompt-history.md) Benchmark Progress 与 [TASK.md](./TASK.md) 进度

### Findings (Summary)

- v2 onboarding 结构（项目适合谁、阅读顺序、开发建议）整体优于 v1 摘要模式
- 仍存 README-centric、依赖分析不稳定、推测性内容、超大型 monorepo 深度不足等问题
- Django 得分最低（31/40），为核心 Prompt 改进优先级

### Remaining

- 完成剩余 5 个仓库 Benchmark
- v1 vs v2 同维度对比
- Prompt 迭代后重新跑分

Related: ALTER-038 (Prompt v2 Adoption), ALTER-040 (AI Onboarding Guide), [evaluation-guide.md](./benchmark/evaluation-guide.md).

Status: **Completed**（基线 Benchmark 文档；全量 Suite 与 Stable 晋升仍待后续 Sprint）

---

## ALTER-043 Introduce Prompt Issue Database

**Target Sprint:** Phase 2.5 — Prompt Quality Engineering

### Reason

Prompt v2 基线 Benchmark（ALTER-042）在 5 个仓库上暴露了多类重复问题：README-centric 输出、架构解释偏浅、阅读指南偏文件导向、依赖分析偏列举、推测性表述等。

若仅依赖各仓库 Benchmark 报告的 Weaknesses 章节驱动改进，问题难以跨版本追踪，Prompt 迭代容易回到直觉驱动。需要独立的 **Issue Database**，将仓库级观察提炼为可复用的 Prompt Issue，并建立 Open → Planned → Resolved → Verified 生命周期。

### Completed

- 创建 [prompt-issues.md](./prompt-issues.md) — 首批 5 个 Issue（PI-001 – PI-005）
- 建立 [prompt/README.md](./prompt/README.md) — Prompt 文档索引，纳入 Issue Database
- 更新 [TASK.md](./TASK.md) — Sprint Prompt Quality Engineering

### Impact

Prompt 演进由 **Issue-driven** 替代 **intuition-driven**：

- Benchmark 报告 → 发现仓库级现象
- Prompt Issue Database → 归类、定优先级、关联 Prompt Version
- 未来 Prompt Version 成功标准 = Benchmark 分数提升 + 相关 Issue Verified

Related: ALTER-042 (Prompt v2 Benchmark Baseline), ALTER-031 (Prompt Engineering Workflow), [prompt-issues.md](./prompt-issues.md).

Status: **Completed**

---

## ALTER-044 Introduce Prompt Workflow

**Target Sprint:** Phase 2.5 — Prompt Engineering Methodology

### Reason

Benchmark、Issue Database、设计、实现、Regression、Adoption 等环节此前分散在 ALTER-031、benchmark/README、prompt-issues 等多处，缺少单一的**阶段化工作流**说明。维护者与贡献者需要一份文档明确每阶段的 Purpose、Input、Output、Owner 与 Success Criteria。

### Completed

- 创建 [prompt-workflow.md](./prompt-workflow.md) — 九阶段流程与 Promotion Rule
- 更新 [prompt/README.md](./prompt/README.md) — 纳入 Core Methodology Documents

Related: ALTER-031, ALTER-043, [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md).

Status: **Completed**

---

## ALTER-045 Introduce Prompt Design Guidelines

**Target Sprint:** Phase 2.5 — Prompt Engineering Methodology

### Reason

Prompt v2 与 Benchmark 暴露了 README-centric、推测性内容、文件导向阅读指南等反模式。需要跨能力（Summary、Chat、Architecture Analysis 等）统一的**设计规范**，而非仅在单个 prompt-v2.md 中隐含约定。

### Completed

- 创建 [prompt-guidelines.md](./prompt-guidelines.md) — 12 条 Core Principles、Anti-Patterns、Future Prompt Types Checklist

Related: ALTER-040 (AI Onboarding Guide), [prompt-issues.md](./prompt-issues.md) (PI-001 – PI-005).

Status: **Completed**

---

## ALTER-046 Document Prompt Engineering Methodology

**Target Sprint:** Phase 2.5 — Prompt Engineering Methodology

### Reason

RepoPilot Phase 2.5 已具备 Prompt Engine、Benchmark Infrastructure、Issue Database 与 v2 基线结果，但缺少一份**顶层方法论**文档，说明 Prompt 开发如何作为软件工程流程运作（Benchmark First、Issue-driven、Regression、Adoption）。

### Completed

- 创建 [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md) — 哲学、架构、Engine 组件、完整生命周期、Prompt as Software
- 更新 [README.md](../README.md) — issue-driven 工作流简述
- 更新 [TASK.md](./TASK.md) — Sprint Prompt Engineering Methodology ✅

### Impact

Prompt 开发现具备完整文档链：

```
PROMPT_ENGINEERING.md (why & how)
    → prompt-workflow.md (stages)
    → prompt-guidelines.md (design rules)
    → prompt-issues.md (tracking)
    → benchmark/ (evidence)
```

Prompt 被视为**软件**而非文本：有设计、实现、测试（Benchmark）、Bug 追踪（Issue）、发布（Adoption）。

Related: ALTER-036 (Prompt Engine), ALTER-038 (Adoption), ALTER-042, ALTER-043, ALTER-044, ALTER-045.

Status: **Accepted**

---

## ALTER-047 Prompt v2.1

**Target Sprint:** Phase 2.5 — Prompt Engineering

### Reason

Prompt v2 基线 Benchmark（ALTER-042）与 [Prompt Issue Database](./prompt-issues.md) 登记了 5 个 Open Issue（PI-001 – PI-005）：README-centric 输出、架构解释偏浅、阅读指南缺学习策略、依赖分析偏列举、推测性表述。

按 [prompt-workflow.md](./prompt-workflow.md) Issue-driven 流程，在**不修改 Prompt Engine / PromptBuilder / 应用代码**的前提下，迭代 `summary_prompt_v2.md` 模板指令以 address 上述问题。

### Completed

- 更新 [summary_prompt_v2.md](../backend/app/prompts/summary_prompt_v2.md)（v2.1 内容迭代，Registry 仍为 `v2`）
- **PI-001：** README 仅作 Knowledge 来源之一；禁止逐段 paraphrase
- **PI-002：** 项目结构聚焦系统组织（Why、工程问题、模块协作）
- **PI-003：** 推荐阅读按目标分路径（使用 / 贡献 / 架构），WHY 必填
- **PI-004：** 核心依赖写协作链，Top 3–5 runtime
- **PI-005：** 低置信度用「仓库表明…」；禁止编造
- 新增 `# AI Insights` 章节；强化「项目适合谁」
- 更新 [prompt-history.md](./prompt-history.md)、[TASK.md](./TASK.md)

### Remaining

- Regression Benchmark on Found-in repos
- PI-001 – PI-005 状态 Open → Verified（待 Benchmark 证据）

Related: ALTER-042, ALTER-043, [prompt-issues.md](./prompt-issues.md), [prompt-guidelines.md](./prompt-guidelines.md).

Status: **Completed**（模板修订；Issue Verified 待 Regression）

---

## ALTER-048 Repository Understanding → Repository + Code Understanding

**Target Milestone:** Milestone V2 — Repository + Code Understanding

### Background

The current version of RepoPilot focuses on **repository-level understanding**.

It builds project reports mainly from:

- Repository structure
- README
- Documentation
- Configuration files
- Dependency manifests

This design allows RepoPilot to generate a useful onboarding report very quickly.

However, evaluation on several representative repositories
(RepoPilot, LangGraph, FastAPI, Next.js, Django)
shows a common limitation:

**Reports understand the repository, but do not truly understand the implementation.**

The system rarely explains:

- why a module is important
- how components collaborate
- real function call chains
- actual implementation details

Most architecture descriptions are inferred from documentation rather than source code.

Related: ALTER-006 (CodeIndexer), ALTER-012 (RepositoryKnowledge), ALTER-042 (Prompt v2 Benchmark Baseline), [prompt-issues.md](./prompt-issues.md) (PI-002, PI-005).

### Decision

Upgrade RepoPilot from:

**Repository Understanding**

to:

**Repository + Code Understanding**

A repository report should be generated from **both**:

- documentation
- source code

instead of documentation alone.

### Design Principles

| Layer | Responsibility |
|-------|----------------|
| **Repository Understanding** | project overview, technologies, documentation, onboarding, repository organization |
| **Code Understanding** | function analysis, class analysis, call graph, module dependency graph, implementation summary, architecture validation |

The final report should **combine both views**.

```
Repository Knowledge (docs + tree + deps)
        +
Code Knowledge (AST + graphs + symbols)
        ↓
Enhanced Onboarding Report
```

### Expected Improvements

After this upgrade RepoPilot should be able to answer questions like:

- Why is this module important?
- How does a request travel through the system?
- Which files implement the core workflow?
- Which modules have the highest coupling?
- Where should a new contributor start reading?

instead of only:

- What modules exist?

### Non-goals

The first version will **not** perform:

- semantic bug detection
- code quality scoring
- vulnerability analysis
- full static program analysis

Those features can be introduced later.

### Implementation

See [TASK.md](./TASK.md) — **Milestone V2 — Repository + Code Understanding** (Phase 1 – Phase 7).

Status: **Accepted**

---

## UI Backlog

Frontend presentation improvements tracked separately from architecture ALTERs. See also Report UI V2（Hero / Sidebar / SectionCard）.

### Hero Metadata Enhancement

**Status:** Planned — deferred to post PR2 (Report UI V2 / Information Architecture). PR2 focuses on section-level IA; Hero badge metadata is a separate productization pass.

Current Hero only displays:

- Project Name
- One-line Summary
- Difficulty
- Learning Time
- Audience
- Overall Score

Future improvements:

- Generated by RepoPilot
- Analysis Time (e.g. 32s)
- Repository Name
- Default Branch
- Last Commit Time
- Stars / Forks
- Last Updated
- Repository Size
- Language Breakdown

These metadata should be shown as **lightweight badges** instead of large cards to keep Hero clean.

Related: [TASK.md](./TASK.md) — UI → Hero Metadata Enhancement.

Status: **Planned**

---

## Guiding Principles

1. Every module should have a single responsibility.
2. Knowledge construction and AI reasoning must remain separate.
3. Prompt generation and LLM invocation should be independent.
4. Repository knowledge should be reusable across multiple AI capabilities.
5. Refactoring should improve architecture without changing external behavior.
