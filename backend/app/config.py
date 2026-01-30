from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # Gemini AI
    gemini_api_key: str  # Fallback/Legacy
    gemini_api_key_chat: str = None
    gemini_api_key_analysis: str = None
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Default to main key if specific ones aren't set
        if not self.gemini_api_key_chat:
            self.gemini_api_key_chat = self.gemini_api_key
        if not self.gemini_api_key_analysis:
            self.gemini_api_key_analysis = self.gemini_api_key
    
    # Backend
    secret_key: str
    environment: str = "development"
    
    # CORS
    allowed_origins: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
