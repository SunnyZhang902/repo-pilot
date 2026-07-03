from pathlib import Path

from fastapi import HTTPException

from app.schemas.parser import RepositoryNode

# Directory and file names excluded from the repository tree.
IGNORED_NAMES = frozenset({".git", "__pycache__", "node_modules", ".venv", ".next"})

# Default maximum directory depth to traverse (prevents runaway recursion).
DEFAULT_MAX_DEPTH = 32


class RepositoryParserService:
    """Service for building a file tree from a local repository directory."""

    def __init__(self, max_depth: int = DEFAULT_MAX_DEPTH) -> None:
        self.max_depth = max_depth

    def parse_repository(self, root_path: str) -> RepositoryNode:
        """
        Parse a repository directory into a recursive RepositoryNode tree.

        Uses recursive traversal with depth limiting and symlink skipping.
        """
        root = Path(root_path).resolve()

        if not root.exists():
            raise HTTPException(
                status_code=400,
                detail="Repository path does not exist",
            )

        if not root.is_dir():
            raise HTTPException(
                status_code=400,
                detail="Repository path is not a directory",
            )

        return self._build_node(root, root, depth=0)

    def _build_node(self, path: Path, root: Path, depth: int) -> RepositoryNode:
        """Recursively build a node for a file or directory."""
        relative_path = "." if path == root else path.relative_to(root).as_posix()

        if path.is_file():
            return RepositoryNode(
                name=path.name,
                path=relative_path,
                type="file",
                children=[],
            )

        # Directory at max depth: include the node but do not descend further.
        if depth >= self.max_depth:
            return RepositoryNode(
                name=path.name,
                path=relative_path,
                type="directory",
                children=[],
            )

        children: list[RepositoryNode] = []

        for entry in self._sorted_entries(path):
            if entry.is_symlink() or entry.name in IGNORED_NAMES:
                continue

            children.append(self._build_node(entry, root, depth + 1))

        return RepositoryNode(
            name=path.name,
            path=relative_path,
            type="directory",
            children=children,
        )

    def _sorted_entries(self, directory: Path) -> list[Path]:
        """Return directory entries sorted: directories first, then files, alphabetically."""
        entries = [entry for entry in directory.iterdir() if not entry.is_symlink()]

        directories = sorted(
            (entry for entry in entries if entry.is_dir()),
            key=lambda entry: entry.name.lower(),
        )
        files = sorted(
            (entry for entry in entries if entry.is_file()),
            key=lambda entry: entry.name.lower(),
        )

        return directories + files
