# RepoPilot Benchmark

This directory contains the benchmark framework for evaluating repository understanding
quality, prompt effectiveness, and generation performance across RepoPilot releases.

RepoPilot prioritizes **measurable prompt quality** instead of subjective judgement.
Every prompt change should be validated against the same repositories, the same rubric,
and the same recording format before adoption.

---

## Why Benchmark Exists

The core AI pipeline can produce summaries that *look* correct while missing important
details about technology stack, dependencies, structure, or reading order.

Without a fixed benchmark:

- Prompt improvements cannot be compared objectively
- Regressions are hard to detect
- User feedback becomes anecdotal rather than reproducible

The benchmark exists to make prompt iteration **repeatable, comparable, and auditable**.

---

## Benchmark Workflow

```
Repository
    ↓
Generate Summary
    ↓
Evaluate
    ↓
Find Problems
    ↓
Improve Prompt
    ↓
Generate New Version
    ↓
Regression Benchmark
```

Benchmark 的目的不是评价模型，而是评价 **Prompt 的质量**。

---

## Repository Selection

Benchmark repositories are defined in [repositories.md](./repositories.md).

Requirements:

- Fixed list — the same repositories are used for every prompt iteration
- Multi-ecosystem coverage — Python, JavaScript, Go, Rust, Java, C++, AI frameworks, frontend, and more
- Stable references — prefer well-known, actively maintained open-source projects

Do not change the benchmark list casually. Add or remove repositories only with a
documented reason in the repository table **Status** / **Notes** columns.

---

## Evaluation Process

1. Select a **Prompt Version** (see [prompt-history.md](../prompt-history.md))
2. Run the summary pipeline against every benchmark repository
3. Fill in [benchmark-template.md](./benchmark-template.md) for each repository
4. Score each summary using [evaluation-guide.md](./evaluation-guide.md)
5. Compare scores against the previous prompt version

Every evaluation must use the same rubric. Do not adjust scoring criteria mid-iteration.

---

## Prompt Iteration Workflow

```
Prompt v1
    ↓
Benchmark (all repositories)
    ↓
Score (evaluation guide)
    ↓
Document results (benchmark-template.md + prompt-history.md)
    ↓
Identify issues → revise prompt
    ↓
Prompt v2
    ↓
Benchmark again
    ↓
Compare scores before adoption
```

**Rule:** No prompt change is adopted without a completed benchmark run and documented comparison.

---

## Benchmark Results

所有 Benchmark 输出统一保存至：

[docs/benchmark/results/](./results/)

每个 Prompt Version 独立存放：

```
results/
    v1/
    v2/
    v3/
```

方便后续进行 **Regression Benchmark** 与 **Prompt Evolution** 对比。

---

## Directory Contents

| File | Purpose |
|------|---------|
| [repositories.md](./repositories.md) | Fixed benchmark repository list |
| [benchmark-template.md](./benchmark-template.md) | Single-run report template |
| [evaluation-guide.md](./evaluation-guide.md) | Scoring criteria (1–5 scale) |
| [benchmark-results.md](./benchmark-results.md) | Aggregate run log (legacy template) |
| [evaluation-rubric.md](./evaluation-rubric.md) | Alternate rubric (0–2 scale, legacy) |
| [prompt-history/](./prompt-history/) | Per-version detail records |
| [../prompt-history.md](../prompt-history.md) | Prompt version changelog |
| [results/](./results/) | Per-version benchmark output archive |
| [results/result-template.md](./results/result-template.md) | Single-repository result template |

---

## Status

🚧 **In Progress** — Benchmark & Prompt Optimization sprint active.
Repository list and templates are ready; formal benchmark runs and Prompt v2 optimization pending.
