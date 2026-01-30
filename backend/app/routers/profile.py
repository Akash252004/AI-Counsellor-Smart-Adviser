"""
Profile management endpoints
Handles onboarding data, profile updates, and strength calculation
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import ProfileData, ProfileResponse, MessageResponse
from app.database import supabase
from app.auth import get_current_user
from app.profile_calculator import calculate_profile_strength
from datetime import datetime

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    profile_data: ProfileData,
    current_user: dict = Depends(get_current_user)
):
    """
    Save or update user profile from onboarding
    
    - Creates new profile or updates existing
    - Marks profile as complete
    - Updates user stage to PROFILE_READY
    """
    try:
        # Prepare profile data
        profile_dict = profile_data.dict()
        profile_dict["user_id"] = current_user.id
        
        # Check Mandatory Fields for Completeness
        # We enforce that these must be present to mark profile as complete
        # Users can save incomplete profiles (draft mode), but won't access dashboard until complete
        mandatory_checks = [
            bool(profile_data.education_level),
            bool(profile_data.major),
            bool(profile_data.graduation_year),
            profile_data.gpa is not None, # 0 is technically a value, though unlikely
            bool(profile_data.intended_degree),
            bool(profile_data.field_of_study),
            bool(profile_data.target_intake_year),
            bool(profile_data.preferred_countries),
            profile_data.budget_max > 0 # Budget must be set
        ]
        
        is_complete = all(mandatory_checks)
        profile_dict["is_complete"] = is_complete
        profile_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Check if profile exists
        existing = supabase.table("profiles").select("id").eq("user_id", current_user.id).execute()
        
        if existing.data:
            # Update existing profile
            supabase.table("profiles").update(profile_dict).eq("user_id", current_user.id).execute()
        else:
            # Create new profile
            supabase.table("profiles").insert(profile_dict).execute()
        
        # Update user stage to PROFILE_READY
        supabase.table("user_stages").upsert({
            "user_id": current_user.id,
            "current_stage": "PROFILE_READY",
            "updated_at": datetime.utcnow().isoformat()
        }, on_conflict="user_id").execute()
        
        return MessageResponse(
            message="Profile saved successfully",
            success=True
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save profile: {str(e)}"
        )


@router.get("/")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get user profile data
    
    - Returns complete profile if exists
    - Returns null if profile not complete
    """
    try:
        result = supabase.table("profiles").select("*").eq("user_id", current_user.id).execute()
        
        if not result.data:
            return {"profile": None, "exists": False}
        
        return {"profile": result.data[0], "exists": True}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@router.get("/strength")
async def get_profile_strength(current_user: dict = Depends(get_current_user)):
    """
    Calculate and return profile strength indicators
    
    - Returns academics, exams, and SOP strength
    """
    try:
        # Get profile
        result = supabase.table("profiles").select("*").eq("user_id", current_user.id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Calculate strength
        strength = calculate_profile_strength(result.data)
        
        return strength
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate profile strength: {str(e)}"
        )


@router.put("/")
async def update_profile(
    profile_data: ProfileData,
    current_user: dict = Depends(get_current_user)
):
    """
    Update existing profile
    
    - Triggers recalculation of recommendations
    - Updates AI context
    """
    try:
        profile_dict = profile_data.dict()
        profile_dict["updated_at"] = datetime.utcnow().isoformat()
        
        supabase.table("profiles").update(profile_dict).eq("user_id", current_user.id).execute()
        
        # TODO: Trigger recommendation recalculation
        # TODO: Regenerate tasks if needed
        
        return MessageResponse(
            message="Profile updated successfully",
            success=True
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )
