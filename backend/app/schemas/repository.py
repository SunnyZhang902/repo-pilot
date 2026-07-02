from pydantic import BaseModel

from app.schemas.parser import RepositoryNode


class RepositoryImportRequest(BaseModel):
    url: str


class RepositoryImportResponse(BaseModel):
    status: str
    repository: str


class RepositoryMetadata(BaseModel):
    name: str
    owner: str
    description: str | None
    stars: int
    forks: int
    language: str | None
    default_branch: str


class RepositoryAnalysis(BaseModel):
    metadata: RepositoryMetadata
    local_path: str
    tree: RepositoryNode