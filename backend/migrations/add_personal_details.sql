-- COMPLETE Migration: Add ALL Missing Columns to Profiles Table
-- Run this in Supabase SQL Editor

-- Personal Details columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS family_income TEXT,
ADD COLUMN IF NOT EXISTS father_occupation TEXT,
ADD COLUMN IF NOT EXISTS mother_occupation TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS mother_name TEXT,
ADD COLUMN IF NOT EXISTS siblings_count INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sibling_details TEXT;

-- Document columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sop_url TEXT,
ADD COLUMN IF NOT EXISTS lor_url TEXT;

-- Exam & Readiness columns  
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ielts_toefl_status TEXT DEFAULT 'Not taken',
ADD COLUMN IF NOT EXISTS ielts_toefl_score DECIMAL,
ADD COLUMN IF NOT EXISTS gre_gmat_status TEXT DEFAULT 'Not taken',
ADD COLUMN IF NOT EXISTS gre_gmat_score DECIMAL,
ADD COLUMN IF NOT EXISTS sop_status TEXT DEFAULT 'Not started';

-- Profile completion flag
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT FALSE;
