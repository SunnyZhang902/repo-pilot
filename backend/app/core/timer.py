import time
from types import TracebackType

from app.core.logger import logger


class Timer:
    """Context manager that measures and logs elapsed time for a named operation."""

    def __init__(self, name: str) -> None:
        self.name = name
        self._start: float = 0.0

    def __enter__(self) -> "Timer":
        self._start = time.perf_counter()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        elapsed = time.perf_counter() - self._start
        logger.info("%s completed in %.2fs", self.name, elapsed)
