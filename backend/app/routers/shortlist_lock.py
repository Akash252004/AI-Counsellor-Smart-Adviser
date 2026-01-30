"""
Shortlist endpoints with lock functionality and email notifications
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
from app.database import supabase
from app.auth import get_current_user
from app.email_service import email_service

router = APIRouter(prefix="/shortlist", tags=["shortlist"])


class AddToShortlistRequest(BaseModel):
    university_id: int
    bucket: str  # Dream, Target, or Safe


class LockShortlistRequest(BaseModel):
    shortlist_id: int


async def send_delayed_email(user_email: str, user_name: str, university_name: str, university_country: str):
    """
    Wait 1 minute then send congratulations email
    """
    await asyncio.sleep(60)  # Wait 1 minute
    email_service.send_shortlist_confirmation(
        recipient_email=user_email,
        recipient_name=user_name,
        university_name=university_name,
        university_country=university_country
    )


@router.post("/lock")
async def lock_shortlist(
    request: LockShortlistRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Lock a shortlisted university (mark as applied)
    Sends congratulations email after 1 minute
    """
    try:
        # Get shortlist item with university details
        shortlist_result = supabase.table("shortlists")\
            .select("*, universities(*)")\
            .eq("id", request.shortlist_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not shortlist_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shortlist item not found"
            )
        
        shortlist_item = shortlist_result.data[0]
        
        # Update to locked
        supabase.table("shortlists")\
            .update({"is_locked": True})\
            .eq("id", request.shortlist_id)\
            .execute()
        
        # Get user details for email
        user_email = current_user.email
        user_name = current_user.user_metadata.get("name", "Student")
        university_name = shortlist_item["universities"]["name"]
        university_country = shortlist_item["universities"]["country"]
        
        # Schedule delayed email (1 minute)
        background_tasks.add_task(
            send_delayed_email,
            user_email,
            user_name,
            university_name,
            university_country
        )
        
        return {
            "message": "Application locked successfully! You will receive a confirmation email in 1 minute.",
            "shortlist_item": shortlist_item
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to lock application: {str(e)}"
        )


@router.post("/unlock")
async def unlock_shortlist(
    shortlist_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Unlock a shortlisted university
    """
    try:
        # Verify ownership
        shortlist_result = supabase.table("shortlists")\
            .select("id")\
            .eq("id", shortlist_id)\
            .eq("user_id", current_user.id)\
            .execute()
        
        if not shortlist_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shortlist item not found"
            )
        
        # Update to unlocked
        supabase.table("shortlists")\
            .update({"is_locked": False})\
            .eq("id", shortlist_id)\
            .execute()
        
        return {"message": "Application unlocked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlock application: {str(e)}"
        )
