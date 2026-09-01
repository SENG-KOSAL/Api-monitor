import logging

from fastapi import FastAPI

from app.database.connection import engine
from app.routers import monitors
from app.services.scheduler import scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="API Monitor",
    description="Simple API health monitoring service",
    version="1.0.0",
)

app.include_router(monitors.router)


@app.on_event("startup")
async def startup_event():
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_event():
    scheduler.stop()


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