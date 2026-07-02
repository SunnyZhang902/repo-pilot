from fastapi import APIRouter

from app.schemas.repository import RepositoryImportRequest, RepositoryMetadata
from app.services.github_service import GitHubService

router = APIRouter(prefix="/api/repositories", tags=["repositories"])

github_service = GitHubService()


@router.post("/import", response_model=RepositoryMetadata)
async def import_repository(request: RepositoryImportRequest) -> RepositoryMetadata:
    """Fetch metadata for a GitHub repository from the provided URL."""
    return await github_service.get_repository_metadata(request.url)
