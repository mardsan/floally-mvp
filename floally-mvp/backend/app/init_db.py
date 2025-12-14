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
    FORCE RECREATES trusted_senders if schema is wrong
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
        from app.services.filter_intelligence import FilterIntelligenceCache
        from app.services.contact_intelligence import ContactIntelligenceCache
        from app.services.decision_transparency import AimiDecision
        
        # Check what tables currently exist
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        logger.info(f"📋 Existing tables: {existing_tables}")
        
        # FORCE DROP AND RECREATE trusted_senders if it exists (to fix schema)
        if 'trusted_senders' in existing_tables:
            logger.info("🔨 Dropping existing trusted_senders table to fix schema...")
            try:
                with engine.connect() as conn:
                    conn.execute(text("DROP TABLE IF EXISTS trusted_senders CASCADE"))
                    conn.commit()
                logger.info("✅ Old trusted_senders table dropped")
            except Exception as e:
                logger.warning(f"Could not drop trusted_senders: {e}")
        
        # Create all tables
        logger.info("🔨 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Verify trusted_senders was created
        inspector = inspect(engine)
        updated_tables = inspector.get_table_names()
        
        if 'trusted_senders' in updated_tables:
            # Verify it has the trust_level column
            columns = [col['name'] for col in inspector.get_columns('trusted_senders')]
            if 'trust_level' in columns:
                logger.info("✅ trusted_senders table verified with trust_level column")
            else:
                logger.error("❌ trusted_senders table missing trust_level column")
                create_trusted_senders_manually()
        else:
            logger.error("❌ trusted_senders table NOT created - attempting manual creation")
            create_trusted_senders_manually()
        
        logger.info(f"✅ Database initialized with tables: {updated_tables}")
        
    except Exception as e:
        logger.error(f"❌ Error initializing database: {e}", exc_info=True)
        raise


def create_trusted_senders_manually():
    """
    Manually create trusted_senders table with trust_level enum
    """
    try:
        with engine.connect() as conn:
            # Create enum type first
            conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE trustlevel AS ENUM ('trusted', 'blocked', 'one_time');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            
            # Create table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS trusted_senders (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    sender_email VARCHAR(255) NOT NULL,
                    sender_name VARCHAR(255),
                    trust_level trustlevel DEFAULT 'one_time' NOT NULL,
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
            logger.info("✅ Manually created trusted_senders table with trust_level enum")
    except Exception as e:
        logger.error(f"❌ Failed to manually create trusted_senders: {e}")
        raise
