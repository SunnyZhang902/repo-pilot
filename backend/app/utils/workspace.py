import hashlib
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
WORKSPACE_ROOT = BACKEND_ROOT / "workspace"


class WorkspaceManager:
    """Manages hash-based workspace directories for cloned repositories."""

    @staticmethod
    def get_cache_key(repository_url: str) -> str:
        """Return a stable 10-character cache key derived from the repository URL."""
        normalized = repository_url.strip().rstrip("/")
        digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
        return digest[:10]

    @staticmethod
    def get_workspace_path(repository_url: str) -> Path:
        """Return the local workspace directory for a repository URL."""
        WORKSPACE_ROOT.mkdir(parents=True, exist_ok=True)
        return WORKSPACE_ROOT / WorkspaceManager.get_cache_key(repository_url)

    @staticmethod
    def get_workspace_log_path(repository_url: str) -> str:
        """Return a relative workspace path string for logging."""
        cache_key = WorkspaceManager.get_cache_key(repository_url)
        return f"workspace/{cache_key}"
