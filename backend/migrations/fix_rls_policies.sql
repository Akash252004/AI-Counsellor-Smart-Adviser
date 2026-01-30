-- Fix RLS Policies for AI Counsellor App
-- Run this in Supabase SQL Editor

-- =============================================
-- FIX: Universities Table RLS
-- =============================================

-- Ensure RLS is enabled
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid duplicates)
DROP POLICY IF EXISTS "Allow public read access to universities" ON public.universities;

-- Create policy to allow ALL users (authenticated, anon, public) to read universities
CREATE POLICY "Allow public read access to universities"
ON public.universities FOR SELECT
TO public, authenticated, anon
USING (true);

-- =============================================
-- FIX: Profiles Table RLS
-- =============================================

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies for authenticated users
-- Create policies for authenticated users
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FIX: User Stages Table RLS (if needed)
-- =============================================

ALTER TABLE IF EXISTS public.user_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own stage" ON public.user_stages;

CREATE POLICY "Users can manage their own stage"
ON public.user_stages FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this, test by:
-- 1. Going to /universities and clicking View Details on any university
-- 2. Going to /profile and viewing/editing your profile
