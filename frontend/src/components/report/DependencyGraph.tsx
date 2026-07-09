import type { DependencyNode } from "@/utils/reportSectionParser";

interface DependencyGraphProps {
  nodes: DependencyNode[];
}

export default function DependencyGraph({ nodes }: DependencyGraphProps) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="dependency-graph">
      {nodes.map((node, index) => (
        <div key={`${node.label}-${index}`} className="dependency-graph__item">
          <div className="dependency-graph__node">
            <span className="dependency-graph__label">{node.label}</span>
            {node.detail && (
              <span className="dependency-graph__detail">{node.detail}</span>
            )}
          </div>
          {index < nodes.length - 1 && (
            <div className="dependency-graph__arrow" aria-hidden="true">
              ↓
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
