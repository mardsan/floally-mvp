"""
Database migration: Create activity_events table

This migration adds comprehensive event logging for user activity tracking,
AI learning, and behavioral analytics.

Run this script to create the activity_events table in your database.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine, Base
from app.models import ActivityEvent
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_activity_events_table():
    """Create the activity_events table"""
    try:
        logger.info("🚀 Starting activity_events table creation...")
        
        # Create all tables (will only create if they don't exist)
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ activity_events table created successfully!")
        
        # Verify table was created
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'activity_events'
                );
            """))
            exists = result.scalar()
            
            if exists:
                logger.info("✅ Verified: activity_events table exists in database")
                
                # Get column count
                result = conn.execute(text("""
                    SELECT COUNT(*) 
                    FROM information_schema.columns 
                    WHERE table_name = 'activity_events';
                """))
                col_count = result.scalar()
                logger.info(f"📊 Table has {col_count} columns")
                
                # Check indexes
                result = conn.execute(text("""
                    SELECT indexname 
                    FROM pg_indexes 
                    WHERE tablename = 'activity_events';
                """))
                indexes = [row[0] for row in result]
                logger.info(f"🔍 Created indexes: {', '.join(indexes)}")
                
            else:
                logger.error("❌ Table verification failed - activity_events not found")
                return False
        
        logger.info("🎉 Migration complete!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating activity_events table: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Activity Events Table Migration")
    logger.info("=" * 60)
    
    success = create_activity_events_table()
    
    if success:
        logger.info("\n✅ SUCCESS: Migration completed")
        logger.info("\nNext steps:")
        logger.info("1. Deploy backend to Railway (git push)")
        logger.info("2. Integrate frontend event tracking hooks")
        logger.info("3. Start logging user activity")
        sys.exit(0)
    else:
        logger.error("\n❌ FAILED: Migration did not complete")
        logger.error("Check the error logs above and try again")
        sys.exit(1)
