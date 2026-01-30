"""
Supabase database connection and models.
Using Supabase as PostgreSQL database with SQLAlchemy.
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Supabase client for authentication (using Service Role to bypass RLS for backend ops)
# Backend validates user via JWT in dependencies, so DB access should be privileged
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

# SQLAlchemy setup for direct database access
# Supabase provides a PostgreSQL connection string in the project settings
Base = declarative_base()


class User(Base):
    """User account model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Supabase Auth UID
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)
    stage = relationship("UserStage", back_populates="user", uselist=False)
    chat_history = relationship("ChatHistory", back_populates="user")
    tasks = relationship("Task", back_populates="user")


class Profile(Base):
    """User profile with onboarding data"""
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Academic Background
    education_level = Column(String)  # Bachelors, Masters, etc.
    degree = Column(String)
    major = Column(String)
    graduation_year = Column(Integer)
    gpa = Column(Float)
    
    # Study Goal
    intended_degree = Column(String)  # Masters, PhD, etc.
    field_of_study = Column(String)
    target_intake_year = Column(Integer)
    preferred_countries = Column(ARRAY(String))  # Array of country names
    
    # Budget
    budget_min = Column(Float)
    budget_max = Column(Float)
    funding_type = Column(String)  # self, loan, scholarship
    
    # Exams & Readiness
    ielts_toefl_status = Column(String)  # Not Started, Scheduled, Completed
    ielts_toefl_score = Column(Float, nullable=True)
    gre_gmat_status = Column(String)
    gre_gmat_score = Column(Float, nullable=True)
    sop_status = Column(String)  # Not Started, Draft, Ready
    
    # Profile completion
    is_complete = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="profile")


class UserStage(Base):
    """User's current stage in the journey"""
    __tablename__ = "user_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    current_stage = Column(String, default="ONBOARDING")  # ONBOARDING, PROFILE_READY, DISCOVERY, SHORTLISTING, LOCKED, APPLYING
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="stage")


class ChatHistory(Base):
    """AI chat conversation history"""
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chat_history")


class Task(Base):
    """AI-generated tasks for users"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    is_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="tasks")


class University(Base):
    """University database (seeded data)"""
    __tablename__ = "universities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    city = Column(String)
    ranking = Column(Integer)
    
    # Program information
    programs_offered = Column(ARRAY(String))
    
    # Requirements
    min_gpa = Column(Float)
    min_ielts = Column(Float)
    min_toefl = Column(Float)
    requires_gre = Column(Boolean, default=False)
    requires_gmat = Column(Boolean, default=False)
    
    # Cost information
    tuition_min = Column(Float)
    tuition_max = Column(Float)
    living_cost_yearly = Column(Float)
    
    # Scholarship information
    has_scholarships = Column(Boolean, default=False)
    scholarship_types = Column(ARRAY(String))  # Merit, Need-based, Athletic, etc.
    scholarship_amount_min = Column(Float)  # Min scholarship amount
    scholarship_amount_max = Column(Float)  # Max scholarship amount
    scholarship_deadline = Column(String)  # e.g., "January 15"
    
    # Additional info
    acceptance_rate = Column(Float)  # Percentage
    description = Column(Text)



class Shortlist(Base):
    """User's shortlisted universities"""
    __tablename__ = "shortlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    bucket = Column(String)  # Dream, Target, Safe
    is_locked = Column(Boolean, default=False)
    why_fits = Column(Text)  # AI-generated explanation
    risks = Column(Text)  # AI-generated risks
    created_at = Column(DateTime, default=datetime.utcnow)


# Database session dependency
def get_db_session():
    """Create database session - will be used by FastAPI"""
    # For now, we'll use Supabase client. 
    # If you need direct SQLAlchemy access, setup engine with Supabase DB URL
    pass
