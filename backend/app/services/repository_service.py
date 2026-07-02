import asyncio
from pathlib import Path

from fastapi import HTTPException
from git import Repo

# GitHub repository URLs must use this prefix.
GITHUB_URL_PREFIX = "https://github.com/"

# backend/workspace — created automatically if missing.
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BACKEND_ROOT / "workspace"


class RepositoryService:
    """Service for cloning and managing local repository copies."""

    def __init__(self, workspace_dir: Path | None = None) -> None:
        self.workspace_dir = workspace_dir or WORKSPACE_DIR
        self.workspace_dir.mkdir(parents=True, exist_ok=True)

    async def clone_repository(self, url: str) -> str:
        """
        Clone a GitHub repository into the workspace directory.

        Local layout: workspace/{owner}/{repository}
        Skips cloning if the target directory already exists.

        Returns the absolute local path to the repository.
        """
        owner, repo_name = self._parse_github_url(url)
        local_path = self.workspace_dir / owner / repo_name

        if local_path.exists():
            return str(local_path.resolve())

        try:
            await asyncio.to_thread(Repo.clone_from, url, local_path)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to clone repository: {exc}",
            ) from exc

        return str(local_path.resolve())

    def _parse_github_url(self, url: str) -> tuple[str, str]:
        """
        Validate a GitHub repository URL and extract owner and repository name.

        Expected format: https://github.com/{owner}/{repository}[...]
        Example: https://github.com/langchain-ai/langgraph
                 -> owner="langchain-ai", repo="langgraph"
        """
        if not url.startswith(GITHUB_URL_PREFIX):
            raise HTTPException(
                status_code=400,
                detail=f"URL must start with {GITHUB_URL_PREFIX}",
            )

        path = url.removeprefix(GITHUB_URL_PREFIX).strip("/")

        if not path:
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub repository URL: missing owner and repository",
            )

        segments = path.split("/")
        owner = segments[0]
        repo_name = segments[1] if len(segments) > 1 else ""

        if not owner or not repo_name:
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub repository URL: missing owner or repository name",
            )

        return owner, repo_name
