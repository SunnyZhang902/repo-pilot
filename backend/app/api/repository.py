import time

from fastapi import APIRouter

from app.core.logger import logger
from app.schemas.repository import (
    RepositoryImportRequest,
    RepositoryMetadata,
    RepositorySummaryResponse,
)
from app.services.repository_analyzer import RepositoryAnalyzer
from app.services.repository_file_reader_service import RepositoryFileReaderService
from app.services.repository_knowledge_builder import RepositoryKnowledgeBuilder
from app.services.repository_summary_service import RepositorySummaryService

router = APIRouter(prefix="/api/repositories", tags=["repositories"])

repository_analyzer = RepositoryAnalyzer()
repository_file_reader_service = RepositoryFileReaderService()
repository_knowledge_builder = RepositoryKnowledgeBuilder()
repository_summary_service = RepositorySummaryService()


@router.post("/import", response_model=RepositoryMetadata)
async def import_repository(request: RepositoryImportRequest) -> RepositoryMetadata:
    """Fetch metadata for a GitHub repository from the provided URL."""
    return await repository_analyzer.get_metadata(request.url)


@router.post("/summary", response_model=RepositorySummaryResponse)
async def summarize_repository(
    request: RepositoryImportRequest,
) -> RepositorySummaryResponse:
    """Run the full analysis pipeline and generate an AI repository summary."""
    pipeline_start = time.perf_counter()
    logger.info("Summary Pipeline Started")
    logger.info("Repository: %s", request.url)

    analysis = await repository_analyzer.analyze(request.url)
    documents = repository_file_reader_service.collect_documents(analysis.local_path)
    knowledge = repository_knowledge_builder.build(analysis, documents)
    summary = await repository_summary_service.generate_summary(knowledge)

    elapsed = time.perf_counter() - pipeline_start
    logger.info("Summary Pipeline Finished")
    logger.info("Total Time: %.2fs", elapsed)

    return RepositorySummaryResponse(
        summary=summary,
        metadata=analysis.metadata,
        tree=analysis.tree,
    )
