# Repository Benchmark Suite

RepoPilot 使用固定的 Benchmark Repository 来评估 AI Summary 的质量。

## 原则

- Repository 尽量保持稳定
- Prompt 更新后重复测试
- 保证不同 Prompt Version 可以横向比较

---

## Benchmark Repositories

| Category | Repository | URL | Status |
|----------|------------|-----|--------|
| Self Project | RepoPilot | https://github.com/SunnyZhang902/repo-pilot | Evaluated (v2) |
| AI Framework | LangGraph | https://github.com/langchain-ai/langgraph | Evaluated (v2) |
| Python Web | FastAPI | https://github.com/fastapi/fastapi | Evaluated (v2) |
| Frontend | Next.js | https://github.com/vercel/next.js | Evaluated (v2) |
| Python Framework | Django | https://github.com/django/django | Evaluated (v2) |
| Java | Spring PetClinic | https://github.com/spring-projects/spring-petclinic | Pending |
| Go | Gin | https://github.com/gin-gonic/gin | Pending |
| Rust | Tokio | https://github.com/tokio-rs/tokio | Pending |
| C++ | fmt | https://github.com/fmtlib/fmt | Pending |
| AI Library | LangChain | https://github.com/langchain-ai/langchain | Pending |

---

## Related Documents

- [benchmark-template.md](./benchmark-template.md) — 单次 Benchmark 报告模板
- [evaluation-guide.md](./evaluation-guide.md) — 评分标准说明
- [../prompt-history.md](../prompt-history.md) — Prompt 版本演进记录
