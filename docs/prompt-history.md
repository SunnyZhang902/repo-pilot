# Prompt History

Prompt 演进记录。每次 Prompt 版本变更后更新本节，并与 [benchmark/](benchmark/) 中的 Benchmark 结果对应。

---

# Prompt Evolution Strategy

RepoPilot **不采用**一次修改多个 Prompt 行为的策略。

**原则：One Prompt Version → One Major Improvement**

| Version | Planned Focus |
|---------|---------------|
| Prompt v2 | Reduce README Copying |
| Prompt v3 | Better Reading Order |
| Prompt v4 | Improve Architecture Understanding |
| Prompt v5 | Shorter Summary |

每个 Prompt Version 应尽可能只引入**一个主要变化**，方便 Benchmark 判断改动收益。

See also: ALTER-026 (Prompt Engineering Workflow), [evaluation-guide.md](benchmark/evaluation-guide.md).

---

## Prompt Benchmark History

| Version | Benchmark | Status |
|---------|-----------|--------|
| v1 | Initial Benchmark | 🚧 In Progress |
| v2 | Pending | - |
| v3 | Pending | - |

每个 Prompt Version 完成后，都应进行完整 Benchmark，并将结果保存至 [benchmark/results/](benchmark/results/)。

---

## Prompt v1

**Status:** Current

**Features:**

- RepositoryKnowledge
- 中文 Markdown 输出
- 技术栈分析
- 核心依赖分析
- 项目结构分析
- 推荐阅读顺序
- 项目总结

**Notes:**

First production-ready prompt.

---

## Prompt v2

(TODO)

---

## Prompt v3

(TODO)
