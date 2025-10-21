from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, gmail, calendar, ai, user_profile, behavior, profile, insights, waitlist, standup
import os
from dotenv import load_dotenv

load_dotenv()

import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


logger = logging.getLogger("uvicorn.error")
logging.basicConfig(level=logging.INFO)


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
    version="1.3.0"
)

# CORS configuration - Allow all origins for development/production
# In production, you may want to restrict this to specific domains
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
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
app.include_router(user_profile.router, prefix="/api/user", tags=["user-profile"])
app.include_router(behavior.router, prefix="/api/behavior", tags=["behavior"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(waitlist.router, prefix="/api", tags=["waitlist"])
app.include_router(standup.router, prefix="/api", tags=["standup"])

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
