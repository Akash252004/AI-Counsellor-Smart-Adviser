# Deployment Guide 🚀

This guide will help you deploy your **AI Counsellor** application for free using **Vercel** (Frontend) and **Render** (Backend).

## Prerequisites

1.  **GitHub Account**: Ensure your code is pushed to a GitHub repository.
2.  **Supabase Project**: You should have your Supabase URL and Key ready.
3.  **Gemini API Key**: You should have your Google Gemini API Key ready.

---

## Part 1: Deploy Backend (Render)

We will use **Render** because it offers a free tier for Python web services and is very easy to set up.

1.  **Sign Up/Login**: Go to [render.com](https://render.com) and sign in with GitHub.
2.  **New Web Service**: Click **"New"** button -> **"Web Service"**.
3.  **Connect Repository**: Select your `AI-Counsellor` repository.
4.  **Configure Service**:
    *   **Name**: `ai-counsellor-backend` (or any name you like)
    *   **Region**: Frankfurt (EU Central) or Ohio (US East) - pick closest to you.
    *   **Root Directory**: `backend`  <-- **IMPORTANT**
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
    *   **Instance Type**: `Free`
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these keys (copy values from your local `.env`):
    *   `GEMINI_API_KEY`: `...`
    *   `GEMINI_API_KEY_ANALYSIS`: `...` (If you split keys, otherwise use same as above)
    *   `SUPABASE_URL`: `...`
    *   `SUPABASE_KEY`: `...`
6.  **Deploy**: Click **"Create Web Service"**.

> ⏳ **Note**: The free instance may take a few minutes to build. Once done, you will see a URL like `https://ai-counsellor-backend.onrender.com`. **Copy this URL.**

---

## Part 2: Deploy Frontend (Vercel)

We will use **Vercel** for the Next.js frontend.

1.  **Sign Up/Login**: Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2.  **Add New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**: Find your repo and click **"Import"**.
4.  **Configure Project**:
    *   **Framework Preset**: `Next.js` (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `frontend`. <-- **IMPORTANT**
5.  **Environment Variables**:
    Expand the "Environment Variables" section and add:
    *   `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase URL)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
    *   `NEXT_PUBLIC_API_URL`: (Paste the **Render Backend URL** you copied in Part 1)
        *   *Example*: `https://ai-counsellor-backend.onrender.com` (No trailing slash)
6.  **Deploy**: Click **"Deploy"**.

---

## Part 3: Final Configuration (Supabase)

For Google Sign-In to work on your live site, you need to tell Supabase your new Vercel URL.

1.  **Go to Supabase Dashboard**.
2.  Navigate to **Authentication** -> **URL Configuration**.
3.  **Site URL**: Change this to your Vercel URL (e.g., `https://ai-counsellor.vercel.app`).
4.  **Redirect URLs**: Add the following:
    *   `https://<your-vercel-app>.vercel.app/auth/callback`
    *   `https://<your-vercel-app>.vercel.app`
5.  **Save**.

---

## Part 4: Verify! ✅

1.  Open your Vercel URL.
2.  **Sign Up** or **Login**.
3.  Check the **Dashboard** (It should load data from the backend).
4.  Try the **AI Chat** (It should respond).

**🎉 You are live!**
