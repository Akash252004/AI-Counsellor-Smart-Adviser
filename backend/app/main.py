"""
FastAPI application entry point
AI Counsellor Backend API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, profile, dashboard, ai, universities, shortlist, tasks, shortlist_lock

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title="AI Counsellor API",
    description="Backend API for AI-powered study abroad counselling platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(universities.router)
app.include_router(shortlist.router)
app.include_router(tasks.router)
app.include_router(shortlist_lock.router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Counsellor API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": settings.environment
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
