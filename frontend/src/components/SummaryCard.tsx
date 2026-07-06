"use client";

import { useState } from "react";
import Markdown from "react-markdown";

import type { SummaryMetadata } from "@/types/summary";

interface SummaryCardProps {
  summary?: string | null;
  loading?: boolean;
  metadata?: SummaryMetadata | null;
}

const SKELETON_LINE_WIDTHS = ["100%", "92%", "78%", "88%", "65%"];

function SummarySkeleton() {
  return (
    <div className="summary-skeleton" aria-hidden="true">
      {SKELETON_LINE_WIDTHS.map((width, index) => (
        <span
          key={index}
          className="summary-skeleton-line"
          style={{ width }}
        />
      ))}
    </div>
  );
}

function SummaryMetadataBar({ metadata }: { metadata: SummaryMetadata }) {
  return (
    <dl className="summary-metadata">
      <div className="summary-metadata-item">
        <dt className="summary-metadata-label">模型</dt>
        <dd className="summary-metadata-value">{metadata.model}</dd>
      </div>
      <div className="summary-metadata-item">
        <dt className="summary-metadata-label">Prompt 版本</dt>
        <dd className="summary-metadata-value">{metadata.promptVersion}</dd>
      </div>
      <div className="summary-metadata-item">
        <dt className="summary-metadata-label">生成耗时</dt>
        <dd className="summary-metadata-value">
          {metadata.generationTimeSeconds.toFixed(2)}s
        </dd>
      </div>
    </dl>
  );
}

export default function SummaryCard({
  summary,
  loading = false,
  metadata = null,
}: SummaryCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <section className="panel-card summary-card">
      <div className="summary-card-header">
        <h2 className="section-title summary-card-title">AI 总结</h2>
        {!loading && summary && (
          <button
            type="button"
            className="copy-button"
            onClick={handleCopy}
            aria-label="复制 Markdown"
          >
            {copied ? "已复制" : "复制 Markdown"}
          </button>
        )}
      </div>

      {metadata && !loading && <SummaryMetadataBar metadata={metadata} />}

      <div className="summary-content">
        {loading ? (
          <SummarySkeleton />
        ) : summary ? (
          <div className="markdown-body">
            <Markdown>{summary}</Markdown>
          </div>
        ) : null}
      </div>
    </section>
  );
}
