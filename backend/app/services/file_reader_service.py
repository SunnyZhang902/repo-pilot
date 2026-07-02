from pathlib import Path

from app.schemas.context import RepositoryDocument

# Root-level files to collect from a repository.
SUPPORTED_FILES = frozenset({
    "README.md",
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Dockerfile",
    "docker-compose.yml",
    "Makefile",
    ".env.example",
})

# Maps filename to a document category (not the filename itself).
# Categories are used consistently in LLM prompts and filtering logic.
DOCUMENT_TYPE_MAP: dict[str, str] = {
    "README.md": "readme",
    "package.json": "package",
    "pyproject.toml": "python_config",
    "requirements.txt": "requirements",
    "Dockerfile": "docker",
    "docker-compose.yml": "compose",
    "Makefile": "makefile",
    ".env.example": "environment",
}


class FileReaderService:
    """Reads supported configuration and documentation files from a repository root."""

    def collect_documents(self, repository_path: str) -> list[RepositoryDocument]:
        """Collect all supported documents found at the repository root."""
        root = Path(repository_path).resolve()

        if not root.is_dir():
            return []

        documents: list[RepositoryDocument] = []

        for file_path in self._find_candidate_files(root):
            document = self._read_document(file_path, root)
            if document is not None:
                documents.append(document)

        return documents

    def _find_candidate_files(self, root: Path) -> list[Path]:
        """Return supported files present at the repository root, sorted alphabetically."""
        return sorted(
            (root / name for name in SUPPORTED_FILES if (root / name).is_file()),
            key=lambda path: path.name.lower(),
        )

    def _read_document(
        self, file_path: Path, root: Path
    ) -> RepositoryDocument | None:
        """Read a single file as UTF-8 text; skip silently on decode or I/O errors."""
        try:
            content = file_path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            return None

        return RepositoryDocument(
            path=file_path.relative_to(root).as_posix(),
            content=content,
            document_type=self._detect_document_type(file_path.name),
        )

    def _detect_document_type(self, filename: str) -> str:
        """Look up the document category for a supported filename."""
        return DOCUMENT_TYPE_MAP[filename]
