from app.schemas.context import RepositoryContext, RepositoryDocument
from app.schemas.repository import RepositoryAnalysis


class ContextBuilder:
    """Assembles structured repository knowledge into a RepositoryContext."""

    def build(
        self,
        analysis: RepositoryAnalysis,
        documents: list[RepositoryDocument],
    ) -> RepositoryContext:
        """
        Combine analysis results and documents into a unified context.

        Only assembles data — no LLM inference, prompts, or summarization.
        """
        return RepositoryContext(
            metadata=analysis.metadata,
            tree=analysis.tree,
            documents=documents,
        )
