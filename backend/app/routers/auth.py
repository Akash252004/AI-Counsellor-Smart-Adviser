"""
Authentication endpoints - Signup and Login
Uses Supabase Auth for user management
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import UserSignup, UserLogin, AuthResponse
from app.database import supabase
from app.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Create new user account
    
    - Registers user with Supabase Auth
    - Creates user record in database
    - Returns access token
    """
    try:
        # Sign up with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        # Create user record in users table
        user_record = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "name": user_data.name
        }
        
        supabase.table("users").upsert(user_record).execute()
        
        # Create initial user stage
        stage_record = {
            "user_id": auth_response.user.id,
            "current_stage": "ONBOARDING"
        }
        supabase.table("user_stages").upsert(stage_record).execute()
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": user_data.name
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user and return access token
    
    - Verifies credentials with Supabase Auth
    - Returns access token for subsequent requests
    """
    try:
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Ensure user exists in users table (sync from auth if missing)
        try:
            user_data = supabase.table("users").select("*").eq("id", auth_response.user.id).execute()
            
            if not user_data.data:
                # User doesn't exist in users table, create it
                user_name = auth_response.user.user_metadata.get("name", auth_response.user.email.split("@")[0])
                user_record = {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "name": user_name
                }
                supabase.table("users").insert(user_record).execute()
                
                # Also create user_stages if missing
                stage_check = supabase.table("user_stages").select("*").eq("user_id", auth_response.user.id).execute()
                if not stage_check.data:
                    stage_record = {
                        "user_id": auth_response.user.id,
                        "current_stage": "ONBOARDING"
                    }
                    supabase.table("user_stages").insert(stage_record).execute()
                
                user_name_response = user_name
            else:
                user_name_response = user_data.data[0].get("name", "")
        except Exception as sync_error:
            print(f"User sync error: {sync_error}")
            user_name_response = auth_response.user.email.split("@")[0]
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": user_name_response
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    
    - Requires authentication
    - Returns user profile and stage status
    """
    try:
        # Get user data
        user_data = supabase.table("users").select("*").eq("id", current_user.id).single().execute()
        
        # Get profile status
        profile_data = supabase.table("profiles").select("is_complete").eq("user_id", current_user.id).execute()
        
        # Get current stage
        stage_data = supabase.table("user_stages").select("current_stage").eq("user_id", current_user.id).single().execute()
        
        return {
            "user": user_data.data,
            "profile_complete": profile_data.data[0].get("is_complete", False) if profile_data.data else False,
            "current_stage": stage_data.data.get("current_stage", "ONBOARDING")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user info: {str(e)}"
        )
