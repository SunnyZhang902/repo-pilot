# Benchmark Results

该目录用于保存 RepoPilot 各版本 Prompt 在不同 Repository 上的 Benchmark 结果。

## Directory Layout

每个 Prompt Version 使用独立目录：

```
results/
    v1/
    v2/
    v3/
```

## Usage

- 每次完整 Benchmark 运行后，将各 Repository 的输出保存至对应版本目录
- 单条结果可使用 [result-template.md](./result-template.md) 作为格式参考
- 版本级概览写在各版本目录下的 `README.md`（如 [v1/README.md](./v1/README.md)）

## Related Documents

- [../benchmark-template.md](../benchmark-template.md) — 单次 Benchmark 报告模板（流程用）
- [../evaluation-guide.md](../evaluation-guide.md) — 评分标准与 Checklist
- [../../prompt-history.md](../../prompt-history.md) — Prompt 版本与 Benchmark 历史
