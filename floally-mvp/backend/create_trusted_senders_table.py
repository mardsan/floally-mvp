"""
Create trusted_senders table
Run this script to add the missing table to the database
"""
from app.database import engine, Base
from app.models.trusted_sender import TrustedSender
from app.models.user import User

def create_trusted_senders_table():
    """Create the trusted_senders table"""
    print("Creating trusted_senders table...")
    
    # Create only the trusted_senders table
    TrustedSender.__table__.create(engine, checkfirst=True)
    
    print("✅ trusted_senders table created successfully!")
    print("\nTable schema:")
    print("- id: Integer (Primary Key)")
    print("- user_id: UUID (Foreign Key to users)")
    print("- sender_email: String")
    print("- sender_name: String (nullable)")
    print("- allow_attachments: Boolean (default: True)")
    print("- auto_approved: Boolean (default: False)")
    print("- created_at: DateTime")
    print("- last_used: DateTime (nullable)")
    print("- attachment_count: Integer (default: 0)")

if __name__ == "__main__":
    create_trusted_senders_table()
