import type { ReportInsights, ReportSectionId } from "@/types/report";

export type SectionRenderType =
  | "markdown"
  | "ai-insights"
  | "tech-stack-grid"
  | "dependency-graph"
  | "learning-timeline"
  | "recommendation-timeline"
  | "summary-panel";

export interface SectionMeta {
  title: string;
  subtitle: string;
}

export interface TechStackItem {
  name: string;
  description: string;
  icon: string;
}

export interface DependencyNode {
  label: string;
  detail?: string;
}

export interface TimelineStep {
  title: string;
  description?: string;
}

export interface RecommendationWeek {
  label: string;
  content: string;
}

export interface ParsedSummary {
  overall: string;
  bestFor: string[];
  rating: number;
}

const SECTION_META: Record<ReportSectionId, SectionMeta> = {
  overview: {
    title: "概览",
    subtitle: "快速了解这个项目",
  },
  "project-summary": {
    title: "项目简介",
    subtitle: "项目定位与核心价值",
  },
  "tech-stack": {
    title: "技术栈",
    subtitle: "依赖库与运行时环境",
  },
  "core-dependencies": {
    title: "核心依赖",
    subtitle: "各组件如何协同工作",
  },
  architecture: {
    title: "架构",
    subtitle: "系统组织与模块设计",
  },
  "reading-guide": {
    title: "阅读指南",
    subtitle: "推荐的学习路径",
  },
  "development-guide": {
    title: "开发建议",
    subtitle: "面向新贡献者的实操建议",
  },
  "ai-insights": {
    title: "项目洞察",
    subtitle: "分析得出的关键结论",
  },
  conclusion: {
    title: "总结",
    subtitle: "总体评估与学习价值",
  },
};

const SECTION_RENDER_TYPE: Record<ReportSectionId, SectionRenderType> = {
  overview: "markdown",
  "project-summary": "markdown",
  "tech-stack": "tech-stack-grid",
  "core-dependencies": "dependency-graph",
  architecture: "markdown",
  "reading-guide": "learning-timeline",
  "development-guide": "recommendation-timeline",
  "ai-insights": "ai-insights",
  conclusion: "summary-panel",
};

const TECH_ICONS: [RegExp, string][] = [
  [/python/i, "🐍"],
  [/fastapi|flask|django|rails/i, "⚡"],
  [/deepseek|openai|llm|gpt|langchain|langgraph/i, "🧠"],
  [/git/i, "📦"],
  [/next\.?js|react|vue|angular/i, "⚛"],
  [/typescript|javascript|node/i, "📘"],
  [/rust/i, "🦀"],
  [/go\b|golang/i, "🔷"],
  [/java(?!script)/i, "☕"],
  [/docker|kubernetes/i, "🐳"],
  [/postgres|redis|sqlite|mysql/i, "🗄"],
  [/starlette|uvicorn|asgi|wsgi/i, "🚀"],
  [/pydantic/i, "📐"],
];

export function getSectionMeta(id: ReportSectionId): SectionMeta {
  return SECTION_META[id];
}

export function getSectionRenderType(id: ReportSectionId): SectionRenderType {
  return SECTION_RENDER_TYPE[id];
}

export function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^[-*✔✘]\s*/, "")
    .replace(/\s*\|\s*$/, "")
    .trim();
}

function pickTechIcon(name: string): string {
  for (const [pattern, icon] of TECH_ICONS) {
    if (pattern.test(name)) {
      return icon;
    }
  }
  return "📌";
}

