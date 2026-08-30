from fastapi import FastAPI

from app.database.connection import engine
from app.routers import monitors

app = FastAPI(
    title="API Monitor",
    description="Simple API health monitoring service",
    version="1.0.0",
)

app.include_router(monitors.router)


@app.get("/")
def root():
    return {
        "message": "API Monitor is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/database-health")
def database_health():
    try:
        with engine.connect():
            return {
                "database": "connected"
            }
    except Exception as e:
        return {
            "database": "error",
            "message": str(e),
        }