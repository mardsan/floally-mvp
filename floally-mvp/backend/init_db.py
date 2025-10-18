"""
Initialize database tables
Run this script to create all database tables
"""
from app.database import engine, Base
from app.models import User, UserProfile, ConnectedAccount, BehaviorAction, UserSettings, SenderStats
import os

def init_db():
    """Create all database tables"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not set. Please set it in your environment variables.")
        print("Example: export DATABASE_URL='postgresql://user:password@localhost:5432/opaime'")
        return False
    
    print(f"📊 Connecting to database...")
    print(f"🔗 Database URL: {database_url[:30]}...")
    
    try:
        # Create all tables
        print("🔨 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nCreated tables:")
        print("  - users")
        print("  - user_profiles")
        print("  - connected_accounts")
        print("  - behavior_actions")
        print("  - user_settings")
        print("  - sender_stats")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

if __name__ == "__main__":
    init_db()
