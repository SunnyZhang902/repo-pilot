from fastapi import FastAPI

from app.schemas.health import HealthResponse

app = FastAPI(
    title="RepoPilot API",
    version="0.1.0",
    description="AI Repository Understanding Platform",
)


@app.get("/")
async def root():
    return {
        "message": "RepoPilot Backend Running"
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")