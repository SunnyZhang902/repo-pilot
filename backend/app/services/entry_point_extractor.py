import json
from pathlib import Path

from fastapi import HTTPException

# Python entry files checked relative to the repository root.
_PYTHON_ENTRY_FILES = (
    "main.py",
    "app.py",
    "run.py",
    "manage.py",
    "src/main.py",
)

# Node / Next.js directory entry points relative to the repository root.
_NEXTJS_ENTRY_DIRS = (
    "app",
    "src/app",
    "pages",
    "src/pages",
)


class EntryPointExtractor:
    """Identifies likely project entry points from repository structure."""

    def extract(self, repository_path: str) -> list[str]:
        """Detect likely entry points for Python, Node, Go, and Java projects.

        Args:
            repository_path: Absolute or relative path to the repository root.

        Returns:
            Alphabetically sorted, deduplicated list of entry point identifiers.

        Raises:
            HTTPException: If ``repository_path`` does not exist.
        """
        root = Path(repository_path).resolve()

        if not root.exists():
            raise HTTPException(
                status_code=400,
                detail="Repository path does not exist",
            )

        entry_points: set[str] = set()

        entry_points.update(self._detect_python_entry_points(root))
        entry_points.update(self._detect_node_entry_points(root))
        entry_points.update(self._detect_go_entry_points(root))
        entry_points.update(self._detect_java_entry_points(root))

        return sorted(entry_points, key=str.lower)

    def _detect_python_entry_points(self, root: Path) -> set[str]:
        """Detect common Python application entry files."""
        entry_points: set[str] = set()

        for relative_path in _PYTHON_ENTRY_FILES:
            if (root / relative_path).is_file():
                entry_points.add(relative_path.replace("\\", "/"))

        return entry_points

    def _detect_node_entry_points(self, root: Path) -> set[str]:
        """Detect Node / Next.js entry points from package.json and directories."""
        entry_points: set[str] = set()

        package_file = root / "package.json"
        if package_file.is_file():
            entry_points.update(self._parse_package_json_scripts(package_file))

        for relative_dir in _NEXTJS_ENTRY_DIRS:
            if (root / relative_dir).is_dir():
                entry_points.add(f"{relative_dir.replace('\\', '/')}/")

        return entry_points

    def _parse_package_json_scripts(self, path: Path) -> set[str]:
        """Read start and dev scripts from package.json."""
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return set()

        if not isinstance(data, dict):
            return set()

        scripts = data.get("scripts")
        if not isinstance(scripts, dict):
            return set()

        entry_points: set[str] = set()

        if "start" in scripts:
            entry_points.add("package.json:scripts.start")

        if "dev" in scripts:
            entry_points.add("package.json:scripts.dev")

        return entry_points

    def _detect_go_entry_points(self, root: Path) -> set[str]:
        """Detect Go application entry points."""
        entry_points: set[str] = set()

        if (root / "main.go").is_file():
            entry_points.add("main.go")

        if (root / "cmd").is_dir():
            entry_points.add("cmd/")

        return entry_points

    def _detect_java_entry_points(self, root: Path) -> set[str]:
        """Detect Java application entry layout."""
        entry_points: set[str] = set()

        java_src = root / "src" / "main" / "java"
        if java_src.is_dir():
            entry_points.add("src/main/java")

        return entry_points
