from app.schemas.context import RepositoryDocument
from app.schemas.knowledge import RepositoryKnowledge
from app.schemas.repository import RepositoryAnalysis
from app.services.configuration_extractor import ConfigurationExtractor
from app.services.dependency_extractor import DependencyExtractor
from app.services.entry_point_extractor import EntryPointExtractor
from app.services.language_extractor import LanguageExtractor


class RepositoryKnowledgeBuilder:
    """Assembles structured repository knowledge from analysis and extractors.

    Orchestrates dedicated extractors to populate derived knowledge fields.
    Contains no extraction logic itself — only wiring and assembly.
    """

    def __init__(self) -> None:
        self._dependency_extractor = DependencyExtractor()
        self._entry_point_extractor = EntryPointExtractor()
        self._configuration_extractor = ConfigurationExtractor()
        self._language_extractor = LanguageExtractor()

    def build(
        self,
        analysis: RepositoryAnalysis,
        documents: list[RepositoryDocument],
    ) -> RepositoryKnowledge:
        """Build a fully populated RepositoryKnowledge instance.

        Args:
            analysis: Repository metadata, local path, and file tree.
            documents: Project documents collected from the repository root.

        Returns:
            RepositoryKnowledge with all fields populated by their
            respective extractors.
        """
        repository_path = analysis.local_path

        return RepositoryKnowledge(
            metadata=analysis.metadata,
            tree=analysis.tree,
            documents=documents,
            dependencies=self._dependency_extractor.extract(repository_path),
            entry_points=self._entry_point_extractor.extract(repository_path),
            configuration_files=self._configuration_extractor.extract(repository_path),
            languages=self._language_extractor.extract(repository_path),
        )
