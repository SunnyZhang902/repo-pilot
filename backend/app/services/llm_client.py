from fastapi import HTTPException
from openai import AsyncOpenAI

from app.core.config import settings
from app.core.logger import logger

DEEPSEEK_BASE_URL = "https://api.deepseek.com"

_SYSTEM_MESSAGE = (
    "You are an experienced software architect and repository analysis assistant."
)


class LLMClient:
    """LLM client for generating AI responses via the DeepSeek API."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=DEEPSEEK_BASE_URL,
            timeout=settings.request_timeout,
        )

    async def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
    ) -> str:
        """Generate a text response from the given prompt."""
        try:
            response = await self._client.chat.completions.create(
                model=settings.deepseek_model,
                messages=[
                    {"role": "system", "content": _SYSTEM_MESSAGE},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
            )
        except Exception as exc:
            logger.exception("DeepSeek API call failed")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate repository summary.",
            ) from exc

        return response.choices[0].message.content
