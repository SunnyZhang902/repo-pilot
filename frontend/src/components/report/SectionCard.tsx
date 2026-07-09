"use client";

import type { ReactNode } from "react";

import MarkdownRenderer from "@/components/report/MarkdownRenderer";
import {
  getSectionVariant,
  SECTION_ACCENTS,
  SECTION_ICONS,
} from "@/components/report/sectionIcons";
import type { ReportSectionId } from "@/types/report";
import { getSectionMeta } from "@/utils/reportSectionParser";

interface SectionCardProps {
  id: ReportSectionId;
  title?: string;
  children: ReactNode;
  sectionRef?: (el: HTMLElement | null) => void;
}

export default function SectionCard({
  id,
  title,
  children,
  sectionRef,
}: SectionCardProps) {
  const meta = getSectionMeta(id);
  const Icon = SECTION_ICONS[id];
  const accent = SECTION_ACCENTS[id];
  const variant = getSectionVariant(id);
  const displayTitle = title ?? meta.title;

  return (
    <article
      id={`report-${id}`}
      ref={sectionRef}
      className={`report-section-card report-section-card--accent-${accent} report-section-card--${variant}`}
    >
      <header className="report-section-card__header">
        <div className="report-section-card__title-row">
          <span className="report-section-card__icon" aria-hidden="true">
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <div className="report-section-card__heading">
            <h2 className="report-section-card__title">{displayTitle}</h2>
            <p className="report-section-card__subtitle">{meta.subtitle}</p>
          </div>
        </div>
        <div className="report-section-card__divider" aria-hidden="true" />
      </header>
      <div className="report-section-card__body">{children}</div>
    </article>
  );
}

export function SectionMarkdown({
  content,
}: {
  content: string;
}) {
  if (!content.trim()) {
    return <p className="report-muted">暂无内容</p>;
  }

  return <MarkdownRenderer content={content} />;
}

export function SectionFallback({
  primary,
  fallbackContent,
}: {
  primary: ReactNode;
  fallbackContent: string;
}) {
  return (
    <>
      {primary}
      {fallbackContent.trim() && (
        <div className="report-section-fallback">
          <SectionMarkdown content={fallbackContent} />
        </div>
      )}
    </>
  );
}
