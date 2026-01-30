-- Add scholarship columns to universities table
-- Run this in Supabase SQL Editor

ALTER TABLE public.universities
ADD COLUMN IF NOT EXISTS has_scholarships BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scholarship_types TEXT[],
ADD COLUMN IF NOT EXISTS scholarship_amount_min DECIMAL,
ADD COLUMN IF NOT EXISTS scholarship_amount_max DECIMAL,
ADD COLUMN IF NOT EXISTS scholarship_deadline TEXT;

-- Update any existing records to have default values
UPDATE public.universities
SET has_scholarships = FALSE
WHERE has_scholarships IS NULL;

-- Add comment
COMMENT ON COLUMN public.universities.has_scholarships IS 'Whether university offers scholarships to international students';
COMMENT ON COLUMN public.universities.scholarship_types IS 'Types of scholarships available (Merit, Need-based, etc.)';
COMMENT ON COLUMN public.universities.scholarship_amount_min IS 'Minimum scholarship amount in USD per year';
COMMENT ON COLUMN public.universities.scholarship_amount_max IS 'Maximum scholarship amount in USD per year';
COMMENT ON COLUMN public.universities.scholarship_deadline IS 'Scholarship application deadline';
