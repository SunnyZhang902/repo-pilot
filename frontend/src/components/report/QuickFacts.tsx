import {
  Clock,
  Code2,
  FolderTree,
  Gauge,
  Layers3,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { QuickFactsData } from "@/types/report";
import { normalizeDifficultyLabel } from "@/utils/sanitizeMarkdown";

interface QuickFactsProps {
  facts: QuickFactsData;
}

interface FactItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function QuickFacts({ facts }: QuickFactsProps) {
  const items: FactItem[] = [
    { icon: Code2, label: "语言", value: facts.language ?? "—" },
    { icon: Layers3, label: "框架", value: facts.framework ?? "—" },
    { icon: FolderTree, label: "架构", value: facts.architecture ?? "—" },
    {
      icon: Gauge,
      label: "难度",
      value: normalizeDifficultyLabel(facts.difficulty),
    },
    { icon: Timer, label: "学习时间", value: facts.learningTime ?? "—" },
    { icon: Clock, label: "仓库规模", value: facts.repositorySize ?? "—" },
  ];

  return (
    <section className="report-quick-facts" aria-label="快速概览">
      <h2 className="report-quick-facts__title">快速概览</h2>
      <dl className="report-quick-facts__grid">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="report-quick-facts__item">
              <div className="report-quick-facts__value-row">
                <span className="report-quick-facts__icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <dd className="report-quick-facts__value">{item.value}</dd>
              </div>
              <dt className="report-quick-facts__label">{item.label}</dt>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
