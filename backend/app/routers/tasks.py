"""
Tasks endpoints - Recommended and custom tasks
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from app.database import supabase
from app.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    category: str = "general"


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    category: Optional[str] = None


@router.get("/recommended")
async def get_recommended_tasks(current_user: dict = Depends(get_current_user)):
    """
    Get AI-recommended tasks based on user profile and shortlist
    """
    try:
        # Get user profile
        profile_result = supabase.table("profiles").select("*").eq("user_id", current_user.id).execute()
        
        if not profile_result.data:
            return {"recommended_tasks": []}
        
        profile = profile_result.data[0]
        recommended = []
        
        # Check IELTS/TOEFL status
        if profile.get("ielts_toefl_status") != "Completed":
            recommended.append({
                "id": "ielts_toefl",
                "title": "Take IELTS/TOEFL Exam",
                "description": "Most universities require English proficiency test scores. Schedule your exam soon.",
                "category": "exam",
                "priority": "high",
                "icon": "📝"
            })
        
        # Check GRE/GMAT status
        gre_status = profile.get("gre_gmat_status")
        if gre_status != "Completed":
            # Check if any shortlisted universities require GRE/GMAT
            shortlist_result = supabase.table("shortlists")\
                .select("university_id, universities(requires_gre, requires_gmat)")\
                .eq("user_id", current_user.id)\
                .execute()
            
            requires_exam = any(
                uni.get("universities", {}).get("requires_gre") or 
                uni.get("universities", {}).get("requires_gmat")
                for uni in shortlist_result.data
            )
            
            if requires_exam:
                recommended.append({
                    "id": "gre_gmat",
                    "title": "Take GRE/GMAT Exam",
                    "description": "One or more of your shortlisted universities require GRE/GMAT scores.",
                    "category": "exam",
                    "priority": "high",
                    "icon": "🎯"
                })
        
        # SOP Status
        if profile.get("sop_status") != "Completed":
            recommended.append({
                "id": "sop",
                "title": "Write Statement of Purpose (SOP)",
                "description": "Draft your SOP highlighting your academic achievements and career goals.",
                "category": "document",
                "priority": "medium",
                "icon": "📄"
            })
        
        # LOR
        lor_status = profile.get("lor_status")
        if lor_status != "Completed":
            recommended.append({
                "id": "lor",
                "title": "Collect Letters of Recommendation",
                "description": "Request LORs from professors or supervisors. Most universities require 2-3 letters.",
                "category": "document",
                "priority": "medium",
                "icon": "✉️"
            })
        
        # Financial Documents
        recommended.append({
            "id": "financial",
            "title": "Prepare Financial Documents",
            "description": "Gather bank statements, sponsor letters, and proof of funds for visa application.",
            "category": "document",
            "priority": "low",
            "icon": "💰"
        })
        
        # Transcripts
        recommended.append({
            "id": "transcripts",
            "title": "Request Official Transcripts",
            "description": "Get official transcripts from your current/previous institutions.",
            "category": "document",
            "priority": "medium",
            "icon": "🎓"
        })
        
        return {"recommended_tasks": recommended}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/custom")
async def get_custom_tasks(current_user: dict = Depends(get_current_user)):
    """
    Get user's custom tasks
    """
    try:
        result = supabase.table("custom_tasks")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {"custom_tasks": result.data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch custom tasks: {str(e)}"
        )


@router.post("/custom")
async def create_custom_task(
    request: CreateTaskRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new custom task
    """
    try:
        task_data = {
            "user_id": current_user.id,
            "title": request.title,
            "description": request.description,
            "due_date": request.due_date.isoformat() if request.due_date else None,
            "category": request.category,
            "is_complete": False
        }
        
        result = supabase.table("custom_tasks").insert(task_data).execute()
        
        return {
            "message": "Task created successfully",
            "task": result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )


@router.patch("/custom/{task_id}/complete")
async def toggle_task_complete(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Toggle task completion status
    """
    try:
        # Get current status
        task_result = supabase.table("custom_tasks")\
            .select("is_complete")\
            .eq("id", task_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not task_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        current_status = task_result.data[0]["is_complete"]
        new_status = not current_status
        
        # Update
        result = supabase.table("custom_tasks")\
            .update({
                "is_complete": new_status,
                "updated_at": datetime.utcnow().isoformat()
            })\
            .eq("id", task_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        return {
            "message": f"Task {'completed' if new_status else 'reopened'}",
            "task": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )


@router.put("/custom/{task_id}")
async def update_custom_task(
    task_id: int,
    request: UpdateTaskRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a custom task
    """
    try:
        update_data = {}
        if request.title is not None:
            update_data["title"] = request.title
        if request.description is not None:
            update_data["description"] = request.description
        if request.due_date is not None:
            update_data["due_date"] = request.due_date.isoformat()
        if request.category is not None:
            update_data["category"] = request.category
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("custom_tasks")\
            .update(update_data)\
            .eq("id", task_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return {
            "message": "Task updated successfully",
            "task": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )


@router.delete("/custom/{task_id}")
async def delete_custom_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a custom task
    """
    try:
        result = supabase.table("custom_tasks")\
            .delete(count="exact")\
            .eq("id", task_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        # Check count instead of data
        if result.count == 0:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return {"message": "Task deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )
