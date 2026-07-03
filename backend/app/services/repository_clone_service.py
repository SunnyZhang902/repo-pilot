import asyncio
import shutil
from pathlib import Path

from fastapi import HTTPException
from git import Repo
from git.exc import GitCommandError

from app.core.logger import logger

# GitHub repository URLs must use this prefix.
GITHUB_URL_PREFIX = "https://github.com/"

# backend/workspace — created automatically if missing.
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BACKEND_ROOT / "workspace"

# Maximum seconds to wait for a shallow clone before aborting.
CLONE_TIMEOUT_SECONDS = 300

# Directory and file names excluded from statistics traversal.
IGNORED_NAMES = frozenset({".git", "__pycache__", "node_modules", ".venv", ".next"})


class RepositoryCloneService:
    """Service for cloning and managing local repository copies."""

    def __init__(self, workspace_dir: Path | None = None) -> None:
        self.workspace_dir = workspace_dir or WORKSPACE_DIR
        self.workspace_dir.mkdir(parents=True, exist_ok=True)

    async def clone_repository(self, url: str) -> str:
        """Clone a GitHub repository into the workspace directory.

        Performs a shallow clone (depth=1) into workspace/{owner}/{repository}.
        Skips cloning if the target directory already exists.

        Args:
            url: GitHub repository URL.

        Returns:
            Absolute local path to the repository.

        Raises:
            HTTPException: On invalid URL, clone failure, or timeout.
        """
        owner, repo_name = self._parse_github_url(url)
        local_path = self.workspace_dir / owner / repo_name

        if local_path.exists():
            logger.info("Repository already exists: Skipping clone.")
            self._log_repository_statistics(local_path)
            return str(local_path.resolve())

        logger.info("Starting clone: Repository: %s", url)
        local_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            await asyncio.wait_for(
                asyncio.to_thread(self._clone, url, local_path),
                timeout=CLONE_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError as exc:
            self._cleanup_partial_clone(local_path)
            logger.exception("Clone failed.")
            raise HTTPException(
                status_code=504,
                detail="Repository clone timed out.",
            ) from exc
        except GitCommandError as exc:
            self._cleanup_partial_clone(local_path)
            logger.exception("Clone failed.")
            raise HTTPException(
                status_code=500,
                detail="Failed to clone repository from GitHub.",
            ) from exc
        except Exception as exc:
            self._cleanup_partial_clone(local_path)
            logger.exception("Clone failed.")
            raise HTTPException(
                status_code=500,
                detail="Unexpected error while cloning repository.",
            ) from exc

        logger.info("Clone completed successfully.")
        self._log_repository_statistics(local_path)
        return str(local_path.resolve())

    def _clone(self, url: str, local_path: Path) -> None:
        """Perform a shallow git clone on a background thread."""
        Repo.clone_from(
            url,
            local_path,
            multi_options=["--depth", "1"],
        )

    def _cleanup_partial_clone(self, local_path: Path) -> None:
        """Remove a partially cloned repository directory, ignoring cleanup errors."""
        try:
            if local_path.exists():
                shutil.rmtree(local_path)
        except Exception:
            pass

    def _log_repository_statistics(self, root: Path) -> None:
        """Count and log directory and file totals for a local repository."""
        dir_count, file_count = self._collect_statistics(root)
        logger.info("Repository Statistics")
        logger.info("Directories: %d", dir_count)
        logger.info("Files: %d", file_count)

    def _collect_statistics(self, root: Path) -> tuple[int, int]:
        """Traverse a repository and count directories and files."""
        dir_count = 0
        file_count = 0

        for path in root.rglob("*"):
            if path.is_symlink():
                continue

            relative_parts = path.relative_to(root).parts
            if any(part in IGNORED_NAMES for part in relative_parts):
                continue

            if path.is_dir():
                dir_count += 1
            elif path.is_file():
                file_count += 1

        return dir_count, file_count

    def _parse_github_url(self, url: str) -> tuple[str, str]:
        """Validate a GitHub repository URL and extract owner and repository name.

        Expected format: https://github.com/{owner}/{repository}[...]
        Example: https://github.com/langchain-ai/langgraph
                 -> owner="langchain-ai", repo="langgraph"

        Args:
            url: GitHub repository URL.

        Returns:
            Tuple of (owner, repository name).

        Raises:
            HTTPException: If the URL is invalid.
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
