# Evaluation Guide

RepoPilot 的 Benchmark 用于评估 **Prompt 质量**，而非评价底层 LLM 模型本身。
同一组 Benchmark Repository、同一套评分标准，应在每次 Prompt 迭代后重复使用。

评分细则见 [benchmark-template.md](./benchmark-template.md) 中的 Evaluation 表格。

---

## Scoring Scale (1–5)

| Score | Meaning |
|-------|---------|
| **5** | 非常准确，可直接作为项目介绍 |
| **4** | 基本准确，仅有少量遗漏 |
| **3** | 可用，但缺少重要信息 |
| **2** | 明显存在错误 |
| **1** | 基本不可用 |

---

## Evaluation Items

| Item | What to Check |
|------|---------------|
| **Project Overview** | 项目用途、目标用户、核心功能是否准确 |
| **Technology Stack** | 主要语言、框架、运行时是否识别正确 |
| **Core Dependencies** | 关键依赖是否列出，并体现其作用 |
| **Repository Structure** | 目录与模块划分是否有助于理解代码组织 |
| **Reading Order** | 推荐阅读顺序是否合理、可执行 |
| **Markdown Formatting** | 标题结构、列表、代码块等 Markdown 格式是否规范 |
| **Overall Accuracy** | 综合判断：新开发者能否据此快速上手 |

---

## Purpose

Benchmark 的目的不是评价模型，而是评价 **Prompt 的质量**。

- 固定 Repository → 控制变量
- 固定评分标准 → 结果可比较
- 跨 Prompt Version 对比 → 发现回归与改进

每次 Prompt 变更后，应对全部 Benchmark Repository 重新跑分，并与上一版本对比后再决定是否采纳。

---

## Prompt Evaluation Checklist

每次 Prompt 更新，都建议按照以下 Checklist 进行人工 Review：

- [ ] 使用简体中文
- [ ] Markdown 输出格式正确
- [ ] 项目名称保持英文
- [ ] 技术栈识别准确
- [ ] 核心依赖识别准确
- [ ] Repository Structure 描述合理
- [ ] 推荐阅读顺序合理
- [ ] 未直接复制 README
- [ ] 未编造不存在的信息
- [ ] 总结适合首次阅读项目的新开发者

See ALTER-032 (Prompt Evaluation Checklist).

---

## Related Documents

- [repositories.md](./repositories.md) — Benchmark 仓库列表
- [benchmark-template.md](./benchmark-template.md) — 单次报告模板
- [../prompt-history.md](../prompt-history.md) — Prompt 版本记录
