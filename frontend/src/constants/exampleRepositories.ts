export interface ExampleRepository {
  label: string;
  url: string;
}

export const EXAMPLE_REPOSITORIES: ExampleRepository[] = [
  {
    label: "RepoPilot（本项目）",
    url: "https://github.com/zyZhang/repo-pilot",
  },
  {
    label: "LangGraph（AI Agent 框架）",
    url: "https://github.com/langchain-ai/langgraph",
  },
  {
    label: "FastAPI（Python Web 框架）",
    url: "https://github.com/tiangolo/fastapi",
  },
  {
    label: "Next.js（React 全栈框架）",
    url: "https://github.com/vercel/next.js",
  },
];
