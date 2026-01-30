-- MANUAL FIX FOR MISSING USER
-- Run this to insert your user record manually into the database

INSERT INTO public.users (id, email, name)
VALUES (
    '360efc26-85c9-4af2-ab3d-3c3042e2380b',
    'sikhakolanuakash@gmail.com',
    'sikhakolanu'
)
ON CONFLICT (id) DO NOTHING;

-- Also ensure the stage record exists
INSERT INTO public.user_stages (user_id, current_stage)
VALUES (
    '360efc26-85c9-4af2-ab3d-3c3042e2380b',
    'ONBOARDING'
)
ON CONFLICT (user_id) DO NOTHING;
