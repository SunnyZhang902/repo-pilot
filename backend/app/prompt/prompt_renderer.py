from app.schemas.context import RepositoryDocument
from app.schemas.knowledge import RepositoryKnowledge
from app.schemas.parser import RepositoryNode
from app.schemas.repository import RepositoryMetadata

_DOCUMENT_TYPE_DESCRIPTIONS: dict[str, str] = {
    "readme": "Repository overview and usage documentation.",
    "package": "Node.js project dependencies and npm scripts.",
    "package_json": "Node.js project dependencies and npm scripts.",
    "python_config": "Python project configuration.",
    "pyproject": "Python project configuration.",
    "requirements": "Python package dependency list.",
    "docker": "Container build configuration.",
    "dockerfile": "Container build configuration.",
    "compose": "Multi-container deployment configuration.",
    "docker_compose": "Multi-container deployment configuration.",
    "makefile": "Build automation configuration.",
    "environment": "Environment variable template.",
    "env_example": "Environment variable template.",
}

_DEFAULT_DOCUMENT_DESCRIPTION = "Project document."


class PromptRenderer:
    """Replaces template placeholders with formatted RepositoryKnowledge content."""

    def render(self, template: str, knowledge: RepositoryKnowledge) -> str:
        """Render a template string by substituting knowledge placeholders."""
        mapping = self._build_placeholder_mapping(knowledge)

        rendered = template
        for key, value in mapping.items():
            rendered = rendered.replace(f"{{{{{key}}}}}", value)
        return rendered

    def _build_placeholder_mapping(
        self, knowledge: RepositoryKnowledge
    ) -> dict[str, str]:
        """Build placeholder key to rendered content mapping."""
        return {
            "REPOSITORY_METADATA": self._format_metadata(knowledge.metadata),
            "LANGUAGES": self._format_bullet_list(knowledge.languages),
            "DEPENDENCIES": self._format_bullet_list(knowledge.dependencies),
            "ENTRY_POINTS": self._format_bullet_list(knowledge.entry_points),
            "CONFIGURATION_FILES": self._format_bullet_list(
                knowledge.configuration_files
            ),
            "REPOSITORY_STRUCTURE": self._format_tree(knowledge.tree),
            "PROJECT_DOCUMENTS": self._format_documents(knowledge.documents),
        }

    def _format_metadata(self, metadata: RepositoryMetadata) -> str:
        description = metadata.description or "No description provided."
        return (
            f"- Name: {metadata.name}\n"
            f"- Owner: {metadata.owner}\n"
            f"- Description: {description}\n"
            f"- Language: {metadata.language or 'Unknown'}\n"
            f"- Stars: {metadata.stars}\n"
            f"- Forks: {metadata.forks}\n"
            f"- Default Branch: {metadata.default_branch}"
        )

    def _format_bullet_list(self, items: list[str]) -> str:
        if not items:
            return "- (none detected)"
        return "\n".join(f"- {item}" for item in items)

    def _format_tree(self, tree: RepositoryNode) -> str:
        lines = self._render_tree_lines(tree)
        return "\n".join(lines) if lines else "(empty)"

    def _format_documents(self, documents: list[RepositoryDocument]) -> str:
        if not documents:
            return "(No supported documents found.)"

        parts: list[str] = []
        for document in documents:
            description = _DOCUMENT_TYPE_DESCRIPTIONS.get(
                document.document_type,
                _DEFAULT_DOCUMENT_DESCRIPTION,
            )
            parts.extend([
                "---",
                "",
                f"### {document.path}",
                "",
                description,
                "",
                f"```markdown\n{document.content}\n```",
            ])

        return "\n".join(parts)

    def _render_tree_lines(
        self, node: RepositoryNode, prefix: str = ""
    ) -> list[str]:
        suffix = "/" if node.type == "directory" else ""
        lines = [f"{prefix}{node.name}{suffix}"]

        if node.type == "directory":
            child_prefix = f"{prefix}  "
            for child in node.children:
                lines.extend(self._render_tree_lines(child, child_prefix))

        return lines
