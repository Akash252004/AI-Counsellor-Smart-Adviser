
import asyncio
from app.ai_service import calculate_ai_match_score
from app.config import get_settings

# Mock data
profile = {
    "full_name": "Test Student",
    "gpa": 8.5,
    "major": "Computer Science",
    "budget_max": 50000,
    "preferred_countries": ["USA"],
    "intended_degree": "Masters"
}

university = {
    "name": "University of Test",
    "country": "USA",
    "ranking": 100,
    "acceptance_rate": 60,
    "tuition_max": 40000,
    "min_gpa": 8.0
}

async def test():
    print("Testing AI Model Connection...")
    try:
        result = await calculate_ai_match_score(profile, university)
        print("\n--- Result ---")
        print(f"Match Score: {result.get('match_score')}")
        print(f"Category: {result.get('category')}")
        print(f"Reasoning: {result.get('reasoning')}")
        
        if "error_details" in result:
            print(f"\nERROR FOUND: {result['error_details']}")
        elif result.get("match_score", 0) > 0:
            print("\nSUCCESS: AI returned a valid score!")
        else:
            print("\nWARNING: Score is 0 (Fallback might be active)")
            
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test())
