"""
Migrate file-based data to PostgreSQL database
This script migrates user profiles and behavior data from JSON files to the database
"""
import json
import os
from pathlib import Path
from datetime import datetime
from app.database import SessionLocal
from app.models import User, UserProfile, BehaviorAction, SenderStats, UserSettings
import uuid

def migrate_user_profiles():
    """Migrate user profiles from user_profiles/ directory"""
    profiles_dir = Path("user_profiles")
    
    if not profiles_dir.exists():
        print("📁 No user_profiles directory found - skipping profile migration")
        return []
    
    db = SessionLocal()
    migrated_users = []
    
    try:
        profile_files = list(profiles_dir.glob("*.json"))
        print(f"\n📋 Found {len(profile_files)} user profile(s) to migrate")
        
        for profile_file in profile_files:
            with open(profile_file) as f:
                data = json.load(f)
            
            email = data.get("user_id", "")  # Old system used email as user_id
            if not email:
                print(f"⚠️  Skipping {profile_file.name} - no email found")
                continue
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                print(f"✓ User {email} already exists - skipping")
                continue
            
            # Create user
            user = User(
                email=email,
                display_name=data.get("display_name"),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            db.flush()  # Get the user ID
            
            # Create profile
            profile = UserProfile(
                user_id=user.id,
                role=data.get("role"),
                company=data.get("company"),
                priorities=data.get("priorities", []),
                decision_style=data.get("decision_style"),
                communication_style=data.get("communication_style"),
                unsubscribe_preference=data.get("unsubscribe_preference"),
                work_hours=data.get("work_hours"),
                timezone=data.get("timezone", "America/Los_Angeles"),
                language=data.get("language", "en"),
                onboarding_completed=data.get("onboarding_completed", False),
                goals=data.get("goals", [])
            )
            db.add(profile)
            
            # Create default settings
            settings = UserSettings(
                user_id=user.id
            )
            db.add(settings)
            
            migrated_users.append({"id": str(user.id), "email": email})
            print(f"✅ Migrated user: {email} (ID: {user.id})")
        
        db.commit()
        print(f"\n✅ Successfully migrated {len(migrated_users)} user profile(s)")
        return migrated_users
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error migrating profiles: {e}")
        raise
    finally:
        db.close()


def migrate_behavior_data(migrated_users):
    """Migrate behavior logs from behavior_data/ directory"""
    behavior_dir = Path("behavior_data")
    
    if not behavior_dir.exists():
        print("\n📁 No behavior_data directory found - skipping behavior migration")
        return
    
    db = SessionLocal()
    
    try:
        # Create email -> user_id mapping
        user_map = {}
        for user_data in migrated_users:
            users = db.query(User).filter(User.id == uuid.UUID(user_data["id"])).all()
            for user in users:
                user_map[user.email] = user.id
        
        behavior_files = list(behavior_dir.glob("*_behavior.json"))
        stats_files = list(behavior_dir.glob("*_sender_stats.json"))
        
        print(f"\n📊 Found {len(behavior_files)} behavior log(s) and {len(stats_files)} sender stats file(s)")
        
        # Migrate behavior logs
        for behavior_file in behavior_files:
            # Extract email from filename (format: email_at_domain_behavior.json)
            filename = behavior_file.stem
            email = filename.replace("_behavior", "").replace("_at_", "@").replace("_", ".")
            
            user_id = user_map.get(email)
            if not user_id:
                print(f"⚠️  No user found for {email} - skipping behavior log")
                continue
            
            with open(behavior_file) as f:
                actions = json.load(f)
            
            for action_data in actions:
                action = BehaviorAction(
                    user_id=user_id,
                    email_id=action_data.get("email_id"),
                    sender_email=action_data.get("sender_email"),
                    sender_domain=action_data.get("sender_domain"),
                    action_type=action_data.get("action_type"),
                    email_category=action_data.get("email_category"),
                    has_unsubscribe=action_data.get("has_unsubscribe", False),
                    confidence_score=action_data.get("confidence_score", 0.0),
                    metadata=action_data.get("metadata"),
                    created_at=datetime.fromisoformat(action_data.get("timestamp", datetime.utcnow().isoformat()))
                )
                db.add(action)
            
            print(f"✅ Migrated {len(actions)} behavior action(s) for {email}")
        
        # Migrate sender stats
        for stats_file in stats_files:
            filename = stats_file.stem
            email = filename.replace("_sender_stats", "").replace("_at_", "@").replace("_", ".")
            
            user_id = user_map.get(email)
            if not user_id:
                print(f"⚠️  No user found for {email} - skipping sender stats")
                continue
            
            with open(stats_file) as f:
                stats_data = json.load(f)
            
            for sender_email, stats in stats_data.items():
                sender_stat = SenderStats(
                    user_id=user_id,
                    sender_email=sender_email,
                    sender_domain=stats.get("sender_domain"),
                    total_emails=stats.get("total_emails", 0),
                    marked_important=stats.get("marked_important", 0),
                    marked_interesting=stats.get("marked_interesting", 0),
                    marked_unimportant=stats.get("marked_unimportant", 0),
                    archived=stats.get("archived", 0),
                    responded=stats.get("responded", 0),
                    trashed=stats.get("trashed", 0),
                    unsubscribed=stats.get("unsubscribed", 0),
                    importance_score=stats.get("importance_score", 0.5)
                )
                db.add(sender_stat)
            
            print(f"✅ Migrated sender stats for {email}")
        
        db.commit()
        print("\n✅ Successfully migrated behavior data")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error migrating behavior data: {e}")
        raise
    finally:
        db.close()


def run_migration():
    """Run the complete migration process"""
    print("=" * 60)
    print("🚀 OpAime Database Migration")
    print("=" * 60)
    print("\nThis will migrate file-based data to PostgreSQL")
    print("Existing database data will not be affected.\n")
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set. Please set it in your environment variables.")
        return
    
    print(f"🔗 Database: {database_url[:40]}...\n")
    
    try:
        # Step 1: Migrate user profiles
        migrated_users = migrate_user_profiles()
        
        # Step 2: Migrate behavior data
        if migrated_users:
            migrate_behavior_data(migrated_users)
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        print(f"\nMigrated {len(migrated_users)} user(s)")
        print("\nYou can now:")
        print("  1. Test the application with the database")
        print("  2. Archive the old files (user_profiles/, behavior_data/)")
        print("  3. Update Railway environment variables")
        
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Migration failed: {e}")
        print("=" * 60)


if __name__ == "__main__":
    run_migration()
