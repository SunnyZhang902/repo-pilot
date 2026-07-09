"use client";

import { REPORT_NAV_ITEMS, type ReportSectionId } from "@/types/report";

interface SidebarProps {
  activeSection: ReportSectionId | null;
  availableSections: Set<ReportSectionId>;
  onNavigate: (id: ReportSectionId) => void;
}

export default function Sidebar({
  activeSection,
  availableSections,
  onNavigate,
}: SidebarProps) {
  return (
    <nav className="report-sidebar" aria-label="报告目录">
      <p className="report-sidebar__label">目录</p>
      <ul className="report-sidebar__list">
        {REPORT_NAV_ITEMS.filter((item) => availableSections.has(item.id)).map(
          (item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`report-sidebar__link${isActive ? " report-sidebar__link--active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="report-sidebar__dot" aria-hidden="true" />
                  <span className="report-sidebar__link-text">{item.label}</span>
                </button>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}
