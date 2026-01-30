"""
University Recommendation Engine
Calculates match scores and categorizes universities based on user profile
"""
from typing import Dict, List, Any


def calculate_match_score(user_profile: Dict[str, Any], university: Dict[str, Any]) -> int:
    """
    Calculate compatibility score (0-100) between user and university
    
    Factors:
    - GPA match (20%)
    - Budget match (25%)
    - Country preference (15%)
    - Field alignment (20%)
    - Exam scores (15%)
    - Scholarship availability (5%)
    """
    score = 0
    
    # 1. GPA matching (20 points)
    if university.get("min_gpa") and user_profile.get("gpa"):
        if user_profile["gpa"] >= university["min_gpa"]:
            score += 20
        elif university["min_gpa"] - user_profile["gpa"] <= 0.3:
            # Close match, give partial credit
            score += 10
        elif university["min_gpa"] - user_profile["gpa"] <= 0.5:
            score += 5
    
    # 2. Budget matching (25 points)
    if university.get("tuition_max") and university.get("living_cost_yearly"):
        total_cost = university["tuition_max"] + university["living_cost_yearly"]
        user_budget = user_profile.get("budget_max", 0)
        
        if user_budget >= total_cost:
            score += 25  # Perfect fit
        elif user_budget >= total_cost * 0.8:
            score += 20  # Slightly over budget but manageable
        elif user_budget >= total_cost * 0.6:
            score += 10  # Stretching the budget
        
        # Bonus for scholarships if budget is tight
        if university.get("has_scholarships") and user_budget < total_cost:
            score += 5
    
    # 3. Country preference (15 points)
    preferred_countries = user_profile.get("preferred_countries", [])
    if university.get("country") in preferred_countries:
        score += 15
    
    # 4. Field/Program alignment (20 points)
    user_field = user_profile.get("field_of_study", "").lower()
    programs_offered = university.get("programs_offered", [])
    
    # Check if user's field matches any offered program
    for program in programs_offered:
        if user_field in program.lower() or program.lower() in user_field:
            score += 20
            break
    else:
        # Partial match for related fields
        related_keywords = extract_keywords(user_field)
        for program in programs_offered:
            program_lower = program.lower()
            if any(keyword in program_lower for keyword in related_keywords):
                score += 10
                break
    
    # 5. English proficiency exam scores (15 points)
    if user_profile.get("ielts_toefl_status") == "Completed":
        ielts_score = user_profile.get("ielts_toefl_score")
        if ielts_score and university.get("min_ielts"):
            if ielts_score >= university["min_ielts"]:
                score += 15
            elif ielts_score >= university["min_ielts"] - 0.5:
                score += 10
            elif ielts_score >= university["min_ielts"] - 1.0:
                score += 5
    
    # 6. GRE/GMAT requirement check (no points, but awareness)
    # This doesn't add points but is important for eligibility
    if university.get("requires_gre") or university.get("requires_gmat"):
        gre_status = user_profile.get("gre_gmat_status")
        if gre_status == "Completed":
            # User has taken the exam, good!
            pass
        elif gre_status == "Scheduled":
            # Planned, okay
            pass
        else:
            # Not started - this might be an issue but don't penalize score
            # Just note it for the user
            pass
    
    return min(score, 100)


def categorize_university(match_score: int, acceptance_rate: float, ranking: int = None) -> str:
    """
    Categorize university into Dream/Target/Safe based on match score and acceptance rate
    
    - Dream: Reach schools (low acceptance rate or high ranking)
    - Target: Good fit schools (moderate acceptance, good match)
    - Safe: Safety schools (high acceptance rate and high match score)
    """
    # Consider acceptance rate as primary factor
    if acceptance_rate < 15:
        # Very selective - likely a Dream school
        return "Dream"
    elif acceptance_rate < 30:
        # Selective - Dream or Target based on match score
        if match_score >= 75:
            return "Target"
        else:
            return "Dream"
    elif acceptance_rate < 50:
        # Moderately selective - Target or Safe based on match
        if match_score >= 80:
            return "Safe"
        else:
            return "Target"
    else:
        # Less selective - likely Safe
        if match_score >= 70:
            return "Safe"
        else:
            return "Target"


