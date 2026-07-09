"use client";

import { useCallback, useState } from "react";

import type { RepositoryNode } from "@/types/repository";
import { getTreeDisplayRoots } from "@/utils/normalizeRepositoryTree";

interface RepositoryTreeProps {
  tree: RepositoryNode;
}

interface TreeNodeProps {
  node: RepositoryNode;
  collapsedPaths: Set<string>;
  selectedPath: string | null;
  onToggleDirectory: (path: string) => void;
  onSelectFile: (path: string) => void;
}

function TreeNode({
  node,
  collapsedPaths,
  selectedPath,
  onToggleDirectory,
  onSelectFile,
}: TreeNodeProps) {
  const isDirectory = node.type === "directory";
  const isCollapsed = isDirectory && collapsedPaths.has(node.path);
  const isSelected = !isDirectory && selectedPath === node.path;

  function handleClick() {
    if (isDirectory) {
      onToggleDirectory(node.path);
      return;
    }
    onSelectFile(node.path);
  }

  return (
    <li className="tree-node">
      <div
        className={[
          "tree-node-label",
          isDirectory ? "tree-node-label--directory" : "tree-node-label--file",
          isSelected ? "tree-node-label--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role={isDirectory ? "button" : "button"}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        aria-expanded={isDirectory ? !isCollapsed : undefined}
        aria-pressed={!isDirectory ? isSelected : undefined}
      >
        {isDirectory && (
          <span className="tree-chevron" aria-hidden="true">
            {isCollapsed ? "▸" : "▾"}
          </span>
        )}
        <span className="tree-icon" aria-hidden="true">
          {isDirectory ? (
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.172a1.5 1.5 0 0 1 1.06.44L8.56 3.75A1.5 1.5 0 0 0 9.621 4H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5v-9z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M4 1.5H9l3 3V13.5A1.5 1.5 0 0 1 10.5 15h-7A1.5 1.5 0 0 1 2 13.5v-11A1.5 1.5 0 0 1 3.5 1H4z" />
            </svg>
          )}
        </span>
        <span className="tree-name">
          {node.name}
          {isDirectory ? "/" : ""}
        </span>
      </div>

      {isDirectory && !isCollapsed && node.children.length > 0 && (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              collapsedPaths={collapsedPaths}
              selectedPath={selectedPath}
              onToggleDirectory={onToggleDirectory}
              onSelectFile={onSelectFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RepositoryTreeContent({ tree }: RepositoryTreeProps) {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleToggleDirectory = useCallback((path: string) => {
    setCollapsedPaths((previous) => {
      const next = new Set(previous);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelectFile = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const displayRoots = getTreeDisplayRoots(tree);

  return (
    <section className="panel-card repository-tree">
      <h2 className="section-title">项目结构</h2>
      <div className="tree-scroll">
        <ul className="tree-root">
          {displayRoots.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              collapsedPaths={collapsedPaths}
              selectedPath={selectedPath}
              onToggleDirectory={handleToggleDirectory}
              onSelectFile={handleSelectFile}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function RepositoryTree({ tree }: RepositoryTreeProps) {
  return <RepositoryTreeContent key={tree.path} tree={tree} />;
}
