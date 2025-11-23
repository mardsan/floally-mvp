"""
Migration script to drop and recreate trusted_senders table with correct schema
Run this once to fix the schema mismatch issue
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def migrate_trusted_senders():
    """Drop and recreate trusted_senders table with correct schema"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not set!")
        return
    
    print("🔗 Connecting to database...")
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            # Drop existing table
            print("🗑️  Dropping old trusted_senders table...")
            conn.execute(text("DROP TABLE IF EXISTS trusted_senders CASCADE"))
            conn.commit()
            print("✅ Old table dropped")
            
            # Create trustlevel enum if it doesn't exist
            print("🔨 Creating trustlevel enum...")
            conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE trustlevel AS ENUM ('trusted', 'blocked', 'one_time');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            conn.commit()
            print("✅ Enum type ready")
            
            # Create new table with correct schema
            print("🔨 Creating new trusted_senders table...")
            conn.execute(text("""
                CREATE TABLE trusted_senders (
                    id SERIAL PRIMARY KEY,
                    user_id UUID NOT NULL,
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
            print("✅ New table created with trust_level column!")
            
            # Verify the table structure
            print("\n📋 Verifying table structure...")
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'trusted_senders'
                ORDER BY ordinal_position
            """))
            
            print("\nColumns in trusted_senders table:")
            for row in result:
                print(f"  - {row[0]}: {row[1]}")
            
            print("\n✅ Migration complete!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        engine.dispose()

if __name__ == "__main__":
    migrate_trusted_senders()
