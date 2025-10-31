#!/usr/bin/env python3
"""
Add standup_status table via Railway CLI or deployed environment.

This migration adds the standup_status table for tracking user's daily focus status.

Usage:
  On Railway: railway run python migrate_add_standup_status.py
  Locally with DATABASE_URL: python migrate_add_standup_status.py
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

def run_migration():
    """Run the migration to add standup_status table"""
    from app.database import engine
    from app.models import StandupStatus
    
    if not engine:
        print("❌ Database engine not initialized.")
        print("Make sure DATABASE_URL is set in your environment.")
        print("\nFor Railway deployment:")
        print("  railway run python migrate_add_standup_status.py")
        return False
    
    print("🔨 Adding standup_status table...")
    print(f"Database: {engine.url}")
    
    try:
        # Create the table
        StandupStatus.__table__.create(engine, checkfirst=True)
        
        print("\n✅ Migration successful!")
        print("\nAdded table: standup_status")
        print("Columns:")
        for col in StandupStatus.__table__.columns:
            print(f"  - {col.name}: {col.type}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
