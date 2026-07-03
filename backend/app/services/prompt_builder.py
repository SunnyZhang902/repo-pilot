from enum import Enum

from app.schemas.context import RepositoryContext, RepositoryDocument
from app.schemas.parser import RepositoryNode
from app.schemas.repository import RepositoryMetadata


class PromptType(str, Enum):
    """Supported LLM prompt categories; extend as new capabilities are added."""

    SUMMARY = "summary"
    ARCHITECTURE = "architecture"
    CHAT = "chat"
    READING_GUIDE = "reading_guide"
    REVIEW = "review"


class PromptBuilder:
    """Builds structured LLM prompts from repository context."""

    _SUMMARY_INSTRUCTION = """\
## Task

You are an AI Software Onboarding Engineer.

Based on the repository metadata, file structure, and project documents above,
write a clear and concise summary of this repository.

Cover:
- What the project does
- Its primary technology stack
- How the codebase is organized
- Key entry points a new developer should know

Respond in plain text."""

    def build(self, context: RepositoryContext, prompt_type: PromptType) -> str:
        """Assemble a prompt string ready to send to an LLM."""
        if prompt_type == PromptType.SUMMARY:
            return self._build_summary_prompt(context)

        raise NotImplementedError(
            f"Prompt type not yet supported: {prompt_type.value}"
        )

    def _build_summary_prompt(self, context: RepositoryContext) -> str:
        """Build a repository summary prompt from context sections."""
        sections = [
            "# Repository Context\n",
            self._format_metadata_section(context.metadata),
            self._format_tree_section(context.tree),
            self._format_documents_section(context.documents),
            self._SUMMARY_INSTRUCTION,
        ]
        return "\n\n".join(sections)

    def _format_metadata_section(self, metadata: RepositoryMetadata) -> str:
        """Format repository metadata as a prompt section."""
        description = metadata.description or "No description provided."

        return f"""\
## Repository Metadata

- Name: {metadata.name}
- Owner: {metadata.owner}
- Description: {description}
- Language: {metadata.language or "Unknown"}
- Stars: {metadata.stars}
- Forks: {metadata.forks}
- Default Branch: {metadata.default_branch}"""

    def _format_tree_section(self, tree: RepositoryNode) -> str:
        """Format the repository file tree as a prompt section."""
        lines = self._render_tree_lines(tree)
        tree_text = "\n".join(lines) if lines else "(empty)"

        return f"""\
## Repository Structure

```
{tree_text}
```"""

    def _render_tree_lines(
        self, node: RepositoryNode, prefix: str = ""
    ) -> list[str]:
        """Recursively render a repository tree as indented lines."""
        suffix = "/" if node.type == "directory" else ""
        lines = [f"{prefix}{node.name}{suffix}"]

        if node.type == "directory":
            child_prefix = f"{prefix}  "
            for child in node.children:
                lines.extend(self._render_tree_lines(child, child_prefix))

        return lines

    def _format_documents_section(
        self, documents: list[RepositoryDocument]
    ) -> str:
        """Format project documents as a prompt section."""
        if not documents:
            return "## Project Documents\n\n(No supported documents found.)"

        parts = ["## Project Documents"]

        for document in documents:
            parts.append(
                f"### {document.document_type} ({document.path})\n\n"
                f"```\n{document.content}\n```"
            )

        return "\n\n".join(parts)
