-- Allow inserts for seeding (Run this in Supabase SQL Editor)
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for universities" ON public.universities;

CREATE POLICY "Enable insert for universities"
ON public.universities FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);
