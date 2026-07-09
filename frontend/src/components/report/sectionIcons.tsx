import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  CheckCircle,
  Code,
  Compass,
  Lightbulb,
  Link2,
  Layers3,
  Users,
} from "lucide-react";

import type { ReportSectionId } from "@/types/report";

export const SECTION_ICONS: Record<ReportSectionId, LucideIcon> = {
  overview: Users,
  "project-summary": BookOpen,
  "tech-stack": Code,
  "core-dependencies": Link2,
  architecture: Layers3,
  "reading-guide": Compass,
  "development-guide": Lightbulb,
  "ai-insights": Brain,
  conclusion: CheckCircle,
};

export const SECTION_ACCENTS: Record<ReportSectionId, string> = {
  overview: "blue",
  "project-summary": "blue",
  "tech-stack": "purple",
  "core-dependencies": "indigo",
  architecture: "green",
  "reading-guide": "teal",
  "development-guide": "orange",
  "ai-insights": "violet",
  conclusion: "green",
};

export function getSectionVariant(
  id: ReportSectionId,
): "default" | "featured" | "success" {
  if (id === "ai-insights") {
    return "featured";
  }
  if (id === "conclusion") {
    return "success";
  }
  return "default";
}
