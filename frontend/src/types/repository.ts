export interface RepositoryMetadata {
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  default_branch: string;
}

export interface RepositoryNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: RepositoryNode[];
}

export interface RepositorySummaryResponse {
  summary: string;
  metadata: RepositoryMetadata;
  tree: RepositoryNode;
}
