"""
AI Counsellor chat endpoint
Provides context-aware guidance using Gemini AI
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import ChatRequest, ChatResponse
from app.database import supabase
from app.auth import get_current_user
from app.ai_service import get_ai_response
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send message to AI counsellor
    
    - AI has access to complete user profile
    - AI provides structured, actionable guidance
    - Conversation history is saved
    """
    try:
        # Get user profile
        profile_result = supabase.table("profiles").select("*").eq("user_id", current_user.id).execute()
        
        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please complete onboarding first."
            )
        
        profile = profile_result.data[0]
        
        # Get current stage
        stage_result = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).single().execute()
        current_stage = stage_result.data.get("current_stage", "PROFILE_READY")
        
        # Get AI response
        ai_response = await get_ai_response(
            user_message=chat_request.message,
            profile=profile,
            stage=current_stage,
            user_id=current_user.id,
            db_client=supabase
        )
        
        # Save to chat history
        chat_data = {
            "user_id": current_user.id,
            "message": chat_request.message,
            "response": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        supabase.table("chat_history").insert(chat_data).execute()
        
        return ChatResponse(
            message=chat_request.message,
            response=ai_response,
            timestamp=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI response: {str(e)}"
        )


@router.get("/history")
async def get_chat_history(
    after: str = None,
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """
    Get chat history for current user
    
    - Returns recent conversations
    - Ordered by timestamp (newest first)
    - Optional: Filter by 'after' timestamp (ISO format)
    """
    try:
        query = supabase.table("chat_history")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .order("timestamp", desc=True)\
            .limit(limit)
            
        if after:
            query = query.gte("timestamp", after)
            
        result = query.execute()
        
        return {"history": result.data or []}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch chat history: {str(e)}"
        )
