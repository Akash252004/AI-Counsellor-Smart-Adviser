"""
University endpoints - Discovery, Search, Recommendations
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database import supabase
from app.auth import get_current_user
from app.recommendation_engine import (
    calculate_match_score,
    categorize_university,
    generate_why_fits,
    identify_risks
)
from app.ai_service import calculate_ai_match_score

router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("/")
async def search_universities(
    country: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    field: Optional[str] = None,
    has_scholarships: Optional[bool] = None,
    min_gpa: Optional[float] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Search and filter universities
    """
    try:
        # Start with base query
        query = supabase.table("universities").select("*")
        
        # Apply filters
        if country:
            query = query.eq("country", country)
        
        if has_scholarships is not None:
            query = query.eq("has_scholarships", has_scholarships)
        
        if min_gpa is not None:
            query = query.lte("min_gpa", min_gpa)
        
        if search:
            query = query.ilike("name", f"%{search}%")
        
        # Execute query
        result = query.execute()
        universities = result.data
        
        # Apply additional filters (budget and field require post-processing)
        if min_budget is not None or max_budget is not None:
            filtered = []
            for uni in universities:
                total_cost = (uni.get("tuition_max", 0) or 0) + (uni.get("living_cost_yearly", 0) or 0)
                if min_budget and total_cost < min_budget:
                    continue
                if max_budget and total_cost > max_budget:
                    continue
                filtered.append(uni)
            universities = filtered
        
        if field:
            filtered = []
            field_lower = field.lower()
            for uni in universities:
                programs = uni.get("programs_offered", []) or []
                if any(field_lower in program.lower() for program in programs):
                    filtered.append(uni)
            universities = filtered
        
        # Pagination
        total = len(universities)
        start = (page - 1) * limit
        end = start + limit
        universities = universities[start:end]
        
        # Enrich with shortlist info
        shortlist_result = supabase.table("shortlists").select("university_id, bucket, is_locked").eq("user_id", current_user.id).execute()
        shortlist_map = {item["university_id"]: item for item in (shortlist_result.data or [])}
        
        for uni in universities:
            s_info = shortlist_map.get(uni["id"])
            if s_info:
                uni["shortlist_info"] = {
                    "bucket": s_info["bucket"],
                    "is_locked": s_info["is_locked"]
                }
            else:
                uni["shortlist_info"] = None
        
        return {
            "universities": universities,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search universities: {str(e)}"
        )


