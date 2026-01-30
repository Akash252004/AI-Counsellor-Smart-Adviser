-- Create universities table with all columns including scholarships
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.universities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT,
    ranking INTEGER,
    
    -- Program information
    programs_offered TEXT[],
    
    -- Requirements
    min_gpa DECIMAL,
    min_ielts DECIMAL,
    min_toefl DECIMAL,
    requires_gre BOOLEAN DEFAULT FALSE,
    requires_gmat BOOLEAN DEFAULT FALSE,
    
    -- Cost information
    tuition_min DECIMAL,
    tuition_max DECIMAL,
    living_cost_yearly DECIMAL,
    
    -- Scholarship information
    has_scholarships BOOLEAN DEFAULT FALSE,
    scholarship_types TEXT[],
    scholarship_amount_min DECIMAL,
    scholarship_amount_max DECIMAL,
    scholarship_deadline TEXT,
    
    -- Additional info
    acceptance_rate DECIMAL,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_universities_country ON public.universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON public.universities(ranking);
CREATE INDEX IF NOT EXISTS idx_universities_has_scholarships ON public.universities(has_scholarships);

-- Add comments
COMMENT ON TABLE public.universities IS 'University database with programs, requirements, and scholarship information';
COMMENT ON COLUMN public.universities.has_scholarships IS 'Whether university offers scholarships to international students';
COMMENT ON COLUMN public.universities.scholarship_types IS 'Types of scholarships available (Merit, Need-based, etc.)';
COMMENT ON COLUMN public.universities.scholarship_amount_min IS 'Minimum scholarship amount in USD per year';
COMMENT ON COLUMN public.universities.scholarship_amount_max IS 'Maximum scholarship amount in USD per year';
COMMENT ON COLUMN public.universities.scholarship_deadline IS 'Scholarship application deadline';

-- Grant permissions (adjust as needed for your RLS policies)
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Policy to allow all users to read universities
CREATE POLICY "Allow public read access to universities"
ON public.universities FOR SELECT
TO public
USING (true);
