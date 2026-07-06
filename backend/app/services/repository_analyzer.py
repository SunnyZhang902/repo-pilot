from app.core.timer import Timer
from app.schemas.repository import RepositoryAnalysis, RepositoryMetadata
from app.services.github_service import GitHubService
from app.services.repository_clone_service import RepositoryCloneService
from app.services.repository_parser_service import RepositoryParserService


class RepositoryAnalyzer:
    """Orchestrates repository metadata fetch, clone, and file tree parsing."""

    def __init__(self) -> None:
        self.github_service = GitHubService()
        self.repository_clone_service = RepositoryCloneService()
        self.repository_parser_service = RepositoryParserService()

    async def get_metadata(self, url: str) -> RepositoryMetadata:
        """Fetch GitHub repository metadata without cloning or parsing."""
        return await self.github_service.get_repository_metadata(url)

    async def analyze(self, url: str) -> RepositoryAnalysis:
        """
        Run the full repository analysis workflow.

        1. Fetch metadata from GitHub
        2. Clone the repository locally
        3. Parse the local file tree
        """
        with Timer("GitHub Metadata"):
            metadata = await self.github_service.get_repository_metadata(url)

        with Timer("Clone Repository"):
            local_path = await self.repository_clone_service.clone_repository(url)

        with Timer("Parse Repository"):
            tree = self.repository_parser_service.parse_repository(local_path)

        return RepositoryAnalysis(
            metadata=metadata,
            local_path=local_path,
            tree=tree,
        )
