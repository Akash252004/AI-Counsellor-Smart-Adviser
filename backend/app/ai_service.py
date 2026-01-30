"""
Google Gemini AI integration service
Provides context-aware counselling guidance
"""
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()

# Configure Gemini for Chat (Primary)
genai.configure(api_key=settings.gemini_api_key_chat)

# Initialize model
model = genai.GenerativeModel('models/gemini-flash-latest')


def build_profile_context(profile: dict, stage: str) -> str:
    """Build context string from user profile and stage"""
    
    # Get user's name
    user_name = profile.get('full_name', 'Student')
    
    context = f"""You are an AI Study Abroad Counsellor helping {user_name} plan their international education journey.

STUDENT PERSONAL DETAILS:
- Name: {user_name}
- Father's Occupation: {profile.get('father_occupation', 'N/A')}
- Mother's Occupation: {profile.get('mother_occupation', 'N/A')}
- Family Income Range: {profile.get('family_income', 'N/A')}
- Siblings: {profile.get('siblings_count', 'N/A')}

ACADEMIC BACKGROUND:
- Current Education: {profile.get('degree', 'N/A')} in {profile.get('major', 'N/A')}
- GPA: {profile.get('gpa', 'N/A')}/10
- Graduation Year: {profile.get('graduation_year', 'N/A')}

STUDY GOALS:
- Target Degree: {profile.get('intended_degree', 'N/A')}
- Field of Study: {profile.get('field_of_study', 'N/A')}
- Target Intake: {profile.get('target_intake_year', 'N/A')}
- Preferred Countries: {', '.join(profile.get('preferred_countries', []))}

BUDGET:
- Annual Budget: ${profile.get('budget_min', 0):,.0f} - ${profile.get('budget_max', 0):,.0f}
- Funding Type: {profile.get('funding_type', 'N/A')}

TEST PREPARATION:
- IELTS/TOEFL: {profile.get('ielts_toefl_status', 'N/A')} - Score: {profile.get('ielts_toefl_score', 'N/A')}
- GRE/GMAT: {profile.get('gre_gmat_status', 'N/A')} - Score: {profile.get('gre_gmat_score', 'N/A')}
- SOP Status: {profile.get('sop_status', 'N/A')}

CURRENT STAGE: {stage}

IMPORTANT GUIDELINES:
1. Address the student by their name ({user_name})
2. KEEP RESPONSES SHORT AND SIMPLE (max 3-4 sentences per section).
3. Use simple bullet points for readability.
4. DO NOT USE ASTERISKS (*) FOR BOLDING. DO NOT USE BOLD TEXT.
5. Focus on the most important 2-3 points only.
6. Be encouraging but direct.

STRUCTURE YOUR RESPONSE LIKE THIS:
- Greeting: Hi {user_name}! (1 sentence)
- Direct Answer: Clear answer to the question (3-4 bullet points max)
- Key Recommendation: Best course of action (1-2 sentences)

Respond in a helpful, conversational tone. Avoid jargon."""

    return context



async def get_ai_response(user_message: str, profile: dict, stage: str, user_id: str = None, db_client = None) -> str:
    """
    Get AI response with profile context and execute actions
    """
    
    try:
        # Build context
        context = build_profile_context(profile, stage)
        
        # Tools instructions
        tools_context = """
AVAILABLE TOOLS:
You can perform actions for the student. Use these EXACT formats in your response (Action tags will be hidden from user):

1. SHORTLIST UNIVERSITY: <<<ACTION:SHORTLIST:University Name>>>
   - Use when student wants to add a university or you recommend one strongly.
   - Example: "I've added Oxford to your list. <<<ACTION:SHORTLIST:University of Oxford>>>"

2. LOCK UNIVERSITY: <<<ACTION:LOCK:University Name>>>
   - Use when student decides to finalize/lock a university application.
   - The university MUST already be in their shortlist.
   - Example: "Great choice! Locking that in. <<<ACTION:LOCK:Harvard University>>>"

3. CREATE TASK: <<<ACTION:TASK:Title|Description>>>
   - Use to add items to their to-do list.
   - Example: "I've added a reminder. <<<ACTION:TASK:Register for IELTS|Book slot before Oct 15>>>"

RULES:
- Only use tools when explicitly requested or clearly implied.
- You can use multiple tools in one response.
- Always provide a polite text confirmation along with the tool tag.
"""
        
        # Create full prompt
        full_prompt = f"""{context}

{tools_context}

STUDENT QUESTION:
{user_message}

COUNSELLOR RESPONSE:"""
        
        # Generate response
        response = model.generate_content(full_prompt)
        ai_text = response.text
        
        # Process Actions if DB client provided
        if user_id and db_client:
            ai_text = await _process_actions(ai_text, user_id, db_client)
        
        return ai_text
        
    except Exception as e:
        error_str = str(e)
        print(f"Error generating AI response: {e}")
        
        if "429" in error_str:
            return "I'm receiving too many requests right now. Please give me a minute to rest! 😅"
        
        return f"DEBUG ERROR: {error_str}"

