from pydantic import BaseModel

from app.schemas.parser import RepositoryNode
from app.schemas.repository import RepositoryMetadata


class RepositoryDocument(BaseModel):
    path: str
    content: str
    document_type: str


class RepositoryContext(BaseModel):
    metadata: RepositoryMetadata
    tree: RepositoryNode
    documents: list[RepositoryDocument]
