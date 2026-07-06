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

## Guiding Principles

1. Every module should have a single responsibility.
2. Knowledge construction and AI reasoning must remain separate.
3. Prompt generation and LLM invocation should be independent.
4. Repository knowledge should be reusable across multiple AI capabilities.
5. Refactoring should improve architecture without changing external behavior.
