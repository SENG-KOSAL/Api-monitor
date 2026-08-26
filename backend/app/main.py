from fastapi import FastAPI

app = FastAPI(
    title="API Monitor",
    description="Simple API health monitoring service",
    version="1.0.0",
)


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