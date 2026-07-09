"use client";

import { Brain, Clock, Lightbulb, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ReportInsights, ReportSectionId } from "@/types/report";
import { parseInsightsForCards } from "@/utils/reportSectionParser";

interface AIInsightsCardsProps {
  insights: ReportInsights;
  onNavigate?: (id: ReportSectionId) => void;
}

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  target?: ReportSectionId;
  onNavigate?: (id: ReportSectionId) => void;
  children: React.ReactNode;
}

function InsightCard({
  icon: Icon,
  title,
  target,
  onNavigate,
  children,
}: InsightCardProps) {
  return (
    <article
      className={`insight-card${target ? " insight-card--interactive" : ""}`}
      role={target ? "button" : undefined}
      tabIndex={target ? 0 : undefined}
      onClick={target ? () => onNavigate?.(target) : undefined}
      onKeyDown={(event) => {
        if (target && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onNavigate?.(target);
        }
      }}
    >
      <header className="insight-card__header">
        <span className="insight-card__icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <h3 className="insight-card__title">{title}</h3>
      </header>
      <div className="insight-card__body">{children}</div>
    </article>
  );
}

export default function AIInsightsCards({
  insights,
  onNavigate,
}: AIInsightsCardsProps) {
  const parsed = parseInsightsForCards(insights);

  const cards = [
    {
      icon: Lightbulb,
      title: "最大工程亮点",
      value: parsed.biggestIdea,
      target: "ai-insights" as ReportSectionId,
      type: "text" as const,
    },
    {
      icon: Star,
      title: "最重要的模块",
      value: parsed.importantModule,
      target: "core-dependencies" as ReportSectionId,
      type: "text" as const,
    },
    {
      icon: Brain,
      title: "推荐阅读顺序",
      value: "查看阅读指南",
      target: "reading-guide" as ReportSectionId,
      type: "text" as const,
    },
    {
      icon: Clock,
      title: "学习时间",
      value: parsed.learningTime,
      target: "reading-guide" as ReportSectionId,
      type: "text" as const,
    },
    {
      icon: Users,
      title: "推荐读者",
      value: parsed.audience,
      target: "overview" as ReportSectionId,
      type: "audience" as const,
    },
  ].filter((card) => card.value);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="insight-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <InsightCard
            key={card.title}
            icon={Icon}
            title={card.title}
            target={card.target}
            onNavigate={onNavigate}
          >
            {card.type === "audience" ? (
              <ul className="insight-card__tags">
                {card.value!.split(/[,，、]/).map((tag) => {
                  const trimmed = tag.trim();
                  return trimmed ? (
                    <li key={trimmed} className="insight-card__tag">
                      {trimmed}
                    </li>
                  ) : null;
                })}
              </ul>
            ) : (
              <>
                <p className="insight-card__primary">{card.value}</p>
                {card.title === "推荐阅读顺序" && (
                  <p className="insight-card__secondary">点击跳转到对应章节</p>
                )}
              </>
            )}
          </InsightCard>
        );
      })}
    </div>
  );
}
