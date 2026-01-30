# AI University Counsellor

A comprehensive AI-powered platform helping students find their dream universities abroad. The application combines a modern Next.js frontend with a Python/FastAPI backend and uses Gemini AI for intelligent counseling and profile analysis.

## 🚀 Features

-   **AI Counsellor Chat**: Real-time chat with an AI agent to discuss study abroad plans.
-   **University Finder**: Search and filter universities based on various criteria.
-   **Profile Analysis**: Get an AI-generated "Match Score" for universities based on your profile (GPA, Budget, Exams).
-   **Task Management**: Kanban-style board to track application progress.
-   **Shortlisting**: Save universities to your personal shortlist.
-   **Authentication**: Secure Signup/Login using Supabase (Email/Password & Google OAuth).
-   **Dashboard**: Central hub for all your study abroad activities.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Custom CSS (Aurora Theme) with Glassmorphism design
-   **Icons**: React Icons
-   **State Management**: React Hooks

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
-   **AI Model**: Google Gemini Pro (via `google-generativeai`)
-   **Database**: Supabase (PostgreSQL)

### Infrastructure & Tools
-   **Auth**: Supabase Authentication
-   **Storage**: Supabase Storage (for avatars/documents)
-   **Environment**: Windows (PowerShell)

## 📂 Project Structure

```
/
├── frontend/                 # Next.js Application
│   ├── app/                  # App Router Pages
│   │   ├── dashboard/        # Main User Dashboard
│   │   ├── universities/     # University Search & Details
│   │   ├── tasks/            # Kanban Board
│   │   └── ...
│   ├── components/           # Reusable UI Components
│   ├── lib/                  # Utilities (API, Supabase, Theme)
│   └── public/               # Static Assets
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py           # API Entry Point
│   │   ├── models.py         # Pydantic Models
│   │   └── ...
│   └── venv/                 # Python Virtual Environment
│
└── README.md                 # Project Documentation
```

## ⚡ Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   Supabase Account

### 1. Environment Setup

Create a `.env` file in the root `frontend` folder:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_2=your_second_key_for_analysis (optional)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### 2. Run the Backend (Python)

Open a terminal in the `backend` directory:
```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will run at `http://localhost:8000`.

### 3. Run the Frontend (Next.js)

Open a new terminal in the `frontend` directory:
```powershell
# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```
Frontend will run at `http://localhost:3000`.

## 🔒 Authentication Flow
-   **Google Sign-In**: Redirects to `/auth/callback` to handle session exchange.
-   **Email/Password**: Standard flow with Forgot Password (OTP support).
-   **Session**: Managed via Supabase Auth Helpers.

## 🤖 AI Logic
-   The backend exposes a `/chat` endpoint for conversation.
-   The `/analyze_profile` endpoint calculates match scores (0-100%) by comparing student stats with university requirements.
-   Fallback logic ensures a score is always returned even if the AI service times out.

## 📝 Troubleshooting
-   **404 on Google Login**: Ensure `http://localhost:3000/auth/callback` is added to Redirect URLs in Supabase.
-   **Backend Connection Error**: Ensure the backend is running on port 8000 and valid in `.env`.
