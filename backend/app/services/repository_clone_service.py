import asyncio
import shutil
from pathlib import Path

from fastapi import HTTPException
from git import Repo
from git.exc import GitCommandError

from app.core.logger import logger
from app.utils.workspace import WorkspaceManager

GITHUB_URL_PREFIX = "https://github.com/"

CLONE_TIMEOUT_SECONDS = 300

IGNORED_NAMES = frozenset({".git", "__pycache__", "node_modules", ".venv", ".next"})

LONG_PATH_ERROR_MARKERS = (
    "Filename too long",
    "cannot create directory",
)

LONG_PATH_ERROR_DETAIL = (
    "Repository checkout failed because the repository contains file paths "
    "longer than Windows allows."
)


class RepositoryCloneService:
    """Service for cloning and managing local repository copies."""

    async def clone_repository(self, url: str) -> str:
        """Clone a GitHub repository into a hash-based workspace directory.

        Performs a shallow clone (depth=1) into workspace/{cache_key}.
        Skips cloning if the target directory already exists.

        Args:
            url: GitHub repository URL.

        Returns:
            Absolute local path to the repository.

        Raises:
            HTTPException: On invalid URL, clone failure, or timeout.
        """
        self._validate_github_url(url)
        local_path = WorkspaceManager.get_workspace_path(url)

        logger.info("Workspace: %s", WorkspaceManager.get_workspace_log_path(url))

        if local_path.exists():
            logger.info("Workspace Cache Hit")
            self._log_repository_statistics(local_path)
            logger.info("Workspace Ready")
            return str(local_path.resolve())

        local_path.mkdir(parents=True, exist_ok=True)
        logger.info("Starting clone: Repository: %s", url)

        try:
            await asyncio.wait_for(
                asyncio.to_thread(self._clone, url, local_path),
                timeout=CLONE_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError as exc:
            self._cleanup_workspace(local_path)
            logger.exception("Clone failed.")
            raise HTTPException(
                status_code=504,
                detail="Repository clone timed out.",
            ) from exc
        except GitCommandError as exc:
            self._cleanup_workspace(local_path)
            logger.exception("Clone failed.")
            if self._is_long_path_error(exc):
                raise HTTPException(
                    status_code=500,
                    detail=LONG_PATH_ERROR_DETAIL,
                ) from exc
            raise HTTPException(
                status_code=500,
                detail="Failed to clone repository from GitHub.",
            ) from exc
        except Exception as exc:
            self._cleanup_workspace(local_path)
            logger.exception("Clone failed.")
            raise HTTPException(
                status_code=500,
                detail="Unexpected error while cloning repository.",
            ) from exc

        logger.info("Clone completed successfully.")
        self._log_repository_statistics(local_path)
        logger.info("Workspace Ready")
        return str(local_path.resolve())

    def _clone(self, url: str, local_path: Path) -> None:
        """Perform a shallow git clone on a background thread."""
        Repo.clone_from(
            url,
            local_path,
            multi_options=["--depth", "1"],
        )

    def _cleanup_workspace(self, local_path: Path) -> None:
        """Remove a partial workspace directory, ignoring cleanup errors."""
        logger.info("Cleaning workspace...")
        try:
            if local_path.exists():
                shutil.rmtree(local_path)
        except Exception:
            logger.warning("Failed to fully clean workspace: %s", local_path)

    def _is_long_path_error(self, exc: GitCommandError) -> bool:
        """Return True if the Git error indicates a Windows long path failure."""
        stderr = exc.stderr or ""
        if isinstance(stderr, bytes):
            stderr = stderr.decode("utf-8", errors="replace")
        message = f"{stderr} {exc}"
        return any(marker in message for marker in LONG_PATH_ERROR_MARKERS)

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

    def _validate_github_url(self, url: str) -> None:
        """Validate a GitHub repository URL.

        Expected format: https://github.com/{owner}/{repository}[...]

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