import re
import aiohttp
import json

async def _process_actions(text: str, user_id: str, db: any) -> str:
    """Detect and execute actions in AI response"""
    
    # Regex to find <<<ACTION:TYPE:PARAM>>>
    # Allow optional spaces around colons
    pattern = r"<<<ACTION\s*:\s*([A-Z]+)\s*:\s*(.*?)>>>"
    
    matches = re.findall(pattern, text)
    if not matches:
        return text
        
    cleaned_text = text
    
    # We need to reconstruct the full tag to replace it, 
    # but since regex handles spaces, we can't just reconstruct strictly.
    # We should iterate matches and replace based on the match.
    # But re.findall returns tuples. 
    # Better to use re.finditer to get span, but text changes size.
    # Simplest: Regex sub to remove tags first? 
    # No, we need params.
    
    # Strategy: Replace all tags with "" first.
    # Then append success/fail messages.
    
    cleaned_text = re.sub(pattern, "", text) 
    
    feedback_msgs = []

    for action_type, param in matches:
        try:
            param = param.strip()
            if action_type == "SHORTLIST":
                uni_name = await _action_shortlist(param, user_id, db)
                feedback_msgs.append(f"✓ Shortlisted: {uni_name}")
            elif action_type == "LOCK":
                uni_name = await _action_lock(param, user_id, db)
                feedback_msgs.append(f"✓ Locked: {uni_name}")
            elif action_type == "TASK":
                parts = param.split('|', 1)
                title = parts[0].strip()
                desc = parts[1].strip() if len(parts) > 1 else ""
                await _action_create_task(title, desc, user_id, db)
                feedback_msgs.append(f"✓ Task Added: {title}")
                
        except Exception as e:
            print(f"Action {action_type} failed: {e}")
            feedback_msgs.append(f"⚠️ Action Failed: {str(e)}")

    if feedback_msgs:
        # Append system feedback at the end
        cleaned_text += "\n\n" + "\n".join(feedback_msgs)

    return cleaned_text

async def _action_shortlist(uni_name: str, user_id: str, db: any) -> str:
    print(f"AI Action: Shortlisting {uni_name}")
    # 1. Search University ID (Fuzzy match)
    res = db.table("universities").select("id, name").ilike("name", f"%{uni_name}%").limit(1).execute()
    
    if not res.data:
        raise ValueError(f"University '{uni_name}' not found in database.")
        
    uni_data = res.data[0]
    uni_id = uni_data['id']
    real_name = uni_data['name']
    
    # 2. Add to Shortlist
    try:
        db.table("shortlists").insert({
            "user_id": user_id,
            "university_id": uni_id,
            "bucket": "Target",
            "is_locked": False
        }).execute()
    except Exception as e:
        if "duplicate" in str(e) or "unique constraint" in str(e).lower():
            return f"{real_name} (Already in list)"
        else:
            raise e
            
    return real_name

async def _action_lock(uni_name: str, user_id: str, db: any) -> str:
    print(f"AI Action: Locking {uni_name}")
    # 1. Search Uni ID
    res = db.table("universities").select("id, name").ilike("name", f"%{uni_name}%").limit(1).execute()
    if not res.data:
        raise ValueError(f"University '{uni_name}' not found.")
        
    uni_data = res.data[0]
    uni_id = uni_data['id']
    real_name = uni_data['name']
    
    # 2. Update Shortlist to locked
    # Check if in shortlist first? "match" does that.
    res = db.table("shortlists").update({"is_locked": True}).match({"user_id": user_id, "university_id": uni_id}).execute()
    
    if not res.data:
        raise ValueError(f"'{real_name}' is not in your shortlist. Please shortlist it first.")
        
    return real_name

