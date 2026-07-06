import shutil
import subprocess

from app.core.logger import logger

_LONG_PATHS_CONFIG_KEY = "core.longpaths"
_LONG_PATHS_ENABLED_VALUE = "true"


class GitEnvironment:
    """Initializes global Git settings required by RepoPilot on application startup."""

    @classmethod
    def initialize(cls) -> None:
        """Ensure Git is available and Windows long path support is enabled."""
        logger.info("Git Environment Initialization Started")

        if shutil.which("git") is None:
            logger.warning("Git executable not found; skipping Git environment setup.")
            return

        version = cls._run_git(["--version"])
        if version:
            logger.info("Git version: %s", version)
        else:
            logger.warning("Unable to determine Git version; continuing startup.")

        current = cls._run_git(["config", "--global", _LONG_PATHS_CONFIG_KEY])
        if current and current.lower() == _LONG_PATHS_ENABLED_VALUE:
            logger.info("core.longpaths: enabled")
            return

        logger.info("Enabling core.longpaths...")
        cls._run_git(
            ["config", "--global", _LONG_PATHS_CONFIG_KEY, _LONG_PATHS_ENABLED_VALUE]
        )

        updated = cls._run_git(["config", "--global", _LONG_PATHS_CONFIG_KEY])
        if updated and updated.lower() == _LONG_PATHS_ENABLED_VALUE:
            logger.info("core.longpaths enabled.")
        else:
            logger.warning(
                "Failed to enable core.longpaths; long repository paths may fail on Windows."
            )

    @staticmethod
    def _run_git(args: list[str]) -> str | None:
        """Run a git command and return stripped stdout, or None on failure."""
        try:
            result = subprocess.run(
                ["git", *args],
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError as exc:
            logger.warning("Git command failed: %s", exc)
            return None

        if result.returncode != 0:
            stderr = (result.stderr or "").strip()
            if stderr:
                logger.warning("Git command %s failed: %s", " ".join(args), stderr)
            return None

        stdout = (result.stdout or "").strip()
        return stdout or None
