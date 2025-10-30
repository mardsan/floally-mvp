#!/usr/bin/env python3
"""
Quick script to check database credentials and OAuth scopes
"""
from app.database import SessionLocal
from app.models.user import User, ConnectedAccount
from sqlalchemy import func
from datetime import datetime

def check_credentials():
    db = SessionLocal()
    try:
        print("=" * 80)
        print("DATABASE CREDENTIALS CHECK")
        print("=" * 80)
        
        # Count total users
        user_count = db.query(User).count()
        print(f"\n📊 Total users in database: {user_count}")
        
        # Count connected accounts
        account_count = db.query(ConnectedAccount).count()
        print(f"📊 Total connected accounts: {account_count}")
        
        # List all connected accounts
        accounts = db.query(ConnectedAccount).all()
        
        if not accounts:
            print("\n⚠️  No connected accounts found!")
            print("\nNext steps:")
            print("1. Visit https://floally-mvp-production.up.railway.app/api/auth/login")
            print("2. Complete Google OAuth flow")
            print("3. Run this script again")
            return
        
        print("\n" + "=" * 80)
        print("CONNECTED ACCOUNTS")
        print("=" * 80)
        
        for i, account in enumerate(accounts, 1):
            print(f"\n{i}. Account ID: {account.id}")
            print(f"   Email: {account.email}")
            print(f"   Provider: {account.provider}")
            print(f"   Provider Account ID: {account.provider_account_id}")
            print(f"   Has Access Token: {'✅ Yes' if account.access_token else '❌ No'}")
            print(f"   Has Refresh Token: {'✅ Yes' if account.refresh_token else '❌ No'}")
            
            if account.token_expires_at:
                now = datetime.utcnow()
                is_expired = account.token_expires_at < now
                time_diff = abs((account.token_expires_at - now).total_seconds() / 3600)
                
                if is_expired:
                    print(f"   Token Status: ❌ EXPIRED ({time_diff:.1f} hours ago)")
                else:
                    print(f"   Token Status: ✅ Valid (expires in {time_diff:.1f} hours)")
                print(f"   Token Expires At: {account.token_expires_at}")
            else:
                print(f"   Token Status: ⚠️  No expiry set")
            
            print(f"   Scopes: {account.scopes}")
            
            # Check for required Gmail scopes
            if account.scopes:
                has_gmail_readonly = 'https://www.googleapis.com/auth/gmail.readonly' in account.scopes
                has_gmail_send = 'https://www.googleapis.com/auth/gmail.send' in account.scopes
                has_calendar_readonly = 'https://www.googleapis.com/auth/calendar.readonly' in account.scopes
                
                print(f"\n   Scope Check:")
                print(f"   - gmail.readonly: {'✅ Yes' if has_gmail_readonly else '❌ No'}")
                print(f"   - gmail.send: {'✅ Yes' if has_gmail_send else '❌ No'}")
                print(f"   - calendar.readonly: {'✅ Yes' if has_calendar_readonly else '❌ No'}")
                
                if not has_gmail_readonly:
                    print(f"\n   ⚠️  WARNING: Missing gmail.readonly scope!")
                    print(f"   This is required for standup analysis to work.")
            else:
                print(f"   ⚠️  WARNING: No scopes found!")
            
            print(f"   Created: {account.created_at}")
            print(f"   Updated: {account.updated_at}")
        
        print("\n" + "=" * 80)
        print("RECOMMENDATIONS")
        print("=" * 80)
        
        # Check for expired tokens
        expired_accounts = [a for a in accounts if a.token_expires_at and a.token_expires_at < datetime.utcnow()]
        if expired_accounts:
            print(f"\n⚠️  {len(expired_accounts)} account(s) have expired tokens")
            print("   Recommendation: Re-authenticate via /api/auth/login")
        
        # Check for missing scopes
        missing_scopes_accounts = [
            a for a in accounts 
            if not a.scopes or 'https://www.googleapis.com/auth/gmail.readonly' not in a.scopes
        ]
        if missing_scopes_accounts:
            print(f"\n⚠️  {len(missing_scopes_accounts)} account(s) missing required Gmail scopes")
            print("   Recommendation: Re-authenticate via /api/auth/login to grant permissions")
        
        # Check for missing refresh tokens
        no_refresh_token = [a for a in accounts if not a.refresh_token]
        if no_refresh_token:
            print(f"\n⚠️  {len(no_refresh_token)} account(s) missing refresh token")
            print("   Recommendation: Re-authenticate with prompt=consent")
        
        if not expired_accounts and not missing_scopes_accounts and not no_refresh_token:
            print("\n✅ All accounts look good!")
            print("   OAuth credentials are properly configured.")
        
    except Exception as e:
        print(f"\n❌ Error checking credentials: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_credentials()
