"""
Shortlist endpoints - Add, remove, and manage university shortlist
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.database import supabase
from app.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/shortlist", tags=["shortlist"])


class AddToShortlistRequest(BaseModel):
    university_id: int
    bucket: str  # Dream, Target, or Safe
    why_fits: Optional[str] = None
    risks: Optional[str] = None


class UpdateBucketRequest(BaseModel):
    bucket: str


@router.get("/")
async def get_user_shortlist(current_user: dict = Depends(get_current_user)):
    """
    Get user's shortlisted universities grouped by bucket
    """
    try:
        # Get shortlist
        result = supabase.table("shortlists").select("*, universities(*)").eq("user_id", current_user.id).execute()
        
        shortlisted_items = result.data or []
        
        # Group by bucket
        dream = []
        target = []
        safe = []
        
        for item in shortlisted_items:
            uni_data = item.get("universities", {})
            shortlist_item = {
                "shortlist_id": item["id"],
                "university_id": item.get("university_id"),  # Add university_id for navigation
                "university": uni_data,
                "bucket": item.get("bucket", "Target"),
                "is_locked": item.get("is_locked", False),
                "why_fits": item.get("why_fits"),
                "risks": item.get("risks"),
                "added_at": item.get("created_at")
            }
            
            bucket = shortlist_item["bucket"]
            if bucket == "Dream":
                dream.append(shortlist_item)
            elif bucket == "Target":
                target.append(shortlist_item)
            elif bucket == "Safe":
                safe.append(shortlist_item)
        
        # Check if shortlist is locked (safely)
        is_locked = False
        try:
            stage_result = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).execute()
            if stage_result.data and len(stage_result.data) > 0:
                is_locked = stage_result.data[0].get("current_stage") == "LOCKED"
        except Exception as stage_err:
            print(f"Warning: Could not fetch user_stages: {stage_err}")
            is_locked = False
        
        return {
            "shortlist": {
                "dream": dream,
                "target": target,
                "safe": safe
            },
            "counts": {
                "dream": len(dream),
                "target": len(target),
                "safe": len(safe),
                "total": len(shortlisted_items)
            },
            "is_locked": is_locked
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR in get_user_shortlist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shortlist: {str(e)}"
        )


@router.post("/add")
async def add_to_shortlist(
    request: AddToShortlistRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Add a university to shortlist
    """
    try:
        # Check if already shortlisted
        existing = supabase.table("shortlists").select("id")\
            .eq("user_id", current_user.id)\
            .eq("university_id", request.university_id)\
            .execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="University already in shortlist"
            )
        
        # Check if shortlist is locked
        stage_result = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).execute()
        if stage_result.data and stage_result.data[0]["current_stage"] == "LOCKED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shortlist is locked. Cannot add more universities."
            )
        
        # Validate bucket
        if request.bucket not in ["Dream", "Target", "Safe"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bucket must be 'Dream', 'Target', or 'Safe'"
            )
        
        # Add to shortlist
        shortlist_data = {
            "user_id": current_user.id,
            "university_id": request.university_id,
            "bucket": request.bucket,
            "why_fits": request.why_fits,
            "risks": request.risks,
            "is_locked": False
        }
        
        result = supabase.table("shortlists").insert(shortlist_data).execute()
        
        # Update user stage if first shortlist item
        count_result = supabase.table("shortlists").select("id").eq("user_id", current_user.id).execute()
        if len(count_result.data) == 1:  # First item
            supabase.table("user_stages").update({
                "current_stage": "SHORTLISTING",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("user_id", current_user.id).execute()
        
        return {
            "message": "University added to shortlist",
            "shortlist_id": result.data[0]["id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add to shortlist: {str(e)}"
        )


@router.delete("/{shortlist_id}")
async def remove_from_shortlist(
    shortlist_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Remove a university from shortlist
    """
    try:
        # Check if shortlist is locked
        stage_result = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).execute()
        if stage_result.data and stage_result.data[0]["current_stage"] == "LOCKED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shortlist is locked. Cannot remove universities."
            )
        
        # Delete
        result = supabase.table("shortlists").delete()\
            .eq("id", shortlist_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shortlist item not found"
            )
        
        return {"message": "University removed from shortlist"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove from shortlist: {str(e)}"
        )


@router.patch("/{shortlist_id}/bucket")
async def update_bucket(
    shortlist_id: int,
    request: UpdateBucketRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Move university to a different bucket (Dream/Target/Safe)
    """
    try:
        # Check if shortlist is locked
        stage_result = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).execute()
        if stage_result.data and stage_result.data[0]["current_stage"] == "LOCKED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shortlist is locked. Cannot move universities."
            )
        
        # Validate bucket
        if request.bucket not in ["Dream", "Target", "Safe"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bucket must be 'Dream', 'Target', or 'Safe'"
            )
        
        # Update bucket
        result = supabase.table("shortlists").update({"bucket": request.bucket})\
            .eq("id", shortlist_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shortlist item not found"
            )
        
        return {"message": f"University moved to {request.bucket} bucket"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update bucket: {str(e)}"
        )


@router.post("/lock")
async def lock_shortlist(current_user: dict = Depends(get_current_user)):
    """
    Lock the shortlist - prevents adding/removing/moving universities
    Enables application tracking phase
    """
    try:
        # Check if shortlist has items
        count_result = supabase.table("shortlists").select("id").eq("user_id", current_user.id).execute()
        
        if not count_result.data or len(count_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot lock an empty shortlist. Add universities first."
            )
        
        # Update all shortlist items to locked
        supabase.table("shortlists").update({"is_locked": True})\
            .eq("user_id", current_user.id)\
            .execute()
        
        # Update user stage to LOCKED
        supabase.table("user_stages").update({
            "current_stage": "LOCKED",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", current_user.id).execute()
        
        return {
            "message": "Shortlist locked successfully",
            "locked_count": len(count_result.data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to lock shortlist: {str(e)}"
        )


@router.post("/{shortlist_id}/toggle-lock")
async def toggle_shortlist_lock(
    shortlist_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Toggle lock status of a specific shortlist item
    Enforces limit: 2 Locked items per bucket (Dream, Target, Safe)
    """
    try:
        # Get item
        result = supabase.table("shortlists").select("*").eq("id", shortlist_id).eq("user_id", current_user.id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = result.data
        new_status = not item.get("is_locked", False)
        
        if new_status: # Locking
            # Check global limit (Max 4 total)
            locked_count = supabase.table("shortlists").select("id", count="exact")\
                .eq("user_id", current_user.id)\
                .eq("is_locked", True)\
                .execute()
            
            count = locked_count.count or 0
            if count >= 4:
                raise HTTPException(
                    status_code=400, 
                    detail="You can only lock a maximum of 4 universities in total."
                )
        
        # Update
        supabase.table("shortlists").update({"is_locked": new_status}).eq("id", shortlist_id).execute()
        
        # Generate guidance tasks if Locking
        if new_status:
            uni_name = item.get("universities", {}).get("name", "University")
            
            # Application Tasks
            tasks = [
                {
                    "user_id": current_user.id,
                    "title": f"Submit Application to {uni_name}",
                    "description": f"Complete and submit the online application form for {uni_name}. Check deadline!",
                    "category": "application",
                    "is_complete": False
                },
                {
                    "user_id": current_user.id,
                    "title": f"Customize SOP for {uni_name}",
                    "description": f"Tailor your Statement of Purpose to highlight why you fit {uni_name} specifically.",
                    "category": "document",
                    "is_complete": False
                },
                {
                    "user_id": current_user.id,
                    "title": f"Check Scholarship Deadlines ({uni_name})",
                    "description": "Research and note down external funding or scholarship deadlines.",
                    "category": "financial",
                    "is_complete": False
                }
            ]
            
            supabase.table("custom_tasks").insert(tasks).execute()
            
        return {"message": "Lock status updated", "is_locked": new_status}

    except HTTPException:
        raise
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))


@router.post("/unlock")
async def unlock_shortlist(current_user: dict = Depends(get_current_user)):
    """
    Unlock the shortlist - allows modifications again
    """
    try:
        # Update all shortlist items to unlocked
        supabase.table("shortlists").update({"is_locked": False})\
            .eq("user_id", current_user.id)\
            .execute()
        
        # Update user stage back to SHORTLISTING
        supabase.table("user_stages").update({
            "current_stage": "SHORTLISTING",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", current_user.id).execute()
        
        return {"message": "Shortlist unlocked successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlock shortlist: {str(e)}"
        )
