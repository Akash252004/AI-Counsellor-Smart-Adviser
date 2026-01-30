-- Create Shortlists Table if not exists and fix RLS
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.shortlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id INTEGER REFERENCES public.universities(id) ON DELETE CASCADE,
    bucket TEXT CHECK (bucket IN ('Dream', 'Target', 'Safe')),
    why_fits TEXT,
    risks TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicates
ALTER TABLE public.shortlists DROP CONSTRAINT IF EXISTS shortlists_user_uni_unique;
ALTER TABLE public.shortlists ADD CONSTRAINT shortlists_user_uni_unique UNIQUE (user_id, university_id);

-- Enable RLS
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own shortlist" ON public.shortlists;
CREATE POLICY "Users can view their own shortlist"
ON public.shortlists FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their own shortlist" ON public.shortlists;
CREATE POLICY "Users can insert into their own shortlist"
ON public.shortlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shortlist" ON public.shortlists;
CREATE POLICY "Users can update their own shortlist"
ON public.shortlists FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own shortlist" ON public.shortlists;
CREATE POLICY "Users can delete from their own shortlist"
ON public.shortlists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify User Stages table exists too (mentioned in router)
CREATE TABLE IF NOT EXISTS public.user_stages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_stage TEXT DEFAULT 'PROFILE_COMPLETE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view/update their own stage" ON public.user_stages;
CREATE POLICY "Users can view/update their own stage"
ON public.user_stages FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
