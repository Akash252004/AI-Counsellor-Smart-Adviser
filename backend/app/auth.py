"""
Authentication utilities using Supabase Auth
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import supabase
from app.config import get_settings

settings = get_settings()
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify JWT token and return current user
    
    Args:
        credentials: HTTPAuthorizationCredentials from Authorization header
        
    Returns:
        User dictionary from Supabase
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Verify token with Supabase
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # AUTO-HEAL: Ensure user exists in local database (public.users)
        # This prevents Foreign Key errors if the trigger failed or during dev resets
        try:
            db_user = supabase.table("users").select("id").eq("id", user.user.id).execute()
            if not db_user.data:
                # Insert missing user record
                user_name = user.user.user_metadata.get("name", user.user.email.split("@")[0])
                supabase.table("users").insert({
                    "id": user.user.id,
                    "email": user.user.email,
                    "name": user_name
                }).execute()
                
                # Ensure stage exists
                supabase.table("user_stages").upsert({
                    "user_id": user.user.id,
                    "current_stage": "ONBOARDING"
                }).execute()
        except Exception as e:
            # Log but don't fail auth if healing fails (let downstream handle or fail)
            print(f"Auto-heal failed: {e}")
        
        return user.user
        
    except Exception as e:
        print(f"AUTH ERROR: {str(e)}") # Debug logging
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_user_id(user_id: str, current_user: dict) -> bool:
    """
    Verify that the user_id matches the current authenticated user
    
    Args:
        user_id: User ID to verify
        current_user: Current authenticated user from get_current_user
        
    Returns:
        True if user_id matches, raises HTTPException otherwise
    """
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return True
