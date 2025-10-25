"""
Projects API - Manage user projects for context and goal alignment
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import uuid
from datetime import datetime

from app.database import get_db
from app.models.user import User, Project

router = APIRouter()


@router.get("/projects")
async def get_projects(user_email: str, db: Session = Depends(get_db)):
    """Get all projects for a user"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        projects = db.query(Project).filter(Project.user_id == user.id).order_by(Project.created_at.desc()).all()
        
        return {
            "projects": [
                {
                    "id": str(proj.id),
                    "name": proj.name,
                    "description": proj.description,
                    "status": proj.status,
                    "priority": proj.priority,
                    "goals": proj.goals or [],
                    "color": proj.color,
                    "is_primary": proj.is_primary,
                    "metadata": proj.metadata or {},
                    "created_at": proj.created_at.isoformat() if proj.created_at else None,
                    "updated_at": proj.updated_at.isoformat() if proj.updated_at else None
                }
                for proj in projects
            ]
        }
    except Exception as e:
        print(f"❌ Error loading projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects")
async def create_project(project_data: Dict, user_email: str, db: Session = Depends(get_db)):
    """Create a new project"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # If this is marked as primary, unmark any existing primary projects
        if project_data.get('is_primary', False):
            db.query(Project).filter(Project.user_id == user.id, Project.is_primary == True).update({"is_primary": False})
        
        new_project = Project(
            user_id=user.id,
            name=project_data.get('name'),
            description=project_data.get('description', ''),
            status=project_data.get('status', 'active'),
            priority=project_data.get('priority', 'medium'),
            goals=project_data.get('goals', []),
            color=project_data.get('color', '#3b82f6'),
            is_primary=project_data.get('is_primary', False),
            metadata=project_data.get('metadata', {})
        )
        
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        
        print(f"✅ Created project: {new_project.name} for {user_email}")
        
        return {
            "success": True,
            "project": {
                "id": str(new_project.id),
                "name": new_project.name,
                "description": new_project.description,
                "status": new_project.status,
                "priority": new_project.priority,
                "goals": new_project.goals or [],
                "color": new_project.color,
                "is_primary": new_project.is_primary,
                "metadata": new_project.metadata or {},
                "created_at": new_project.created_at.isoformat() if new_project.created_at else None
            }
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/projects/{project_id}")
async def update_project(project_id: str, project_data: Dict, user_email: str, db: Session = Depends(get_db)):
    """Update an existing project"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        project = db.query(Project).filter(
            Project.id == uuid.UUID(project_id),
            Project.user_id == user.id
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # If marking as primary, unmark other primary projects
        if project_data.get('is_primary', False) and not project.is_primary:
            db.query(Project).filter(
                Project.user_id == user.id,
                Project.is_primary == True,
                Project.id != project.id
            ).update({"is_primary": False})
        
        # Update fields
        for key, value in project_data.items():
            if hasattr(project, key):
                setattr(project, key, value)
        
        project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(project)
        
        print(f"✅ Updated project: {project.name}")
        
        return {
            "success": True,
            "project": {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "priority": project.priority,
                "goals": project.goals or [],
                "color": project.color,
                "is_primary": project.is_primary,
                "metadata": project.metadata or {},
                "updated_at": project.updated_at.isoformat() if project.updated_at else None
            }
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user_email: str, db: Session = Depends(get_db)):
    """Delete a project"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        project = db.query(Project).filter(
            Project.id == uuid.UUID(project_id),
            Project.user_id == user.id
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_name = project.name
        db.delete(project)
        db.commit()
        
        print(f"✅ Deleted project: {project_name}")
        
        return {"success": True, "message": f"Project '{project_name}' deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting project: {e}")
        raise HTTPException(status_code=500, detail=str(e))
