"""
Dashboard data endpoint
Returns profile summary, stage, strength, and tasks
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import DashboardResponse, ProfileStrength, TaskResponse
from app.database import supabase
from app.auth import get_current_user
from app.profile_calculator import calculate_profile_strength
from app.ai_service import generate_initial_tasks

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    """
    Get dashboard data for authenticated user
    
    Returns:
    - Profile summary
    - Current stage
    - Profile strength indicators
    - AI-generated tasks
    """
    try:
        # Get profile
        profile_result = supabase.table("profiles").select("*").eq("user_id", current_user.id).execute()
        
        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please complete onboarding first."
            )
        
        profile = profile_result.data[0]
        
        # Get current stage from DB (for reference)
        stage_result = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).single().execute()
        db_stage = stage_result.data.get("current_stage", "PROFILE_READY") if stage_result.data else "PROFILE_READY"
        
        # --- Robust Stateless Calculation ---
        # Determine strict stage based on actual data existence
        calculated_stage = "DISCOVERY" # Default since profile exists (checked above)
        
        # Check Shortlist
        shortlist_res = supabase.table("shortlists").select("id").eq("user_id", current_user.id).execute()
        if shortlist_res.data and len(shortlist_res.data) > 0:
            calculated_stage = "SHORTLISTING"
            
            # Check Locked (Only if we have a shortlist)
            locked_res = supabase.table("shortlists").select("id").eq("user_id", current_user.id).eq("is_locked", True).execute()
            if locked_res.data and len(locked_res.data) > 0:
                calculated_stage = "LOCKED"
        
        # Update DB if mismatched
        if calculated_stage != db_stage:
            print(f"DEBUG: Auto-correcting stage from {db_stage} to {calculated_stage}")
            try:
                supabase.table("user_stages").upsert({
                    "user_id": current_user.id,
                    "current_stage": calculated_stage,
                    "updated_at": "now()"
                }).execute()
            except Exception as e:
                print(f"DEBUG: Failed to update user_stages: {e}")
        
        current_stage = calculated_stage
        
        # Calculate profile strength
        strength = calculate_profile_strength(profile)
        
        # Get tasks
        tasks_result = supabase.table("tasks").select("*").eq("user_id", current_user.id).order("created_at", desc=True).execute()
        
        tasks = tasks_result.data if tasks_result.data else []
        
        # If no tasks exist, insert default tasks immediately for performance
        if not tasks:
            from datetime import datetime
            default_tasks = [
                {"title": "Complete Your Profile", "description": "Fill out your academic details to get personalized recommendations."},
                {"title": "Browse Universities", "description": "Explore universities and filter by your preferences."},
                {"title": "Shortlist Your Favorites", "description": "Add universities to your shortlist to track them."}
            ]
            
            for task in default_tasks:
                task_data = {
                    "user_id": current_user.id,
                    "title": task["title"],
                    "description": task["description"],
                    "created_at": datetime.utcnow().isoformat()
                }
                supabase.table("tasks").insert(task_data).execute()
            
            # Fetch newly created tasks
            tasks_result = supabase.table("tasks").select("*").eq("user_id", current_user.id).order("created_at", desc=True).execute()
            tasks = tasks_result.data
        
        # Build profile summary
        profile_summary = {
            "education": f"{profile.get('degree', 'N/A')} in {profile.get('major', 'N/A')}",
            "target_degree": profile.get("intended_degree", "N/A"),
            "field": profile.get("field_of_study", "N/A"),
            "target_intake": profile.get("target_intake_year", "N/A"),
            "countries": profile.get("preferred_countries", []),
            "budget": f"${profile.get('budget_min', 0):,.0f} - ${profile.get('budget_max', 0):,.0f}",
            "gpa": profile.get("gpa", 0.0)
        }
        
        # Get locked universities
        locked_result = supabase.table("shortlists").select("*, universities(*)").eq("user_id", current_user.id).eq("is_locked", True).execute()
        locked_universities = []
        if locked_result.data:
            for item in locked_result.data:
                 uni = item.get("universities", {})
                 locked_universities.append({
                     "id": item["id"],
                     "university_id": uni.get("id"),
                     "name": uni.get("name"),
                     "country": uni.get("country"),
                     "program": uni.get("programs_offered", ["N/A"])[0] if uni.get("programs_offered") else "N/A",
                     "bucket": item["bucket"]
                 })

        return DashboardResponse(
            profile_summary=profile_summary,
            current_stage=current_stage,
            profile_strength=ProfileStrength(**strength),
            tasks=tasks,
            locked_universities=locked_universities
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )


@router.patch("/tasks/{task_id}/complete")
async def mark_task_complete(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a task as complete
    """
    try:
        from datetime import datetime
        
        result = supabase.table("tasks").update({
            "is_complete": True,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", task_id).eq("user_id", current_user.id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return {"message": "Task marked as complete", "success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )
