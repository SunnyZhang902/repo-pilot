"use client";

import type { ReportInsights } from "@/types/report";
import { normalizeDifficultyLabel } from "@/utils/sanitizeMarkdown";

interface HeroProps {
  projectName: string;
  tagline: string;
  insights: ReportInsights;
  language?: string | null;
}

interface HeroStatProps {
  label: string;
  value: string;
}

function HeroStat({ label, value }: HeroStatProps) {
  return (
    <div className="report-hero__stat">
      <span className="report-hero__stat-label">{label}</span>
      <span className="report-hero__stat-value">{value}</span>
    </div>
  );
}

export default function Hero({
  projectName,
  tagline,
  insights,
  language,
}: HeroProps) {
  const difficulty = normalizeDifficultyLabel(insights.difficulty);

  return (
    <header className="report-hero">
      <div className="report-hero__main">
        <p className="report-hero__eyebrow">项目报告</p>
        <h1 className="report-hero__title">{projectName}</h1>
        <p className="report-hero__tagline">
          {tagline || "暂无项目描述"}
        </p>
      </div>
      <div className="report-hero__aside">
        <HeroStat label="主要语言" value={language ?? "—"} />
        <HeroStat label="学习难度" value={difficulty} />
        <HeroStat
          label="预计学习时间"
          value={insights.learningTime ?? "—"}
        />
        <HeroStat
          label="推荐读者"
          value={insights.audience ?? "—"}
        />
      </div>
    </header>
  );
}
