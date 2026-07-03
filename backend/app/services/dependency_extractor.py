import json
import re
import tomllib
from pathlib import Path

from fastapi import HTTPException

# Version specifier operators stripped from dependency strings.
_VERSION_OPERATORS = ("==", ">=", "<=", "!=", "~=", ">", "<")


class DependencyExtractor:
    """Extracts project dependency names from root-level manifest files."""

    def extract(self, repository_path: str) -> list[str]:
        """Extract unique dependency names from a repository root directory.

        Reads ``requirements.txt``, ``package.json``, and ``pyproject.toml``
        when present. Malformed files are skipped silently.

        Args:
            repository_path: Absolute or relative path to the repository root.

        Returns:
            Alphabetically sorted, deduplicated list of dependency names.

        Raises:
            HTTPException: If ``repository_path`` does not exist.
        """
        root = Path(repository_path).resolve()

        if not root.exists():
            raise HTTPException(
                status_code=400,
                detail="Repository path does not exist",
            )

        dependencies: set[str] = set()

        requirements_file = root / "requirements.txt"
        if requirements_file.is_file():
            dependencies.update(self._parse_requirements_txt(requirements_file))

        package_file = root / "package.json"
        if package_file.is_file():
            dependencies.update(self._parse_package_json(package_file))

        pyproject_file = root / "pyproject.toml"
        if pyproject_file.is_file():
            dependencies.update(self._parse_pyproject_toml(pyproject_file))

        return sorted(dependencies, key=str.lower)

    def _parse_requirements_txt(self, path: Path) -> set[str]:
        """Parse dependency names from a requirements.txt file."""
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except OSError:
            return set()

        dependencies: set[str] = set()

        for line in lines:
            line = line.strip()

            if not line or line.startswith("#"):
                continue

            if "#" in line:
                line = line.split("#", 1)[0].strip()

            if not line or line.startswith("-"):
                continue

            name = self._extract_package_name(line)
            if name:
                dependencies.add(name)

        return dependencies

    def _parse_package_json(self, path: Path) -> set[str]:
        """Parse dependency names from package.json dependencies sections."""
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return set()

        if not isinstance(data, dict):
            return set()

        dependencies: set[str] = set()

        for section in ("dependencies", "devDependencies"):
            entries = data.get(section)
            if isinstance(entries, dict):
                dependencies.update(entries.keys())

        return dependencies

    def _parse_pyproject_toml(self, path: Path) -> set[str]:
        """Parse dependency names from PEP 621 project.dependencies."""
        try:
            data = tomllib.loads(path.read_text(encoding="utf-8"))
        except (OSError, tomllib.TOMLDecodeError):
            return set()

        if not isinstance(data, dict):
            return set()

        project = data.get("project")
        if not isinstance(project, dict):
            return set()

        raw_dependencies = project.get("dependencies")
        if not isinstance(raw_dependencies, list):
            return set()

        dependencies: set[str] = set()

        for entry in raw_dependencies:
            if isinstance(entry, str):
                name = self._extract_package_name(entry)
                if name:
                    dependencies.add(name)

        return dependencies

    def _extract_package_name(self, requirement: str) -> str:
        """Extract the package name from a PEP 508-style requirement string."""
        name = requirement.strip()

        if not name:
            return ""

        # Remove environment markers (everything after ';').
        name = name.split(";", 1)[0].strip()

        # Remove extras (e.g. package[extra]).
        name = re.split(r"\[", name, maxsplit=1)[0]

        for operator in _VERSION_OPERATORS:
            if operator in name:
                name = name.split(operator, 1)[0]
                break

        return name.strip()
