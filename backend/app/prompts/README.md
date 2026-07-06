# RepoPilot Prompt Library

用于存放 RepoPilot 所有 AI Prompt 模板。

Prompt 文本存放在本目录（Markdown）；运行时由 `backend/app/prompt/` 中的 **Prompt Engine** 加载并渲染。

---

## Prompt Runtime Architecture

```
RepositorySummaryService
        ↓
  PromptBuilder          (backend/app/prompt/prompt_builder.py)
        ↓
  PromptRegistry         → e.g. summary_prompt_v2.md
        ↓
  PromptLoader           → read this directory (*.md, cached)
        ↓
  PromptRenderer         → inject {{PLACEHOLDER}} from RepositoryKnowledge
        ↓
  Final Prompt
        ↓
  LLMClient
```

| 模块 | 职责 |
|------|------|
| **PromptRegistry** | `task` + `version` → 文件名；不读文件 |
| **PromptLoader** | 读取本目录模板；UTF-8；内存缓存 |
| **PromptRenderer** | 占位符替换；不感知 Prompt 类型 |
| **PromptBuilder** | 编排上述三步；**不包含** Prompt 正文 |

默认 Summary 版本：`DEFAULT_SUMMARY_PROMPT`（见 `app/core/prompt_config.py`）。

---

## 原则

- **Prompt 与代码分离** — Prompt 正文仅在本目录 Markdown 文件中
- **一个 Prompt 一个文件** — 每种能力独立文件，职责清晰
- **每个 Prompt 有独立版本** — 文件名含版本号，如 `summary_prompt_v1.md`
- **Prompt 修改必须同步更新** [docs/prompt-history.md](../../docs/prompt-history.md)
- **Prompt 修改需要经过 Benchmark** — 见 [docs/benchmark/](../../docs/benchmark/)

---

## 当前 Prompt

| 文件 | 能力 | Status |
|------|------|--------|
| [summary_prompt_v1.md](./summary_prompt_v1.md) | Repository Summary（Onboarding 摘要） | **Stable** |
| [summary_prompt_v2.md](./summary_prompt_v2.md) | AI Onboarding Guide（入职指南） | **Default runtime** |

---

## 占位符约定

模板中使用 `{{PLACEHOLDER}}`，由 `PromptRenderer` 在运行时替换：

| 占位符 | 来源 |
|--------|------|
| `{{REPOSITORY_METADATA}}` | `RepositoryKnowledge.metadata` |
| `{{LANGUAGES}}` | `RepositoryKnowledge.languages` |
| `{{DEPENDENCIES}}` | `RepositoryKnowledge.dependencies` |
| `{{ENTRY_POINTS}}` | `RepositoryKnowledge.entry_points` |
| `{{CONFIGURATION_FILES}}` | `RepositoryKnowledge.configuration_files` |
| `{{REPOSITORY_STRUCTURE}}` | `RepositoryKnowledge.tree` |
| `{{PROJECT_DOCUMENTS}}` | `RepositoryKnowledge.documents` |

---

## 未来 Prompt（TODO）

| 文件 | 能力 | Status |
|------|------|--------|
| `architecture_prompt.md` | Architecture Summary | TODO |
| `chat_prompt.md` | Repository Chat | TODO |
| `review_prompt.md` | Code Review | TODO |

---

## 相关文档

- [docs/prompt-v2.md](../../docs/prompt-v2.md) — Prompt v2 设计说明
- [docs/prompt-history.md](../../docs/prompt-history.md) — 版本演进记录
- ALTER-033 — Introduce Prompt Template Library
- ALTER-036 — Introduce Prompt Engine
