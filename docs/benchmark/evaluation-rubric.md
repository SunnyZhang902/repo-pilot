# Evaluation Rubric

Unified scoring standard for RepoPilot summary quality.

**Every Prompt iteration must use the same rubric.** Do not change criteria between
versions without updating this document and re-benchmarking all prior versions for comparison.

---

## Scoring Scale

Each metric is scored **0**, **1**, or **2**.

| Score | Meaning |
|-------|---------|
| **0** | Incorrect, missing, or misleading |
| **1** | Partially correct or incomplete |
| **2** | Accurate and sufficient for onboarding |

---

## Metrics

### Project Understanding (0–2)

Does the summary correctly describe what the project does, who it is for, and its core purpose?

| Score | Criteria |
|-------|----------|
| 0 | Wrong project type, purpose, or audience |
| 1 | General idea correct but missing key context |
| 2 | Clear, accurate project overview suitable for a new developer |

---

### Technology Stack (0–2)

Does the summary identify the primary languages, frameworks, and runtime correctly?

| Score | Criteria |
|-------|----------|
| 0 | Major stack elements wrong or absent |
| 1 | Some technologies correct; important ones missing or wrong |
| 2 | Primary stack accurately identified |

---

### Dependency Understanding (0–2)

Does the summary reflect important dependencies and their roles (not just a raw list)?

| Score | Criteria |
|-------|----------|
| 0 | Dependencies ignored or misrepresented |
| 1 | Mentions dependencies without explaining relevance |
| 2 | Key dependencies identified with meaningful context |

---

### Repository Structure (0–2)

Does the summary reflect how the codebase is organized (modules, layers, entry points)?

| Score | Criteria |
|-------|----------|
| 0 | Structure wrong or not addressed |
| 1 | Surface-level layout only; misses important areas |
| 2 | Useful structural overview that aids navigation |

---

### Reading Guide Quality (0–2)

Does the recommended reading order help a new developer onboard efficiently?

| Score | Criteria |
|-------|----------|
| 0 | No reading guide or guide is misleading |
| 1 | Generic order without project-specific rationale |
| 2 | Actionable, logical reading path tied to the repository |

---

## Total Score

| Component | Max |
|-----------|-----|
| Project Understanding | 2 |
| Technology Stack | 2 |
| Dependency Understanding | 2 |
| Repository Structure | 2 |
| Reading Guide Quality | 2 |
| **Total** | **10** |

---

## Evaluation Template

Use this block when scoring a single summary (copy per repository per run):

```markdown
### {owner}/{repo} — Prompt {version}

| Metric | Score | Notes |
|--------|-------|-------|
| Project Understanding | | |
| Technology Stack | | |
| Dependency Understanding | | |
| Repository Structure | | |
| Reading Guide Quality | | |
| **Total** | **/10** | |
```

Record aggregate runs in [benchmark-results.md](./benchmark-results.md).
