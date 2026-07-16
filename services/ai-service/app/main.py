from fastapi import FastAPI
from app.routers import recommendations, search, analytics

app = FastAPI(
    title="CodeHaat AI Service",
    description="AI-powered recommendations, search, and analytics",
    version="0.1.0"
)

app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "codehaat-ai", "version": "0.1.0"}
