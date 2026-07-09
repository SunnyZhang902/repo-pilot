import { Code2 } from "lucide-react";

import type { TechStackItem } from "@/utils/reportSectionParser";

interface TechStackGridProps {
  items: TechStackItem[];
}

export default function TechStackGrid({ items }: TechStackGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="tech-stack-grid">
      {items.map((item) => (
        <article key={item.name} className="tech-stack-card">
          <div className="tech-stack-card__header">
            <span className="tech-stack-card__icon" aria-hidden="true">
              <Code2 size={18} strokeWidth={1.75} />
            </span>
            <h3 className="tech-stack-card__name">{item.name}</h3>
          </div>
          <p className="tech-stack-card__desc">{item.description}</p>
        </article>
      ))}
    </div>
  );
}