async def _action_create_task(title: str, desc: str, user_id: str, db: any):
    print(f"AI Action: Creating Task {title}")
    # Use custom_tasks table
    db.table("custom_tasks").insert({
        "user_id": user_id,
        "title": title,
        "description": desc,
        "is_complete": False,
        "category": "ai_suggestion"
    }).execute()



async def generate_initial_tasks(profile: dict, stage: str) -> list[dict]:
    """
    Generate initial AI tasks based on profile and stage
    
    Args:
        profile: User profile dictionary
        stage: Current user stage
        
    Returns:
        List of task dictionaries with title and description
    """
    
    try:
        context = build_profile_context(profile, stage)
        
        prompt = f"""{context}

Generate 3-5 specific, actionable tasks this student should complete IMMEDIATELY based on their current stage and profile.

Format your response as a numbered list where each item has:
1. Clear task title
2. Brief description (1-2 sentences)

Example:
1. Prepare for IELTS Exam - Schedule your IELTS exam for at least 2 months before application deadlines. Aim for a minimum score of 7.0 for top universities.

Generate tasks now:"""
        
        response = model.generate_content(prompt)
        
        # Parse response into tasks
        tasks = []
        lines = response.text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if line and line[0].isdigit():
                # Remove the number prefix
                task_text = line.split('.', 1)[1].strip() if '.' in line else line
                
                # Split title and description
                if '-' in task_text:
                    title, description = task_text.split('-', 1)
                    tasks.append({
                        'title': title.strip(),
                        'description': description.strip()
                    })
                else:
                    tasks.append({
                        'title': task_text,
                        'description': ''
                    })
        
        return tasks[:5]  # Limit to 5 tasks
        
    except Exception as e:
        print(f"Error generating tasks: {e}")
        # Return default tasks
        return [
            {
                'title': 'Complete Your Profile',
                'description': 'Make sure all sections of your profile are filled out accurately.'
            },
            {
                'title': 'Research Target Universities',
                'description': 'Look into universities that match your academic background and budget.'
            }
        ]

async def calculate_ai_match_score(profile: dict, university: dict) -> dict:
    """
    Calculate match score and category using AI (Direct REST API)
    Uses separate ANALYSIS API key to avoid rate limits on chat.
    """
    try:
        context = build_profile_context(profile, "SHORTLISTING")
        
        uni_details = f"""
        UNIVERSITY DETAILS:
        - Name: {university.get('name')}
        - Country: {university.get('country')}
        - Global Ranking: {university.get('ranking', 'N/A')}
        - Acceptance Rate: {university.get('acceptance_rate', 'N/A')}%
        - Tuition: ${university.get('tuition_max', 0):,.0f}
        - Min GPA: {university.get('min_gpa', 'N/A')}
        """
        
        prompt = f"""{context}
        {uni_details}
        
        Evaluate the match chances for this student applying to {university.get('name')}.
        
        Return ONLY a JSON object with the following keys:
        - match_score: (integer 0-100)
        - category: (string "Dream", "Target", or "Safe")
        - reasoning: (string, brief 1-sentence explanation)
        
        Do not include markdown formatting or explanations outside the JSON.
        """
        
        # Use direct REST API call with secondary key
        api_key = settings.gemini_api_key_analysis
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
        
        headers = {'Content-Type': 'application/json'}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 200,
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise Exception(f"Gemini API Error {resp.status}: {error_text}")
                
                data = await resp.json()
                
        # Parse Response
        try:
            text = data['candidates'][0]['content']['parts'][0]['text']
            text = text.replace('```json', '').replace('```', '').strip()
            
            # Simple JSON extraction
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                result = json.loads(text[start:end])
            else:
                raise ValueError("Could not parse JSON from AI response")
                
            return result
            
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            print(f"Error parsing AI analysis: {e}")
            raise e

    except Exception as e:
        print(f"Error calculating AI match: {e}")
        # Fallback to heuristic (handled by caller)
        return {
            "match_score": 0,
            "category": "Unknown",
            "reasoning": f"AI Error: {str(e)}",
            "error_details": str(e)
        }
