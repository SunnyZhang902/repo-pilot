"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import AIInsightsCards from "@/components/report/AIInsightsCards";
import DependencyGraph from "@/components/report/DependencyGraph";
import Hero from "@/components/report/Hero";
import LearningTimeline from "@/components/report/LearningTimeline";
import QuickFacts from "@/components/report/QuickFacts";
import RecommendationTimeline from "@/components/report/RecommendationTimeline";
import SectionCard, {
  SectionFallback,
  SectionMarkdown,
} from "@/components/report/SectionCard";
import Sidebar from "@/components/report/Sidebar";
import SummaryPanel from "@/components/report/SummaryPanel";
import TechStackGrid from "@/components/report/TechStackGrid";
import type { RepositoryMetadata } from "@/types/repository";
import type { QuickFactsData, ReportSection, ReportSectionId } from "@/types/report";
import { parseReportMarkdown } from "@/utils/parseReportMarkdown";
import {
  getSectionRenderType,
  parseDependencyNodes,
  parseLearningSteps,
  parseRecommendationWeeks,
  parseSummaryPanel,
  parseTechStackItems,
} from "@/utils/reportSectionParser";

interface ReportLayoutProps {
  markdown: string;
  projectName: string;
  repositoryMetadata?: RepositoryMetadata | null;
  fileCount?: number | null;
  onNewAnalysis?: () => void;
}

function renderSectionBody(
  section: ReportSection,
  parsed: ReturnType<typeof parseReportMarkdown>,
  onNavigate: (id: ReportSectionId) => void,
) {
  const renderType = getSectionRenderType(section.id);

  switch (renderType) {
    case "ai-insights":
      return (
        <SectionFallback
          primary={<AIInsightsCards insights={parsed.insights} onNavigate={onNavigate} />}
          fallbackContent={parsed.insights.biggestIdea ? "" : section.content}
        />
      );

    case "tech-stack-grid": {
      const items = parseTechStackItems(section.content);
      return (
        <SectionFallback
          primary={<TechStackGrid items={items} />}
          fallbackContent={items.length === 0 ? section.content : ""}
        />
      );
    }

    case "dependency-graph": {
      const nodes = parseDependencyNodes(section.content);
      return (
        <SectionFallback
          primary={<DependencyGraph nodes={nodes} />}
          fallbackContent={
            nodes.length === 0
              ? section.content
              : section.content.replace(/^\d+\.\s+\*\*.+$/gm, "").trim()
          }
        />
      );
    }

    case "learning-timeline": {
      const steps = parseLearningSteps(section.content);
      return (
        <SectionFallback
          primary={<LearningTimeline steps={steps} />}
          fallbackContent={steps.length === 0 ? section.content : ""}
        />
      );
    }

    case "recommendation-timeline": {
      const weeks = parseRecommendationWeeks(section.content);
      return (
        <RecommendationTimeline
          weeks={weeks}
          fallbackContent={section.content}
        />
      );
    }

    case "summary-panel": {
      const summary = parseSummaryPanel(
        section.content,
        parsed.insights,
        parsed.overallRating,
      );
      return <SummaryPanel summary={summary} />;
    }

    default:
      return <SectionMarkdown content={section.content} />;
  }
}

export default function ReportLayout({
  markdown,
  projectName,
  repositoryMetadata,
  fileCount,
  onNewAnalysis,
}: ReportLayoutProps) {
  const parsed = useMemo(() => parseReportMarkdown(markdown), [markdown]);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const availableSections = useMemo(
    () => new Set(parsed.sections.map((section) => section.id)),
    [parsed.sections],
  );

  const pages = useMemo(
    () => [
      { type: "hero" as const, key: "hero" },
      ...parsed.sections.map((section) => ({
        type: "section" as const,
        key: section.id,
        section,
      })),
    ],
    [parsed.sections],
  );

  const quickFacts: QuickFactsData = {
    language: repositoryMetadata?.language ?? undefined,
    framework: parsed.frameworkHint,
    architecture: parsed.architectureHint,
    difficulty: parsed.insights.difficulty,
    learningTime: parsed.insights.learningTime,
    repositorySize:
      fileCount != null ? `约 ${fileCount.toLocaleString()} 个文件` : undefined,
  };

  const activePage = pages[currentPage];
  const activeSection =
    activePage?.type === "section" ? activePage.section.id : null;

  const goToPage = useCallback((nextPage: number) => {
    setCurrentPage((previous) => {
      const clamped = Math.min(Math.max(nextPage, 0), pages.length - 1);
      if (clamped === previous) {
        return previous;
      }
      setDirection(clamped > previous ? 1 : -1);
      return clamped;
    });
  }, [pages.length]);

  const goNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goPrevious = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNavigate = useCallback((id: ReportSectionId) => {
    const index = pages.findIndex(
      (page) => page.type === "section" && page.section.id === id,
    );
    if (index >= 0) {
      goToPage(index);
    }
  }, [goToPage, pages]);

  function renderCurrentPage() {
    if (activePage?.type === "hero") {
      return (
        <div className="report-slide__inner report-slide__inner--hero">
          <Hero
            projectName={projectName}
            tagline={parsed.tagline}
            insights={parsed.insights}
            language={repositoryMetadata?.language}
          />
          <QuickFacts facts={quickFacts} />
        </div>
      );
    }

    if (activePage?.type === "section") {
      const section = activePage.section;
      const isConclusion = section.id === "conclusion";
      return (
        <div className="report-slide__inner">
          <SectionCard key={section.id} id={section.id}>
            {renderSectionBody(section, parsed, handleNavigate)}
            {isConclusion && (
              <div className="report-slide__final-action">
                <button type="button" onClick={onNewAnalysis}>
                  重新分析新的仓库
                </button>
              </div>
            )}
          </SectionCard>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="report-layout report-layout--paged">
      <Sidebar
        activeSection={activeSection}
        availableSections={availableSections}
        onNavigate={handleNavigate}
      />
      <div className="report-deck" aria-live="polite">
        <button
          type="button"
          className="report-page-control report-page-control--prev"
          onClick={goPrevious}
          disabled={currentPage === 0}
          aria-label="上一页"
        >
          <ChevronLeft size={20} strokeWidth={1.8} />
        </button>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.section
            key={activePage?.key ?? "empty"}
            className="report-slide"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {renderCurrentPage()}
          </motion.section>
        </AnimatePresence>
        <button
          type="button"
          className="report-page-control report-page-control--next"
          onClick={goNext}
          disabled={currentPage === pages.length - 1}
          aria-label="下一页"
        >
          <ChevronRight size={20} strokeWidth={1.8} />
        </button>
        <div className="report-page-dots" aria-label="页面导航">
          {pages.map((page, index) => (
            <button
              key={page.key}
              type="button"
              className={`report-page-dot${index === currentPage ? " report-page-dot--active" : ""}`}
              onClick={() => goToPage(index)}
              aria-label={`跳转到第 ${index + 1} 页`}
              aria-current={index === currentPage ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportLayoutSkeleton() {
  return (
    <div className="report-layout report-layout--loading">
      <div className="report-sidebar report-sidebar--skeleton" aria-hidden="true" />
      <div className="report-layout__content">
        <div className="report-hero report-hero--skeleton" />
        <div className="report-quick-facts report-quick-facts--skeleton" />
        {[1, 2, 3].map((key) => (
          <div key={key} className="report-section-card report-section-card--skeleton" />
        ))}
      </div>
    </div>
  );
}
