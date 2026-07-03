from pathlib import Path

from fastapi import HTTPException

# Configuration files checked relative to the repository root.
_CONFIGURATION_FILES = (
    # Python
    "pyproject.toml",
    "requirements.txt",
    "setup.py",
    "tox.ini",
    # Node / Frontend
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "webpack.config.js",
    # Docker
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    # General
    "Makefile",
    ".env.example",
    ".editorconfig",
    ".gitignore",
)


class ConfigurationExtractor:
    """Identifies important project configuration files at the repository root."""

    def extract(self, repository_path: str) -> list[str]:
        """Detect configuration files that exist at the repository root.

        Args:
            repository_path: Absolute or relative path to the repository root.

        Returns:
            Alphabetically sorted, deduplicated list of configuration file paths.

        Raises:
            HTTPException: If ``repository_path`` does not exist.
        """
        root = Path(repository_path).resolve()

        if not root.exists():
            raise HTTPException(
                status_code=400,
                detail="Repository path does not exist",
            )

        configuration_files: set[str] = set()

        for relative_path in _CONFIGURATION_FILES:
            if (root / relative_path).is_file():
                configuration_files.add(relative_path)

        return sorted(configuration_files, key=str.lower)
