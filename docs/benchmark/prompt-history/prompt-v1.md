# Prompt v1

Baseline prompt version history record. Use this file as a template for `prompt-v2.md`, `prompt-v3.md`, etc.

---

## Version

`v1`

---

## Date

_To be recorded when the first formal benchmark run is completed._

---

## Objective

Document the initial production summary prompt used by `PromptBuilder` for repository onboarding summaries in Simplified Chinese.

Goals for v1:

- Produce structured Markdown output for new developers
- Cover project overview, technology stack, dependencies, structure, and reading order
- Keep code identifiers and project names in English

---

## Prompt Changes

_Initial baseline — no prior version to compare._

| Area | Description |
|------|-------------|
| Prompt source | `backend/app/services/prompt_builder.py` |
| Prompt type | `PromptType.SUMMARY` |
| Output language | Simplified Chinese |
| Section structure | 项目简介, 技术栈, 核心依赖, 项目结构, 推荐阅读顺序, 总结 |

_Detail specific template or section changes here when v1 is formally locked for benchmark._

---

## Benchmark Result

_To be filled after the first full benchmark pass._

| Metric | Value |
|--------|-------|
| Repositories tested | |
| Average score (/10) | |
| Average generation time | |
| Run date | |
| Log reference | [benchmark-results.md](../benchmark-results.md) |

---

## Known Issues

_Document observed weaknesses after benchmark — do not pre-fill._

-

---

## Future Improvements

_Candidate changes for v2 — to be informed by benchmark and user validation._

-

---

## Related Documents

- [evaluation-rubric.md](../evaluation-rubric.md)
- [benchmark-repositories.md](../benchmark-repositories.md)
- [benchmark-results.md](../benchmark-results.md)
