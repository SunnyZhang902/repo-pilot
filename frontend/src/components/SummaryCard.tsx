"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import ReportLayout, {
  ReportLayoutSkeleton,
} from "@/components/report/ReportLayout";
import type { RepositoryMetadata } from "@/types/repository";

interface SummaryCardProps {
  summary?: string | null;
  loading?: boolean;
  repositoryMetadata?: RepositoryMetadata | null;
  fileCount?: number | null;
  onNewAnalysis?: () => void;
}

export default function SummaryCard({
  summary,
  loading = false,
  repositoryMetadata = null,
  fileCount = null,
  onNewAnalysis,
}: SummaryCardProps) {
  const [showGenerated, setShowGenerated] = useState(false);

  const projectName = repositoryMetadata
    ? `${repositoryMetadata.owner}/${repositoryMetadata.name}`
    : "Repository Report";

  useEffect(() => {
    if (!loading && summary) {
      const showTimer = window.setTimeout(() => setShowGenerated(true), 0);
      const hideTimer = window.setTimeout(() => setShowGenerated(false), 1400);
      return () => {
        window.clearTimeout(showTimer);
        window.clearTimeout(hideTimer);
      };
    }
  }, [loading, summary]);

  return (
    <section className="panel-card summary-card summary-card--report">
      {showGenerated && (
        <div className="report-generated-toast" role="status">
          <CheckCircle2 size={18} strokeWidth={2} />
          项目报告已生成
        </div>
      )}
      <div className="summary-card-header">
        <h2 className="section-title summary-card-title">项目报告</h2>
      </div>

      <div className="summary-content summary-content--report">
        {loading ? (
          <ReportLayoutSkeleton />
        ) : summary ? (
          <ReportLayout
            markdown={summary}
            projectName={projectName}
            repositoryMetadata={repositoryMetadata}
            fileCount={fileCount}
            onNewAnalysis={onNewAnalysis}
          />
        ) : null}
      </div>
    </section>
  );
}
