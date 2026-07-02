from pydantic import BaseModel


class RepositoryImportRequest(BaseModel):
    url: str


class RepositoryImportResponse(BaseModel):
    status: str
    repository: str