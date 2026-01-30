-- FIX SIGNUP ERROR
-- We need to remove the automatic trigger because it conflicts with the backend logic
-- and causes Foreign Key errors during signup.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure users table RLS is strictly disabled for now to allow signup
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
