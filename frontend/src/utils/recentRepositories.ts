export interface RecentRepository {
  url: string;
  label: string;
  analyzedAt: number;
}

const STORAGE_KEY = "repopilot:recent-repositories";
const MAX_RECENT = 5;

function parseRepositoryLabel(url: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    const [owner, repo] = pathname.split("/");
    if (owner && repo) {
      return `${owner}/${repo}`;
    }
  } catch {
    // fall through
  }
  return url;
}

export function getRecentRepositories(): RecentRepository[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is RecentRepository =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as RecentRepository).url === "string" &&
          typeof (item as RecentRepository).label === "string" &&
          typeof (item as RecentRepository).analyzedAt === "number",
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function saveRecentRepository(url: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return;
  }

  const entry: RecentRepository = {
    url: trimmed,
    label: parseRepositoryLabel(trimmed),
    analyzedAt: Date.now(),
  };

  const existing = getRecentRepositories().filter((item) => item.url !== trimmed);
  const updated = [entry, ...existing].slice(0, MAX_RECENT);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