@router.get("/recommendations")
async def get_recommendations(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Get AI-powered university recommendations based on user profile
    
    Returns universities with:
    - Match score (0-100)
    - Category (Dream/Target/Safe)
    - Why it fits
    - Potential risks
    """
    try:
        # Get user profile
        profile_result = supabase.table("profiles").select("*").eq("user_id", current_user.id).execute()
        
        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please complete onboarding first."
            )
        
        user_profile = profile_result.data[0]
        
        # Get all universities
        universities_result = supabase.table("universities").select("*").execute()
        universities = universities_result.data
        
        # Calculate match scores for each university
        recommendations = []
        for uni in universities:
            match_score = calculate_match_score(user_profile, uni)
            category = categorize_university(
                match_score, 
                uni.get("acceptance_rate", 50),
                uni.get("ranking")
            )
            why_fits = generate_why_fits(user_profile, uni, match_score)
            risks = identify_risks(user_profile, uni)
            
            recommendations.append({
                **uni,
                "match_score": match_score,
                "category": category,
                "why_fits": why_fits,
                "risks": risks,
                "total_annual_cost": (uni.get("tuition_max", 0) or 0) + (uni.get("living_cost_yearly", 0) or 0)
            })
        
        # Sort by match score (highest first)
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Enrich with shortlist info
        shortlist_result = supabase.table("shortlists").select("university_id, bucket, is_locked").eq("user_id", current_user.id).execute()
        shortlist_map = {item["university_id"]: item for item in (shortlist_result.data or [])}
        
        final_recs = []
        for uni in recommendations[:limit]:
             s_info = shortlist_map.get(uni["id"])
             if s_info:
                 uni["shortlist_info"] = {
                     "bucket": s_info["bucket"],
                     "is_locked": s_info["is_locked"]
                 }
             else:
                 uni["shortlist_info"] = None
             final_recs.append(uni)

        # Return top matches
        return {
            "recommendations": final_recs,
            "total": len(recommendations),
            "user_profile_summary": {
                "gpa": user_profile.get("gpa"),
                "budget_max": user_profile.get("budget_max"),
                "preferred_countries": user_profile.get("preferred_countries"),
                "field_of_study": user_profile.get("field_of_study")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/{university_id}")
async def get_university_details(university_id: int):
    """
    Get detailed information about a specific university
    """
    try:
        result = supabase.table("universities").select("*").eq("id", university_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="University not found"
            )
        
        university = result.data[0]
        
        # Calculate total cost
        total_annual_cost = (university.get("tuition_max", 0) or 0) + (university.get("living_cost_yearly", 0) or 0)
        university["total_annual_cost"] = total_annual_cost
        
        return {"university": university}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch university details: {str(e)}"
        )


@router.get("/{university_id}/match")
async def get_match_analysis(
    university_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed match analysis for a specific university
    """
    try:
        # Get user profile
        profile_result = supabase.table("profiles").select("*").eq("user_id", current_user.id).execute()
        
        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        user_profile = profile_result.data[0]
        
        # Get university
        uni_result = supabase.table("universities").select("*").eq("id", university_id).execute()
        
        if not uni_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="University not found"
            )
        
        university = uni_result.data[0]
        
        # Calculate match
        # match_score = calculate_match_score(user_profile, university)
        # category = categorize_university(
        #     match_score,
        #     university.get("acceptance_rate", 50),
        #     university.get("ranking")
        # )
        
        # Try AI for match score and category
        ai_result = await calculate_ai_match_score(user_profile, university)
        
        match_score = ai_result.get("match_score", 0)
        
        if match_score == 0:
            # Fallback to rule-based engine if AI fails
            match_score = calculate_match_score(user_profile, university)
            category = categorize_university(
                match_score,
                university.get("acceptance_rate", 50),
                university.get("ranking")
            )
            # generate_why_fits returns string, wrap in list
            why_fits = [generate_why_fits(user_profile, university, match_score)]
            risks = identify_risks(user_profile, university)
        else:
            category = ai_result.get("category", "Target")
            reasoning = ai_result.get("reasoning", "")
            # Ensure why_fits is always a list
            why_fits = [reasoning] if reasoning else [generate_why_fits(user_profile, university, match_score)]
            risks = identify_risks(user_profile, university)
        
        return {
            "university": university,
            "match_analysis": {
                "match_score": match_score,
                "category": category,
                "why_fits": why_fits,
                "risks": risks,
                "source": "AI" if match_score > 0 and ai_result.get("match_score", 0) > 0 else "Rule-based Fallback",
                "ai_debug_error": ai_result.get("error_details"),
                "recommendation": "Highly Recommended" if match_score >= 80 else "Good Fit" if match_score >= 60 else "Consider Carefully"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze match: {str(e)}"
        )


@router.get("/countries/list")
async def get_available_countries():
    """
    Get list of all countries with universities in database
    """
    try:
        result = supabase.table("universities").select("country").execute()
        
        countries = list(set(uni["country"] for uni in result.data if uni.get("country")))
        countries.sort()
        
        # Count universities per country
        country_counts = {}
        for uni in result.data:
            country = uni.get("country")
            if country:
                country_counts[country] = country_counts.get(country, 0) + 1
        
        country_list = [
            {"country": country, "university_count": country_counts[country]}
            for country in countries
        ]
        
        return {"countries": country_list}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch countries: {str(e)}"
        )
