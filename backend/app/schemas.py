"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ========== Authentication Schemas ==========

class UserSignup(BaseModel):
    """Signup request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Authentication response with token"""
    access_token: str
    token_type: str = "bearer"
    user: dict


# ========== Profile Schemas ==========

class ProfileData(BaseModel):
    """Complete profile data from onboarding"""
    # Academic Background
    education_level: str
    degree: str
    major: str
    graduation_year: int
    gpa: float = Field(..., ge=0.0, le=10.0)
    
    # Study Goal
    intended_degree: str
    field_of_study: str
    target_intake_year: int
    preferred_countries: List[str]
    
    # Budget
    budget_min: float = 0
    budget_max: float = 0
    funding_type: str = "Self-funded"
    
    # Personal Details (Optional)
    family_income: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_occupation: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    siblings_count: Optional[int] = None
    sibling_details: Optional[str] = None

    # Documents (Optional)
    sop_url: Optional[str] = None
    lor_url: Optional[str] = None

    # Exams & Readiness
    ielts_toefl_status: str = "Not taken"
    ielts_toefl_score: Optional[float] = None
    gre_gmat_status: str = "Not taken"
    gre_gmat_score: Optional[float] = None
    sop_status: str = "Not started"


class ProfileResponse(BaseModel):
    """Profile data response"""
    id: int
    user_id: str
    education_level: str
    degree: str
    major: str
    graduation_year: int
    gpa: float
    intended_degree: str
    field_of_study: str
    target_intake_year: int
    preferred_countries: List[str]
    budget_min: float
    budget_max: float
    funding_type: str
    family_income: Optional[str]
    father_occupation: Optional[str]
    mother_occupation: Optional[str]
    father_name: Optional[str]
    mother_name: Optional[str]
    siblings_count: Optional[int]
    sibling_details: Optional[str]
    sop_url: Optional[str]
    lor_url: Optional[str]
    ielts_toefl_status: str
    ielts_toefl_score: Optional[float]
    gre_gmat_status: str
    gre_gmat_score: Optional[float]
    sop_status: str
    is_complete: bool
    updated_at: datetime


# ========== Dashboard Schemas ==========

class ProfileStrength(BaseModel):
    """Profile strength indicators"""
    academics: str  # Strong, Average, Weak
    exams: str  # Not Started, In Progress, Done
    sop: str  # Not Started, Draft, Ready


class TaskResponse(BaseModel):
    """Task response schema"""
    id: int
    title: str
    description: Optional[str]
    is_complete: bool
    created_at: datetime
    completed_at: Optional[datetime]


class DashboardResponse(BaseModel):
    """Dashboard data response"""
    profile_summary: dict
    current_stage: str
    profile_strength: ProfileStrength
    tasks: List[TaskResponse]
    locked_universities: Optional[List[dict]] = None


# ========== AI Chat Schemas ==========

class ChatRequest(BaseModel):
    """AI chat request"""
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    """AI chat response"""
    message: str
    response: str
    timestamp: datetime


# ========== University Schemas ==========

class UniversityResponse(BaseModel):
    """University data response"""
    id: int
    name: str
    country: str
    city: Optional[str]
    ranking: Optional[int]
    programs_offered: List[str]
    tuition_min: float
    tuition_max: float
    living_cost_yearly: float
    acceptance_rate: Optional[float]
    description: Optional[str]
    why_fits: Optional[str]  # AI-generated
    risks: Optional[str]  # AI-generated
    bucket: Optional[str]  # Dream, Target, Safe


class ShortlistRequest(BaseModel):
    """Shortlist request"""
    university_id: int
    bucket: str


# ========== Generic Responses ==========

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    error_code: Optional[str] = None
