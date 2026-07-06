export const ANALYSIS_STAGES = [
  { id: "fetching_metadata", label: "获取仓库信息" },
  { id: "downloading", label: "下载仓库" },
  { id: "analyzing_structure", label: "分析项目结构" },
  { id: "generating_summary", label: "AI 正在生成总结" },
] as const;

export type AnalysisStageId = (typeof ANALYSIS_STAGES)[number]["id"];
