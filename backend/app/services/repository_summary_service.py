from app.core.timer import Timer
from app.schemas.knowledge import RepositoryKnowledge
from app.services.llm_client import LLMClient
from app.services.prompt_builder import PromptBuilder, PromptType


class RepositorySummaryService:
    """Generates AI-powered repository summaries from structured knowledge."""

    def __init__(self) -> None:
        self.prompt_builder = PromptBuilder()
        self.llm_client = LLMClient()

    async def generate_summary(self, knowledge: RepositoryKnowledge) -> str:
        """Build a summary prompt and return the LLM-generated response."""
        with Timer("Prompt Build"):
            prompt = self.prompt_builder.build(knowledge, PromptType.SUMMARY)

        with Timer("LLM Generation"):
            return await self.llm_client.generate(prompt)
