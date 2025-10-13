from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, gmail, calendar, ai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="FloAlly API",
    description="AI-powered daily stand-up and task automation",
    version="0.1.0"
)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.githubpreview.dev",
        "https://*.app.github.dev",
        "https://refactored-invention-6wpqr6wpqg42r747-5173.app.github.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(gmail.router, prefix="/api/gmail", tags=["gmail"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {
        "message": "FloAlly API",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
