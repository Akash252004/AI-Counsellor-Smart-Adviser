"""
Profile strength calculation logic
"""


def calculate_academic_strength(gpa: float) -> str:
    """
    Calculate academic strength based on GPA
    
    Args:
        gpa: Student's GPA on 4.0 scale
        
    Returns:
        "Strong", "Average", or "Weak"
    """
    if gpa >= 3.5:
        return "Strong"
    elif gpa >= 2.8:
        return "Average"
    else:
        return "Weak"


def calculate_exam_status(ielts_status: str, gre_status: str) -> str:
    """
    Calculate overall exam preparation status
    
    Args:
        ielts_status: IELTS/TOEFL status
        gre_status: GRE/GMAT status
        
    Returns:
        "Not Started", "In Progress", or "Done"
    """
    statuses = [ielts_status.lower(), gre_status.lower()]
    
    if all('completed' in s or 'ready' in s for s in statuses):
        return "Done"
    elif any('progress' in s or 'scheduled' in s for s in statuses):
        return "In Progress"
    else:
        return "Not Started"


def calculate_sop_strength(sop_status: str) -> str:
    """
    Calculate SOP readiness
    
    Args:
        sop_status: SOP status
        
    Returns:
        "Not Started", "Draft", or "Ready"
    """
    status_lower = sop_status.lower()
    
    if 'ready' in status_lower or 'complete' in status_lower:
        return "Ready"
    elif 'draft' in status_lower or 'progress' in status_lower:
        return "Draft"
    else:
        return "Not Started"


def calculate_profile_strength(profile: dict) -> dict:
    """
    Calculate all profile strength indicators
    
    Args:
        profile: User profile dictionary
        
    Returns:
        Dictionary with academics, exams, and sop strength indicators
    """
    return {
        "academics": calculate_academic_strength(profile.get('gpa', 0.0)),
        "exams": calculate_exam_status(
            profile.get('ielts_toefl_status', 'Not Started'),
            profile.get('gre_gmat_status', 'Not Started')
        ),
        "sop": calculate_sop_strength(profile.get('sop_status', 'Not Started'))
    }
