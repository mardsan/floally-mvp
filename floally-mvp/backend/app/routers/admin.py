"""
Admin endpoints for database management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from app.database import get_db, engine
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/admin/init-db")
async def initialize_database():
    """
    Manually initialize database tables
    Useful for fixing missing table issues
    """
    try:
        from app.init_db import init_database
        init_database()
        
        # Verify tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        return {
            "status": "success",
            "message": "Database initialized successfully",
            "tables": tables,
            "trusted_senders_exists": "trusted_senders" in tables
        }
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/check-tables")
async def check_tables():
    """
    Check what tables exist in the database
    """
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        return {
            "tables": tables,
            "trusted_senders_exists": "trusted_senders" in tables
        }
    except Exception as e:
        logger.error(f"Failed to check tables: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/create-trusted-senders")
async def create_trusted_senders_table():
    """
    Manually create the trusted_senders table
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS trusted_senders (
                    id SERIAL PRIMARY KEY,
                    user_id UUID NOT NULL,
                    sender_email VARCHAR(255) NOT NULL,
                    sender_name VARCHAR(255),
                    allow_attachments BOOLEAN DEFAULT true,
                    auto_approved BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used TIMESTAMP,
                    attachment_count INTEGER DEFAULT 0,
                    CONSTRAINT fk_trusted_senders_user 
                        FOREIGN KEY (user_id) 
                        REFERENCES users(id) 
                        ON DELETE CASCADE,
                    CONSTRAINT unique_user_sender 
                        UNIQUE(user_id, sender_email)
                )
            """))
            conn.commit()
        
        # Verify it was created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        return {
            "status": "success",
            "message": "trusted_senders table created",
            "table_exists": "trusted_senders" in tables
        }
    except Exception as e:
        logger.error(f"Failed to create trusted_senders table: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
