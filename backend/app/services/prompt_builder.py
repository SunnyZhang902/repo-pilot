from enum import Enum

from app.schemas.context import RepositoryDocument
from app.schemas.knowledge import RepositoryKnowledge
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
    """Builds structured LLM prompts from repository knowledge."""

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

    _SUMMARY_TASK = """\
## Task

你是一名 AI 软件入职工程师（AI Software Onboarding Engineer）。

请根据上方的仓库知识，为**从未接触过该仓库的中文开发者**撰写一份 onboarding 摘要。

**输出要求：**

- 必须使用**简体中文**撰写
- 必须使用 **Markdown** 格式
- 项目名称、库名、框架名、代码标识符保持**英文**，不要翻译
- 不要直接复制 README 原文，请用自己的话概括
- 不要翻译代码内容

**必须严格使用以下 Markdown 标题结构（按顺序输出）：**

# 项目简介

# 技术栈

# 核心依赖

# 项目结构

# 推荐阅读顺序

# 总结"""

    def build(self, knowledge: RepositoryKnowledge, prompt_type: PromptType) -> str:
        """Assemble a prompt string ready to send to an LLM.

        Args:
            knowledge: Structured repository knowledge.
            prompt_type: The target AI capability prompt to build.

        Returns:
            A complete prompt string for the LLM.

        Raises:
            NotImplementedError: If the prompt type is not yet supported.
        """
        if prompt_type == PromptType.SUMMARY:
            return self._build_summary_prompt(knowledge)

        raise NotImplementedError(
            f"Prompt type not yet supported: {prompt_type.value}"
        )

    def _build_summary_prompt(self, knowledge: RepositoryKnowledge) -> str:
        """Build a repository summary prompt from knowledge sections."""
        sections = [
            "# Repository Knowledge\n",
            self._format_metadata_section(knowledge.metadata),
            self._format_languages_section(knowledge.languages),
            self._format_dependencies_section(knowledge.dependencies),
            self._format_entry_points_section(knowledge.entry_points),
            self._format_configuration_files_section(knowledge.configuration_files),
            self._format_tree_section(knowledge.tree),
            self._format_documents_section(knowledge.documents),
            self._SUMMARY_TASK,
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

    def _format_languages_section(self, languages: list[str]) -> str:
        """Format detected programming languages."""
        body = self._format_bullet_list(languages)
        return f"## Languages\n\n{body}"

    def _format_dependencies_section(self, dependencies: list[str]) -> str:
        """Format project dependencies."""
        body = self._format_bullet_list(dependencies)
        return f"## Dependencies\n\n{body}"

    def _format_entry_points_section(self, entry_points: list[str]) -> str:
        """Format detected entry points."""
        body = self._format_bullet_list(entry_points)
        return f"## Entry Points\n\n{body}"

    def _format_configuration_files_section(
        self, configuration_files: list[str]
    ) -> str:
        """Format detected configuration files."""
        body = self._format_bullet_list(configuration_files)
        return f"## Configuration Files\n\n{body}"

    def _format_tree_section(self, tree: RepositoryNode) -> str:
        """Format the repository file tree as a prompt section."""
        lines = self._render_tree_lines(tree)
        tree_text = "\n".join(lines) if lines else "(empty)"

        return f"""\
## Repository Structure

```text
{tree_text}
```"""

    def _format_documents_section(self, documents: list[RepositoryDocument]) -> str:
        """Format project documents as a prompt section."""
        if not documents:
            return (
                "## Project Documents\n\n"
                "The following are important project documents collected "
                "from the repository root.\n\n"
                "(No supported documents found.)"
            )

        parts = [
            "## Project Documents",
            "",
            "The following are important project documents collected "
            "from the repository root.",
        ]

        for document in documents:
            description = self._describe_document(document.document_type)
            parts.extend([
                "",
                "---",
                "",
                f"### {document.path}",
                "",
                description,
                "",
                f"```markdown\n{document.content}\n```",
            ])

        return "\n".join(parts)

    def _describe_document(self, document_type: str) -> str:
        """Return a short human-readable description for a document category."""
        return self._DOCUMENT_TYPE_DESCRIPTIONS.get(
            document_type,
            self._DEFAULT_DOCUMENT_DESCRIPTION,
        )

    def _format_bullet_list(self, items: list[str]) -> str:
        """Format a list of strings as a Markdown unordered list."""
        if not items:
            return "- (none detected)"
        return "\n".join(f"- {item}" for item in items)

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
