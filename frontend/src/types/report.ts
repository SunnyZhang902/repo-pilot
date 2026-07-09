export type ReportSectionId =
  | "overview"
  | "project-summary"
  | "tech-stack"
  | "core-dependencies"
  | "architecture"
  | "reading-guide"
  | "development-guide"
  | "ai-insights"
  | "conclusion";

export interface ReportSection {
  id: ReportSectionId;
  title: string;
  content: string;
}

export interface ReportInsights {
  biggestIdea?: string;
  importantModule?: string;
  difficulty?: string;
  audience?: string;
  learningTime?: string;
}

export interface ParsedReport {
  sections: ReportSection[];
  tagline: string;
  insights: ReportInsights;
  overallRating: string;
  frameworkHint?: string;
  architectureHint?: string;
}

export interface QuickFactsData {
  language?: string;
  framework?: string;
  architecture?: string;
  difficulty?: string;
  learningTime?: string;
  repositorySize?: string;
}

export const REPORT_NAV_ITEMS: {
  id: ReportSectionId;
  label: string;
}[] = [
  { id: "overview", label: "概览" },
  { id: "project-summary", label: "项目简介" },
  { id: "tech-stack", label: "技术栈" },
  { id: "core-dependencies", label: "核心依赖" },
  { id: "architecture", label: "架构" },
  { id: "reading-guide", label: "阅读指南" },
  { id: "development-guide", label: "开发建议" },
  { id: "ai-insights", label: "项目洞察" },
  { id: "conclusion", label: "总结" },
];
