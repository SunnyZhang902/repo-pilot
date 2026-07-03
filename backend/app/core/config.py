from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    deepseek_api_key: str
    deepseek_model: str = "deepseek-chat"
    request_timeout: int = 60


settings = Settings()
