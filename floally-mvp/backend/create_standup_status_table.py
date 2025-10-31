#!/usr/bin/env python3
"""
Create standup_status table for tracking user's daily focus and status.
Run this once to add the table to your existing database.
"""
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.database import engine, Base
from app.models import StandupStatus

def create_standup_status_table():
    """Create the standup_status table"""
    
    if not engine:
        print("❌ Database engine not initialized. Check DATABASE_URL environment variable.")
        print(f"DATABASE_URL is set: {bool(os.getenv('DATABASE_URL'))}")
        return
    
    print("🔨 Creating standup_status table...")
    
    try:
        # Create only the StandupStatus table
        StandupStatus.__table__.create(engine, checkfirst=True)
        print("✅ Successfully created standup_status table!")
        print("\nTable structure:")
        print("  - id (UUID, primary key)")
        print("  - user_id (UUID, foreign key to users)")
        print("  - task_title (String, not null)")
        print("  - task_description (Text)")
        print("  - task_project (String)")
        print("  - urgency (Integer)")
        print("  - status (String: not_started, in_progress, completed, deferred)")
        print("  - started_at (DateTime)")
        print("  - completed_at (DateTime)")
        print("  - ai_reasoning (Text)")
        print("  - secondary_priorities (JSONB)")
        print("  - daily_plan (JSONB)")
        print("  - date (DateTime, indexed)")
        print("  - created_at (DateTime)")
        print("  - updated_at (DateTime)")
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    create_standup_status_table()
