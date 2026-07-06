"use client";

import {
  ANALYSIS_STAGES,
  type AnalysisStageId,
} from "@/types/analysis";

interface AnalysisProgressTimelineProps {
  currentStage: AnalysisStageId;
}

function getStageIndex(stage: AnalysisStageId): number {
  return ANALYSIS_STAGES.findIndex((item) => item.id === stage);
}

export default function AnalysisProgressTimeline({
  currentStage,
}: AnalysisProgressTimelineProps) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <section className="analysis-timeline panel-card" aria-live="polite">
      <h2 className="section-title">分析进度</h2>
      <ol className="timeline-list">
        {ANALYSIS_STAGES.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;
          const state = isComplete ? "complete" : isActive ? "active" : "pending";

          return (
            <li
              key={stage.id}
              className={`timeline-item timeline-item--${state}`}
            >
              <span className="timeline-marker" aria-hidden="true">
                {isComplete ? "✓" : index + 1}
              </span>
              <span className="timeline-label">{stage.label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
