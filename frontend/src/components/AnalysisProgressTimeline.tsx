"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

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

const LOADING_STEPS = [
  { label: "克隆仓库", activeFrom: 0 },
  { label: "解析目录", activeFrom: 1 },
  { label: "阅读文档", activeFrom: 2 },
  { label: "构建项目知识", activeFrom: 2 },
  { label: "生成项目报告", activeFrom: 3 },
];

export default function AnalysisProgressTimeline({
  currentStage,
}: AnalysisProgressTimelineProps) {
  const currentIndex = getStageIndex(currentStage);
  const progress = [18, 35, 62, 86][currentIndex] ?? 18;

  return (
    <motion.section
      className="analysis-timeline"
      aria-live="polite"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="analysis-timeline__header">
        <p className="analysis-timeline__eyebrow">初始化中</p>
        <h2 className="analysis-timeline__title">正在构建项目知识</h2>
        <span className="analysis-timeline__percent">{progress}%</span>
      </div>
      <div className="analysis-progress" aria-hidden="true">
        <motion.span
          className="analysis-progress__bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        />
      </div>
      <ol className="timeline-list">
        {LOADING_STEPS.map((stage) => {
          const isComplete = currentIndex > stage.activeFrom;
          const isActive = currentIndex === stage.activeFrom;
          const state = isComplete ? "complete" : isActive ? "active" : "pending";

          return (
            <li
              key={stage.label}
              className={`timeline-item timeline-item--${state}`}
            >
              <span className="timeline-marker" aria-hidden="true">
                {isComplete ? <Check size={14} strokeWidth={2.2} /> : ""}
              </span>
              <span className="timeline-label">{stage.label}</span>
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}