def generate_why_fits(user_profile: Dict[str, Any], university: Dict[str, Any], match_score: int) -> str:
    """
    Generate AI explanation for why this university fits the user
    """
    reasons = []
    
    # GPA match
    if university.get("min_gpa") and user_profile.get("gpa"):
        if user_profile["gpa"] >= university["min_gpa"]:
            reasons.append(f"Your GPA of {user_profile['gpa']} exceeds the minimum requirement of {university['min_gpa']}")
    
    # Country preference
    if university.get("country") in user_profile.get("preferred_countries", []):
        reasons.append(f"Located in {university['country']}, which is one of your preferred countries")
    
    # Program alignment
    user_field = user_profile.get("field_of_study", "")
    programs = university.get("programs_offered", [])
    for program in programs:
        if user_field.lower() in program.lower():
            reasons.append(f"Offers your desired field of study: {program}")
            break
    
    # Budget
    if university.get("tuition_max") and user_profile.get("budget_max"):
        total_cost = university["tuition_max"] + university.get("living_cost_yearly", 0)
        if user_profile["budget_max"] >= total_cost:
            reasons.append(f"Annual cost (${total_cost:,.0f}) fits within your budget")
    
    # Scholarships
    if university.get("has_scholarships"):
        scholarship_types = ", ".join(university.get("scholarship_types", []))
        reasons.append(f"Offers scholarships: {scholarship_types}")
    
    # Ranking
    if university.get("ranking") and university["ranking"] <= 50:
        reasons.append(f"Highly ranked institution (#{university['ranking']} globally)")
    
    if not reasons:
        reasons.append("General good fit based on your profile")
    
    return ". ".join(reasons) + "."


def identify_risks(user_profile: Dict[str, Any], university: Dict[str, Any]) -> str:
    """
    Identify potential risks or challenges for this university
    """
    risks = []
    
    # GPA risk
    if university.get("min_gpa") and user_profile.get("gpa"):
        if user_profile["gpa"] < university["min_gpa"]:
            gap = university["min_gpa"] - user_profile["gpa"]
            risks.append(f"Your GPA is {gap:.1f} points below the minimum requirement")
    
    # Budget risk
    if university.get("tuition_max") and user_profile.get("budget_max"):
        total_cost = university["tuition_max"] + university.get("living_cost_yearly", 0)
        if total_cost > user_profile["budget_max"]:
            overage = total_cost - user_profile["budget_max"]
            risks.append(f"Annual cost exceeds your budget by ${overage:,.0f}")
            if university.get("has_scholarships"):
                risks.append("Consider applying for available scholarships to offset costs")
    
    # Exam requirements
    if university.get("requires_gre") or university.get("requires_gmat"):
        if user_profile.get("gre_gmat_status") == "Not Started":
            exam_type = "GRE" if university.get("requires_gre") else "GMAT"
            risks.append(f"{exam_type} is required but you haven't started preparation")
    
    # English proficiency
    if user_profile.get("ielts_toefl_status") != "Completed":
        risks.append("IELTS/TOEFL score required - ensure you complete this before applying")
    
    # Low acceptance rate
    if university.get("acceptance_rate") and university["acceptance_rate"] < 10:
        risks.append(f"Very competitive with only {university['acceptance_rate']}% acceptance rate")
    
    if not risks:
        return "No major risks identified. Good fit overall."
    
    return ". ".join(risks) + "."


def extract_keywords(field: str) -> List[str]:
    """
    Extract relevant keywords from field of study for matching
    """
    # Common related fields mapping
    related_fields = {
        "computer science": ["cs", "computing", "software", "programming"],
        "data science": ["data", "analytics", "statistics", "machine learning", "ai"],
        "engineering": ["mechanical", "electrical", "civil", "chemical"],
        "business": ["mba", "management", "finance", "marketing"],
        "medicine": ["medical", "health", "clinical"],
        "ai": ["artificial intelligence", "machine learning", "ml", "deep learning"],
    }
    
    field_lower = field.lower()
    keywords = [field_lower]
    
    for key, related in related_fields.items():
        if key in field_lower:
            keywords.extend(related)
    
    return keywords
