import type { RepositoryNode } from "@/types/repository";

/** Matches workspace cache keys (10-char hex) from WorkspaceManager. */
const HASH_DIR_PATTERN = /^[a-f0-9]{8,12}$/i;

function isHashDirectoryName(name: string): boolean {
  return HASH_DIR_PATTERN.test(name);
}

/**
 * Unwraps hash-based workspace root folders so the UI shows repository content
 * instead of internal cache directory names.
 */
export function normalizeRepositoryTree(
  tree: RepositoryNode,
  displayName?: string,
): RepositoryNode {
  if (
    tree.type === "directory" &&
    isHashDirectoryName(tree.name) &&
    tree.children.length > 0
  ) {
    return {
      name: displayName ?? "repository",
      path: ".",
      type: "directory",
      children: tree.children,
    };
  }

  return tree;
}

/** Top-level nodes to render — skips synthetic workspace wrapper. */
export function getTreeDisplayRoots(tree: RepositoryNode): RepositoryNode[] {
  const normalized = normalizeRepositoryTree(tree);

  if (
    normalized.type === "directory" &&
    normalized.path === "." &&
    normalized.children.length > 0
  ) {
    return normalized.children;
  }

  return [normalized];
}
