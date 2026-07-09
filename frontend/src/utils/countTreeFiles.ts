import type { RepositoryNode } from "@/types/repository";

export function countTreeFiles(node: RepositoryNode): number {
  if (node.type === "file") {
    return 1;
  }

  return node.children.reduce((sum, child) => sum + countTreeFiles(child), 0);
}
