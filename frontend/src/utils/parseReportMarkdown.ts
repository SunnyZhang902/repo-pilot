import type {
  ParsedReport,
  ReportInsights,
  ReportSection,
  ReportSectionId,
} from "@/types/report";
import { stripMarkdownInline } from "@/utils/reportSectionParser";

const HEADER_TO_SECTION: Record<string, ReportSectionId> = {
  项目简介: "project-summary",
  项目适合谁: "overview",
  技术栈: "tech-stack",
  核心依赖: "core-dependencies",
  项目结构: "architecture",
  推荐阅读顺序: "reading-guide",
  开发建议: "development-guide",
  "AI Insights": "ai-insights",
  "AI 洞察": "ai-insights",
  总结: "conclusion",
};

const SECTION_TITLES: Record<ReportSectionId, string> = {
  overview: "概览",
  "project-summary": "项目简介",
  "tech-stack": "技术栈",
  "core-dependencies": "核心依赖",
  architecture: "架构",
  "reading-guide": "阅读指南",
  "development-guide": "开发建议",
  "ai-insights": "项目洞察",
  conclusion: "总结",
};

const NAV_ORDER: ReportSectionId[] = [
  "overview",
  "project-summary",
  "tech-stack",
  "core-dependencies",
  "architecture",
  "reading-guide",
  "development-guide",
  "ai-insights",
  "conclusion",
];

function firstMeaningfulLine(content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    if (trimmed.startsWith("|") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      continue;
    }
    return stripMarkdownInline(trimmed);
  }
  return "";
}

function extractInsights(content: string): ReportInsights {
  const insights: ReportInsights = {};
  const patterns: [keyof ReportInsights, RegExp][] = [
    [
      "biggestIdea",
      /\|\s*\*\*(?:Biggest Engineering Idea|最大工程思想)\*\*\s*\|\s*(.+)/i,
    ],
    [
      "importantModule",
      /\|\s*\*\*(?:Most Important Module|最重要模块)\*\*\s*\|\s*(.+)/i,
    ],
    [
      "difficulty",
      /\|\s*\*\*(?:Learning Difficulty|学习难度)\*\*\s*\|\s*(.+)/i,
    ],
    [
      "audience",
      /\|\s*\*\*(?:Recommended Audience|推荐读者)\*\*\s*\|\s*(.+)/i,
    ],
    [
      "learningTime",
      /\|\s*\*\*(?:Estimated Learning Time|预计学习时间)\*\*\s*\|\s*(.+)/i,
    ],
  ];

  for (const line of content.split("\n")) {
    for (const [key, pattern] of patterns) {
      const match = line.match(pattern);
      if (match) {
        insights[key] = stripMarkdownInline(match[1]);
      }
    }
  }

  return insights;
}

function deriveOverallRating(conclusion: string, insights: ReportInsights): string {
  const combined = `${conclusion} ${insights.difficulty ?? ""}`;
  if (/极高|很高|高|Easy|简单/i.test(combined) && !/中高|中等/.test(combined)) {
    return "高";
  }
  if (/中|Medium/i.test(combined)) {
    return "中";
  }
  if (/低|偏高|Hard|困难/i.test(combined)) {
    return "偏低";
  }
  return "—";
}

function extractFrameworkHint(techStack: string): string | undefined {
  const match = techStack.match(/\*\*(.+?)\*\*/);
  return match ? stripMarkdownInline(match[1]) : firstMeaningfulLine(techStack);
}

function extractArchitectureHint(architecture: string): string | undefined {
  const line = firstMeaningfulLine(architecture);
  if (!line) {
    return undefined;
  }
  const firstClause = line.split(/[，,。；;：:]/)[0].trim() || line;
  if (firstClause.length > 40) {
    return `${firstClause.slice(0, 38)}…`;
  }
  return firstClause;
}

function splitMarkdownSections(markdown: string): Map<ReportSectionId, string> {
  const chunks = new Map<ReportSectionId, string[]>();
  let currentId: ReportSectionId | null = null;

  for (const line of markdown.split("\n")) {
    const headerMatch = line.match(/^#\s+(.+?)\s*$/);
    if (headerMatch) {
      const title = headerMatch[1].trim();
      currentId = HEADER_TO_SECTION[title] ?? null;
      if (currentId && !chunks.has(currentId)) {
        chunks.set(currentId, []);
      }
      continue;
    }

    if (currentId) {
      chunks.get(currentId)?.push(line);
    }
  }

  const merged = new Map<ReportSectionId, string>();
  for (const [id, lines] of chunks) {
    merged.set(id, lines.join("\n").trim());
  }

  return merged;
}

export function parseReportMarkdown(markdown: string): ParsedReport {
  const chunks = splitMarkdownSections(markdown);

  if (chunks.size === 0) {
    return {
      sections: [
        {
          id: "project-summary",
          title: SECTION_TITLES["project-summary"],
          content: markdown.trim(),
        },
      ],
      tagline: firstMeaningfulLine(markdown),
      insights: {},
      overallRating: "—",
    };
  }

  const sections: ReportSection[] = NAV_ORDER.filter((id) => chunks.has(id)).map(
    (id) => ({
      id,
      title: SECTION_TITLES[id],
      content: chunks.get(id) ?? "",
    }),
  );

  const projectSummary = chunks.get("project-summary") ?? "";
  const techStack = chunks.get("tech-stack") ?? "";
  const architecture = chunks.get("architecture") ?? "";
  const aiInsightsContent = chunks.get("ai-insights") ?? "";
  const conclusion = chunks.get("conclusion") ?? "";

  const insights = extractInsights(aiInsightsContent);
  const overview = chunks.get("overview") ?? "";

  if (!insights.audience && overview) {
    insights.audience = firstMeaningfulLine(overview).slice(0, 120) || undefined;
  }

  return {
    sections,
    tagline: firstMeaningfulLine(projectSummary),
    insights,
    overallRating: deriveOverallRating(conclusion, insights),
    frameworkHint: extractFrameworkHint(techStack),
    architectureHint: extractArchitectureHint(architecture),
  };
}
