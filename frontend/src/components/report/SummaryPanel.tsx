import { CheckCircle } from "lucide-react";

import MarkdownRenderer from "@/components/report/MarkdownRenderer";
import type { ParsedSummary } from "@/utils/reportSectionParser";

interface SummaryPanelProps {
  summary: ParsedSummary;
}

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <div className="summary-panel summary-panel--success">
      <div className="summary-panel__overall">
        <h3 className="summary-panel__heading">
          <CheckCircle size={18} strokeWidth={2} aria-hidden="true" />
          总结
        </h3>
        <MarkdownRenderer content={summary.overall} />
      </div>
      <aside className="summary-panel__aside">
        <h3 className="summary-panel__heading">适合人群</h3>
        <ul className="summary-panel__audience">
          {summary.bestFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
