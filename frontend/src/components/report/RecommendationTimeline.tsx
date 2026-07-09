import MarkdownRenderer from "@/components/report/MarkdownRenderer";
import type { RecommendationWeek } from "@/utils/reportSectionParser";

interface RecommendationTimelineProps {
  weeks: RecommendationWeek[];
  fallbackContent: string;
}

export default function RecommendationTimeline({
  weeks,
  fallbackContent,
}: RecommendationTimelineProps) {
  if (weeks.length === 0) {
    return <MarkdownRenderer content={fallbackContent} />;
  }

  return (
    <ol className="recommendation-timeline">
      {weeks.map((week, index) => (
        <li key={`${week.label}-${index}`} className="recommendation-timeline__item">
          <div className="recommendation-timeline__marker" aria-hidden="true">
            <span className="recommendation-timeline__badge">{index + 1}</span>
            {index < weeks.length - 1 && (
              <span className="recommendation-timeline__line" />
            )}
          </div>
          <div className="recommendation-timeline__content">
            <h3 className="recommendation-timeline__label">{week.label}</h3>
            <MarkdownRenderer content={week.content} />
          </div>
        </li>
      ))}
    </ol>
  );
}
