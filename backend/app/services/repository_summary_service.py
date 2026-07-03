from app.core.timer import Timer
from app.schemas.context import RepositoryContext
from app.services.llm_client import LLMClient
from app.services.prompt_builder import PromptBuilder, PromptType


class RepositorySummaryService:
    """Generates AI-powered repository summaries from structured context."""

    def __init__(self) -> None:
        self.prompt_builder = PromptBuilder()
        self.llm_client = LLMClient()

    async def generate_summary(self, context: RepositoryContext) -> str:
        """Build a summary prompt and return the LLM-generated response."""
        with Timer("Prompt Build"):
            prompt = self.prompt_builder.build(context, PromptType.SUMMARY)

        with Timer("LLM Generation"):
            return await self.llm_client.generate(prompt)
