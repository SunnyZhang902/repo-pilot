export interface RepositoryMetadata {
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  default_branch: string;
}
