from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.repository import router as repository_router
from app.schemas.health import HealthResponse

app = FastAPI(
    title="RepoPilot API",
    version="0.1.0",
    description="AI Repository Understanding Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repository_router)


@app.get("/")
async def root():
    return {
        "message": "RepoPilot Backend Running"
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")