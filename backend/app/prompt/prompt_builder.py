from app.prompt.prompt_loader import PromptLoader
from app.prompt.prompt_registry import PromptRegistry
from app.prompt.prompt_renderer import PromptRenderer
from app.schemas.knowledge import RepositoryKnowledge


class PromptBuilder:
    """Orchestrates prompt assembly: Registry → Loader → Renderer."""

    def __init__(
        self,
        loader: PromptLoader | None = None,
        renderer: PromptRenderer | None = None,
    ) -> None:
        self._loader = loader or PromptLoader()
        self._renderer = renderer or PromptRenderer()

    def build_summary_prompt(
        self,
        knowledge: RepositoryKnowledge,
        version: str,
    ) -> str:
        """Build a summary prompt from a registered template version."""
        filename = PromptRegistry.get(task="summary", version=version)
        template = self._loader.load(filename)
        return self._renderer.render(template, knowledge)
