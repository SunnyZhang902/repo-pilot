import type { TimelineStep } from "@/utils/reportSectionParser";

interface LearningTimelineProps {
  steps: TimelineStep[];
}

export default function LearningTimeline({ steps }: LearningTimelineProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <ol className="learning-timeline">
      {steps.map((step, index) => (
        <li key={`${step.title}-${index}`} className="learning-timeline__item">
          <div className="learning-timeline__marker" aria-hidden="true">
            <span className="learning-timeline__dot" />
            {index < steps.length - 1 && (
              <span className="learning-timeline__line" />
            )}
          </div>
          <div className="learning-timeline__content">
            <p className="learning-timeline__step">Step {index + 1}</p>
            <h3 className="learning-timeline__title">{step.title}</h3>
            {step.description && (
              <p className="learning-timeline__desc">{step.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
