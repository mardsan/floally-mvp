#!/usr/bin/env python3
"""
Test script to verify sub-tasks persistence in the database.
This ensures that sub-tasks are properly saved and retrieved with JSONB storage.
"""

import os
import sys
import json
from datetime import datetime
import uuid as uuid_module

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.user import Project, User
from sqlalchemy import text

def test_subtasks_persistence():
    """Test that sub-tasks are properly saved and retrieved"""
    
    print("🧪 Testing Sub-Tasks Persistence\n")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # 1. Find or create a test user
        print("\n1️⃣  Finding test user...")
        test_user = db.query(User).filter(User.email == "test@okaimy.com").first()
        
        if not test_user:
            print("   ℹ️  Test user not found. Using first available user...")
            test_user = db.query(User).first()
            
        if not test_user:
            print("   ❌ No users in database. Please create a user first.")
            return False
            
        print(f"   ✅ Using user: {test_user.email}")
        
        # 2. Create a test project with sub-tasks
        print("\n2️⃣  Creating test project with sub-tasks...")
        
        test_project_data = {
            "name": "Sub-Tasks Persistence Test",
            "description": "Testing if sub-tasks save correctly to JSONB",
            "status": "active",
            "priority": "high",
            "color": "#3b82f6",
            "goals": [
                {
                    "goal": "Test Goal 1",
                    "deadline": "2025-12-15",
                    "status": "active",
                    "sub_tasks": [
                        {
                            "task": "Sub-task 1.1 - Test creation",
                            "estimated_hours": 2.0,
                            "status": "not_started"
                        },
                        {
                            "task": "Sub-task 1.2 - Test persistence",
                            "estimated_hours": 1.5,
                            "status": "in_progress"
                        },
                        {
                            "task": "Sub-task 1.3 - Verify retrieval",
                            "estimated_hours": 1.0,
                            "status": "completed"
                        }
                    ]
                },
                {
                    "goal": "Test Goal 2 - No sub-tasks",
                    "deadline": "2025-12-20",
                    "status": "active"
                }
            ]
        }
        
        test_project = Project(
            id=uuid_module.uuid4(),
            user_id=test_user.id,
            name=test_project_data["name"],
            description=test_project_data["description"],
            status=test_project_data["status"],
            priority=test_project_data["priority"],
            color=test_project_data["color"],
            goals=test_project_data["goals"]
        )
        
        db.add(test_project)
        db.commit()
        db.refresh(test_project)
        
        print(f"   ✅ Created project: {test_project.name} (ID: {test_project.id})")
        print(f"   📊 Goals: {len(test_project.goals)}")
        print(f"   📋 Goal 1 sub-tasks: {len(test_project.goals[0].get('sub_tasks', []))}")
        
        # 3. Retrieve the project and verify sub-tasks
        print("\n3️⃣  Retrieving project from database...")
        
        retrieved_project = db.query(Project).filter(Project.id == test_project.id).first()
        
        if not retrieved_project:
            print("   ❌ Project not found after creation!")
            return False
            
        print(f"   ✅ Retrieved project: {retrieved_project.name}")
        
        # 4. Verify goals structure
        print("\n4️⃣  Verifying goals structure...")
        
        if not retrieved_project.goals:
            print("   ❌ No goals found!")
            return False
            
        print(f"   ✅ Goals count: {len(retrieved_project.goals)}")
        
        # 5. Verify sub-tasks
        print("\n5️⃣  Verifying sub-tasks...")
        
        goal_1 = retrieved_project.goals[0]
        sub_tasks = goal_1.get('sub_tasks', [])
        
        if not sub_tasks:
            print("   ❌ No sub-tasks found in first goal!")
            return False
            
        print(f"   ✅ Sub-tasks count: {len(sub_tasks)}")
        
        for i, sub_task in enumerate(sub_tasks, 1):
            print(f"   📌 Sub-task {i}:")
            print(f"      • Task: {sub_task.get('task', 'N/A')}")
            print(f"      • Hours: {sub_task.get('estimated_hours', 0)}")
            print(f"      • Status: {sub_task.get('status', 'unknown')}")
        
        # 6. Test updating sub-task status
        print("\n6️⃣  Testing sub-task status update...")
        
        # Mark first sub-task as completed
        retrieved_project.goals[0]['sub_tasks'][0]['status'] = 'completed'
        db.commit()
        db.refresh(retrieved_project)
        
        updated_status = retrieved_project.goals[0]['sub_tasks'][0]['status']
        
        if updated_status != 'completed':
            print(f"   ❌ Status update failed! Expected 'completed', got '{updated_status}'")
            return False
            
        print(f"   ✅ Successfully updated sub-task status to: {updated_status}")
        
        # 7. Test SQL-level query (verify JSONB indexing works)
        print("\n7️⃣  Testing JSONB query capabilities...")
        
        # Query projects that have sub-tasks
        query = text("""
            SELECT id, name, 
                   jsonb_array_length(goals) as goal_count,
                   (SELECT COUNT(*) 
                    FROM jsonb_array_elements(goals) as goal
                    WHERE goal ? 'sub_tasks') as goals_with_subtasks
            FROM projects 
            WHERE user_id = :user_id
            AND goals IS NOT NULL
        """)
        
        result = db.execute(query, {"user_id": str(test_user.id)}).fetchall()
        
        for row in result:
            print(f"   📊 Project: {row.name}")
            print(f"      • Total goals: {row.goal_count}")
            print(f"      • Goals with sub-tasks: {row.goals_with_subtasks}")
        
        # 8. Cleanup - Delete test project
        print("\n8️⃣  Cleaning up...")
        
        db.delete(retrieved_project)
        db.commit()
        
        print(f"   ✅ Deleted test project")
        
        # Final summary
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("\nSub-tasks persistence is working correctly:")
        print("  ✓ Sub-tasks save to JSONB without errors")
        print("  ✓ Sub-tasks retrieve with full structure")
        print("  ✓ Sub-task status updates persist")
        print("  ✓ JSONB queries work for analytics")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()


def check_database_schema():
    """Check if the projects table has the correct schema"""
    print("\n🔍 Checking database schema...")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Check projects table columns
        query = text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'projects'
            ORDER BY ordinal_position
        """)
        
        result = db.execute(query).fetchall()
        
        print("\n📋 Projects Table Schema:")
        for row in result:
            nullable = "NULL" if row.is_nullable == "YES" else "NOT NULL"
            print(f"  • {row.column_name:<20} {row.data_type:<15} {nullable}")
        
        # Check if JSONB type is being used
        goals_column = [r for r in result if r.column_name == 'goals']
        
        if goals_column and goals_column[0].data_type == 'jsonb':
            print("\n✅ Goals column is using JSONB (correct for sub-tasks)")
        else:
            print(f"\n⚠️  Goals column type: {goals_column[0].data_type if goals_column else 'NOT FOUND'}")
            print("    Expected: jsonb")
        
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  SUB-TASKS PERSISTENCE TEST")
    print("="*60)
    
    # Check schema first
    check_database_schema()
    
    # Run persistence tests
    success = test_subtasks_persistence()
    
    print("\n" + "="*60)
    if success:
        print("  ✅ ALL TESTS PASSED - Sub-tasks working correctly!")
    else:
        print("  ❌ TESTS FAILED - See errors above")
    print("="*60 + "\n")
    
    sys.exit(0 if success else 1)
