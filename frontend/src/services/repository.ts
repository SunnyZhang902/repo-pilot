import type {
  RepositoryMetadata,
  RepositorySummaryResponse,
} from "@/types/repository";

const API_BASE = "http://127.0.0.1:8000";

export async function importRepository(
  url: string,
): Promise<RepositoryMetadata> {
  const response = await fetch(`${API_BASE}/api/repositories/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function summarizeRepository(
  url: string,
): Promise<RepositorySummaryResponse> {
  const response = await fetch(`${API_BASE}/api/repositories/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