export function parseTechStackItems(content: string): TechStackItem[] {
  const items: TechStackItem[] = [];

  for (const line of content.split("\n")) {
    const bulletMatch = line.match(
      /^[-*]\s+\*\*(.+?)\*\*\s*[—–\-:]+\s*(.+)$/,
    );
    if (bulletMatch) {
      const name = stripMarkdownInline(bulletMatch[1]);
      items.push({
        name,
        description: stripMarkdownInline(bulletMatch[2]),
        icon: pickTechIcon(name),
      });
      continue;
    }

    const plainMatch = line.match(/^[-*]\s+\*\*(.+?)\*\*\s*(.*)$/);
    if (plainMatch) {
      const name = stripMarkdownInline(plainMatch[1]);
      items.push({
        name,
        description: stripMarkdownInline(plainMatch[2]) || name,
        icon: pickTechIcon(name),
      });
    }
  }

  return items;
}

export function parseDependencyNodes(content: string): DependencyNode[] {
  const nodes: DependencyNode[] = [];

  for (const line of content.split("\n")) {
    const numbered = line.match(
      /^\d+\.\s+\*\*(.+?)\*\*\s*[—–\-:]+\s*(.+)$/,
    );
    if (numbered) {
      nodes.push({
        label: stripMarkdownInline(numbered[1]),
        detail: stripMarkdownInline(numbered[2]),
      });
      continue;
    }

    const numberedPlain = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
    if (numberedPlain) {
      nodes.push({ label: stripMarkdownInline(numberedPlain[1]) });
      continue;
    }

    const bullet = line.match(/^[-*]\s+\*\*(.+?)\*\*\s*[—–\-:]+\s*(.+)$/);
    if (bullet) {
      nodes.push({
        label: stripMarkdownInline(bullet[1]),
        detail: stripMarkdownInline(bullet[2]),
      });
    }
  }

  return nodes;
}

const STEP_HEADER =
  /^(?:#{1,4}\s*)?(?:\*\*)?(?:第([一二三四五六七八九十\d]+)[步周]|Step\s*(\d+))(?:[：:]?\s*(.+?))?(?:\*\*)?\s*$/i;

const CN_NUM: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function parseStepNumber(raw: string): number {
  if (/^\d+$/.test(raw)) {
    return Number.parseInt(raw, 10);
  }
  return CN_NUM[raw] ?? 0;
}

export function parseLearningSteps(content: string): TimelineStep[] {
  const blocks = content.split(/\n---+\n/);
  const steps: TimelineStep[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (!lines.length) {
      continue;
    }

    let title = "";
    const bodyLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const headerMatch = trimmed.match(STEP_HEADER);
      if (headerMatch && !title) {
        const num = headerMatch[1] ?? headerMatch[2];
        const rest = headerMatch[3]?.trim();
        title = rest
          ? stripMarkdownInline(rest)
          : `Step ${parseStepNumber(num) || steps.length + 1}`;
        continue;
      }

      const numbered = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*/);
      if (numbered && !title) {
        title = stripMarkdownInline(numbered[1]);
        continue;
      }

      if (trimmed.startsWith("**阅读对象：**") || trimmed.startsWith("**为什么")) {
        bodyLines.push(stripMarkdownInline(trimmed.replace(/^\*\*[^*]+：\*\*\s*/, "")));
        continue;
      }

      if (trimmed && !trimmed.startsWith("|")) {
        bodyLines.push(stripMarkdownInline(trimmed));
      }
    }

    if (title) {
      steps.push({
        title,
        description: bodyLines.slice(0, 3).join(" ").trim() || undefined,
      });
    }
  }

  if (steps.length === 0) {
    for (const line of content.split("\n")) {
      const numbered = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
      if (numbered) {
        steps.push({ title: stripMarkdownInline(numbered[1]) });
      }
    }
  }

  return steps;
}

