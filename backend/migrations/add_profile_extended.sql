-- Add Optional Personal Details and Document Columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS family_income TEXT, -- e.g. "10-15 Lakhs"
ADD COLUMN IF NOT EXISTS father_occupation TEXT,
ADD COLUMN IF NOT EXISTS sop_url TEXT,
ADD COLUMN IF NOT EXISTS lor_url TEXT;

-- We will treat 'is_complete' strictly now. 
-- It should only be true if mandatory fields are filled.
-- We can enforce this in the application logic.
