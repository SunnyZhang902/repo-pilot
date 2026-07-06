from pathlib import Path

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"


class PromptLoader:
    """Loads Markdown prompt templates from backend/app/prompts/."""

    def __init__(self, prompts_dir: Path | None = None) -> None:
        self._prompts_dir = prompts_dir or PROMPTS_DIR
        self._cache: dict[str, str] = {}

    def load(self, filename: str) -> str:
        """Read a template file as UTF-8 text, with in-memory caching."""
        path = self._prompts_dir / filename
        cache_key = str(path.resolve())

        if cache_key in self._cache:
            return self._cache[cache_key]

        template = path.read_text(encoding="utf-8")
        self._cache[cache_key] = template
        return template

    def clear_cache(self) -> None:
        """Clear the template cache (useful for tests)."""
        self._cache.clear()
