import httpx
from fastapi import HTTPException

from app.schemas.repository import RepositoryMetadata

# GitHub repository URLs must use this prefix.
GITHUB_URL_PREFIX = "https://github.com/"

# GitHub REST API base path for repository metadata.
GITHUB_API_REPOS_URL = "https://api.github.com/repos"


class GitHubService:
    """Service for interacting with the GitHub REST API."""

    async def get_repository_metadata(self, url: str) -> RepositoryMetadata:
        """
        Fetch metadata for a GitHub repository.

        Validates the URL, resolves owner/repo, calls the GitHub API,
        and returns a normalized RepositoryMetadata schema.
        """
        owner, repo = self._parse_github_url(url)
        api_url = f"{GITHUB_API_REPOS_URL}/{owner}/{repo}"

        async with httpx.AsyncClient() as client:
            response = await client.get(api_url)

        if response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Repository does not exist",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"GitHub API request failed with status {response.status_code}",
            )

        data = response.json()

        return RepositoryMetadata(
            name=data["name"],
            owner=data["owner"]["login"],
            description=data.get("description"),
            stars=data["stargazers_count"],
            forks=data["forks_count"],
            language=data.get("language"),
            default_branch=data["default_branch"],
        )

    def _parse_github_url(self, url: str) -> tuple[str, str]:
        """
        Validate a GitHub repository URL and extract owner and repo name.

        Expected format: https://github.com/{owner}/{repository}[...]
        Example: https://github.com/langchain-ai/langgraph
                 -> owner="langchain-ai", repo="langgraph"
        """
        if not url.startswith(GITHUB_URL_PREFIX):
            raise HTTPException(
                status_code=400,
                detail=f"URL must start with {GITHUB_URL_PREFIX}",
            )

        # Strip the known prefix and any trailing slashes.
        path = url.removeprefix(GITHUB_URL_PREFIX).strip("/")

        if not path:
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub repository URL: missing owner and repository",
            )

        segments = path.split("/")
        owner, repo = segments[0], segments[1] if len(segments) > 1 else ""

        if not owner or not repo:
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub repository URL: missing owner or repository name",
            )

        return owner, repo
