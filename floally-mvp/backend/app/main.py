from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, gmail, calendar, ai, user_profile_db, behavior_db, profile, insights, waitlist, standup, projects
import os
from dotenv import load_dotenv

load_dotenv()

import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from contextlib import asynccontextmanager


logger = logging.getLogger("uvicorn.error")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    logger.info("🚀 Starting OkAimy API...")
    
    # Initialize database tables
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        try:
            logger.info("📊 Initializing database tables...")
            from app.database import engine, Base
            from app.models import User, UserProfile, ConnectedAccount, BehaviorAction, UserSettings, SenderStats, Project
            
            # Create all tables if they don't exist
            Base.metadata.create_all(bind=engine)
            logger.info("✅ Database tables initialized successfully")
        except Exception as e:
            logger.error(f"❌ Error initializing database: {e}")
    else:
        logger.warning("⚠️  DATABASE_URL not set - database features disabled")
    
    yield
    
    logger.info("👋 Shutting down OkAimy API...")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log basic request info
        logger.info(f"--> Incoming {request.method} {request.url.path}")
        try:
            response = await call_next(request)
            logger.info(f"<-- Response {response.status_code} for {request.method} {request.url.path}")
            return response
        except Exception as e:
            # Log exception with stack trace
            logger.exception(f"Exception handling {request.method} {request.url.path}: {e}")
            raise


app = FastAPI(
    title="OkAimy API",
    description="AI-powered strategic and operational partner",
    version="1.3.0",
    lifespan=lifespan
)

# CORS configuration - Allow all origins (wildcard)
# Note: Cannot use allow_credentials=True with allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using wildcard
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add request/response logging middleware (helps debug runtime 502s on Railway)
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(gmail.router, prefix="/api/gmail", tags=["gmail"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(user_profile_db.router, prefix="/api/user", tags=["user-profile"])
app.include_router(behavior_db.router, prefix="/api/behavior", tags=["behavior"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(waitlist.router, prefix="/api", tags=["waitlist"])
app.include_router(standup.router, prefix="/api", tags=["standup"])
app.include_router(projects.router, prefix="/api", tags=["projects"])

@app.get("/")
async def root():
    return {
        "message": "OkAimy API",
        "version": "1.3.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
