from pydantic import BaseModel, Field

from app.schemas.context import RepositoryDocument
from app.schemas.parser import RepositoryNode
from app.schemas.repository import RepositoryMetadata


class RepositoryKnowledge(BaseModel):
    """Structured repository knowledge for AI capabilities.

    Aggregates normalized facts about a repository — metadata, structure,
    documents, and derived signals — without embedding extraction logic.

    Designed to be consumed by PromptBuilder and future workflows such as
    Repository Chat, Architecture Analysis, Reading Guide, and Code Review.
    Additional fields can be added as the Knowledge Layer grows.
    """

    metadata: RepositoryMetadata
    tree: RepositoryNode
    documents: list[RepositoryDocument]

    entry_points: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    configuration_files: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