const WEEK_PATTERN =
  /^(?:#{1,4}\s*)?(?:\*\*)?(?:第([一二三四五六七八九十\d]+)周|Week\s*(\d+)|Second\s+Week|Third\s+Week)(?:[：:]?\s*(.+?))?(?:\*\*)?\s*$/i;

export function parseRecommendationWeeks(content: string): RecommendationWeek[] {
  const weeks: RecommendationWeek[] = [];
  let current: RecommendationWeek | null = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    const weekMatch = trimmed.match(WEEK_PATTERN);

    if (weekMatch) {
      if (current) {
        weeks.push(current);
      }
      let label = "";
      if (weekMatch[0].toLowerCase().includes("second")) {
        label = "Week 2";
      } else if (weekMatch[0].toLowerCase().includes("third")) {
        label = "Week 3";
      } else {
        const num = weekMatch[1] ?? weekMatch[2];
        label = num ? `第 ${parseStepNumber(num)} 周` : trimmed;
      }
      if (weekMatch[3]?.trim()) {
        label = `${label} — ${stripMarkdownInline(weekMatch[3])}`;
      }
      current = { label, content: "" };
      continue;
    }

    if (current && trimmed && !trimmed.startsWith("#")) {
      current.content += `${current.content ? "\n" : ""}${trimmed}`;
    }
  }

  if (current) {
    weeks.push(current);
  }

  return weeks;
}

export function ratingToStars(rating: string): number {
  if (/高|极高|easy|简单/i.test(rating)) {
    return 4;
  }
  if (/中|medium/i.test(rating)) {
    return 3;
  }
  if (/低|偏高|hard|困难/i.test(rating)) {
    return 2;
  }
  return 3;
}

export function parseSummaryPanel(
  content: string,
  insights: ReportInsights,
  overallRating: string,
): ParsedSummary {
  const lines = content.split("\n").filter((line) => line.trim());
  const overallParts: string[] = [];
  const bestFor: string[] = [];

  for (const line of lines) {
    const bullet = line.match(/^[-*]\s+\*\*(.+?)\*\*[：:]\s*(.+)$/);
    if (bullet) {
      overallParts.push(`${stripMarkdownInline(bullet[1])}：${stripMarkdownInline(bullet[2])}`);
      continue;
    }
    if (line.match(/^[-*]\s+/)) {
      overallParts.push(stripMarkdownInline(line.replace(/^[-*]\s+/, "")));
    } else if (!line.startsWith("#")) {
      overallParts.push(stripMarkdownInline(line));
    }
  }

  if (insights.audience) {
    for (const part of insights.audience.split(/[,，、]/)) {
      const trimmed = part.trim();
      if (trimmed) {
        bestFor.push(trimmed);
      }
    }
  }

  if (bestFor.length === 0) {
    bestFor.push("后端工程师", "开源学习者");
  }

  return {
    overall: overallParts.join("\n\n") || stripMarkdownInline(content).slice(0, 500),
    bestFor: bestFor.slice(0, 5),
    rating: ratingToStars(overallRating),
  };
}

export function preprocessCallouts(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      const calloutMatch = line.match(
        /^>\s*\**(?:NOTE|WHY|IMPORTANT|Tip|Warning|TIPS?)[:：]\**\s*(.*)$/i,
      );
      if (calloutMatch) {
        const kind = line.match(/NOTE|WHY|IMPORTANT|Tip|Warning/i)?.[0] ?? "Note";
        return `> [CALLOUT:${kind}] ${calloutMatch[1]}`;
      }
      return line;
    })
    .join("\n");
}

export function parseInsightsForCards(insights: ReportInsights): {
  biggestIdea?: string;
  importantModule?: string;
  difficulty?: string;
  difficultyDetail?: string;
  audience?: string;
  learningTime?: string;
} {
  let difficulty = insights.difficulty;
  let difficultyDetail: string | undefined;

  if (difficulty?.includes("—") || difficulty?.includes("-")) {
    const [level, ...rest] = difficulty.split(/[—–-]/);
    difficulty = level.trim();
    difficultyDetail = rest.join("-").trim();
  } else if (difficulty && difficulty.length > 20) {
    difficultyDetail = difficulty;
    difficulty = difficulty.split(/[，,。]/)[0];
  }

  return {
    ...insights,
    difficulty,
    difficultyDetail,
  };
}
