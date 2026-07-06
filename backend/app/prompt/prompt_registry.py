class PromptRegistry:
    """Maps task and version identifiers to prompt template filenames."""

    _TEMPLATES: dict[tuple[str, str], str] = {
        ("summary", "v1"): "summary_prompt_v1.md",
        ("summary", "v2"): "summary_prompt_v2.md",
    }

    @classmethod
    def get(cls, task: str, version: str) -> str:
        """Return the template filename for a task and version.

        Args:
            task: Prompt capability (e.g. ``summary``).
            version: Prompt version (e.g. ``v1``, ``v2``).

        Returns:
            Template filename relative to the prompts directory.

        Raises:
            KeyError: If the task/version pair is not registered.
        """
        key = (task, version)
        if key not in cls._TEMPLATES:
            supported = ", ".join(
                f"{task}/{ver}" for task, ver in sorted(cls._TEMPLATES)
            )
            raise KeyError(
                f"Unknown prompt template: {task}/{version}. "
                f"Supported: {supported}"
            )
        return cls._TEMPLATES[key]
