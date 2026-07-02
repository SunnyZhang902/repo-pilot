from fastapi import APIRouter, HTTPException

from app.schemas.repository import RepositoryImportRequest, RepositoryImportResponse

# GitHub repository URLs must use this prefix.
GITHUB_URL_PREFIX = "https://github.com/"

router = APIRouter(prefix="/api/repositories", tags=["repositories"])


def _extract_repository_name(url: str) -> str:
    """
    Parse the repository name from a GitHub URL.

    Expected format: https://github.com/{owner}/{repository}[...]
    Example: https://github.com/langchain-ai/langgraph -> "langgraph"
    """
    # Strip the known prefix and any trailing slashes.
    path = url.removeprefix(GITHUB_URL_PREFIX).strip("/")

    if not path:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL: missing owner and repository",
        )

    # First segment is the owner, second is the repository name.
    segments = path.split("/")
    if len(segments) < 2 or not segments[1]:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL: missing repository name",
        )

    return segments[1]


@router.post("/import", response_model=RepositoryImportResponse)
async def import_repository(body: RepositoryImportRequest) -> RepositoryImportResponse:
    """
    Validate a GitHub repository URL and return the extracted repository name.

    Cloning is not performed at this stage — only URL validation and parsing.
    """
    if not body.url.startswith(GITHUB_URL_PREFIX):
        raise HTTPException(
            status_code=400,
            detail=f"URL must start with {GITHUB_URL_PREFIX}",
        )

    repository_name = _extract_repository_name(body.url)

    return RepositoryImportResponse(
        status="success",
        repository=repository_name,
    )
