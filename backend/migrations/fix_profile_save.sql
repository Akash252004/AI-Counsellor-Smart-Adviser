-- Fix permissions for Profile and User Stages (Required for Saving Profile)

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can manage their own stage" ON public.user_stages;
DROP POLICY IF EXISTS "Users can insert their own stage" ON public.user_stages;
DROP POLICY IF EXISTS "Users can update their own stage" ON public.user_stages;
DROP POLICY IF EXISTS "Users can select their own stage" ON public.user_stages;

-- 3. Create PROFILES Policies
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can select their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Create USER_STAGES Policies
CREATE POLICY "Users can insert their own stage"
ON public.user_stages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stage"
ON public.user_stages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can select their own stage"
ON public.user_stages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Automate User Setup (Optional but recommended trigger)
-- This ensures user_stages is created automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_stages (user_id, current_stage)
  VALUES (new.id, 'PROFILE_COMPLETE'); -- Default start
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
