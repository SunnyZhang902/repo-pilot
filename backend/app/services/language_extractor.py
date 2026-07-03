from pathlib import Path

from fastapi import HTTPException

# Directories excluded from language detection.
_IGNORED_DIRS = frozenset({".git", "__pycache__", "node_modules", ".venv", ".next"})

# File extension to language name mapping.
_EXTENSION_LANGUAGES: dict[str, str] = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".java": "Java",
    ".go": "Go",
    ".rs": "Rust",
    ".c": "C / C++",
    ".cpp": "C / C++",
    ".cc": "C / C++",
    ".cxx": "C / C++",
    ".cs": "C#",
    ".php": "PHP",
    ".rb": "Ruby",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".sh": "Shell",
}


class LanguageExtractor:
    """Detects programming languages present in a repository by file extension."""

    def extract(self, repository_path: str) -> list[str]:
        """Scan a repository and return unique language names found.

        Args:
            repository_path: Absolute or relative path to the repository root.

        Returns:
            Alphabetically sorted, deduplicated list of language names.

        Raises:
            HTTPException: If ``repository_path`` does not exist.
        """
        root = Path(repository_path).resolve()

        if not root.exists():
            raise HTTPException(
                status_code=400,
                detail="Repository path does not exist",
            )

        languages: set[str] = set()

        for path in root.rglob("*"):
            if path.is_symlink():
                continue

            if self._is_under_ignored_dir(path, root):
                continue

            if not path.is_file():
                continue

            language = self._detect_language(path)
            if language:
                languages.add(language)

        return sorted(languages, key=str.lower)

    def _is_under_ignored_dir(self, path: Path, root: Path) -> bool:
        """Return True if the path is inside an ignored directory."""
        relative_parts = path.relative_to(root).parts
        return any(part in _IGNORED_DIRS for part in relative_parts)

    def _detect_language(self, path: Path) -> str | None:
        """Map a file path to a language name, if recognized."""
        if path.name == "Dockerfile":
            return "Docker"

        return _EXTENSION_LANGUAGES.get(path.suffix.lower())
