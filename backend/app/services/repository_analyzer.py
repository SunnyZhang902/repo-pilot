from app.schemas.repository import RepositoryAnalysis
from app.services.github_service import GitHubService
from app.services.parser_service import ParserService
from app.services.repository_service import RepositoryService


class RepositoryAnalyzer:
    """Orchestrates repository metadata fetch, clone, and file tree parsing."""

    def __init__(self) -> None:
        self.github_service = GitHubService()
        self.repository_service = RepositoryService()
        self.parser_service = ParserService()

    async def analyze(self, url: str) -> RepositoryAnalysis:
        """
        Run the full repository analysis workflow.

        1. Fetch metadata from GitHub
        2. Clone the repository locally
        3. Parse the local file tree
        """
        metadata = await self.github_service.get_repository_metadata(url)
        local_path = await self.repository_service.clone_repository(url)
        tree = self.parser_service.parse_repository(local_path)

        return RepositoryAnalysis(
            metadata=metadata,
            local_path=local_path,
            tree=tree,
        )
