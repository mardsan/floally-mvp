"""
Database initialization utilities
Ensures all tables are created, including trusted_senders
"""
import logging
from sqlalchemy import inspect, text
from app.database import engine, Base

logger = logging.getLogger(__name__)

def init_database():
    """
    Initialize all database tables
    Creates tables if they don't exist
    """
    if not engine:
        logger.warning("No database engine available - skipping table creation")
        return
    
    try:
        # Import all models to register them with Base
        from app.models import (
            User, 
            UserProfile, 
            ConnectedAccount, 
            BehaviorAction, 
            UserSettings, 
            SenderStats, 
            Project
        )
        from app.models.trusted_sender import TrustedSender
        
        # Check what tables currently exist
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        logger.info(f"📋 Existing tables: {existing_tables}")
        
        # Create all tables
        logger.info("🔨 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Verify trusted_senders was created
        inspector = inspect(engine)
        updated_tables = inspector.get_table_names()
        
        if 'trusted_senders' in updated_tables:
            logger.info("✅ trusted_senders table verified")
        else:
            logger.error("❌ trusted_senders table NOT created - attempting manual creation")
            # Manual creation as fallback
            create_trusted_senders_manually()
        
        logger.info(f"✅ Database initialized with tables: {updated_tables}")
        
    except Exception as e:
        logger.error(f"❌ Error initializing database: {e}", exc_info=True)
        raise


def create_trusted_senders_manually():
    """
    Manually create trusted_senders table if automatic creation fails
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
            logger.info("✅ Manually created trusted_senders table")
    except Exception as e:
        logger.error(f"❌ Failed to manually create trusted_senders: {e}")
        raise
