-- =====================================================
-- CHANGE SUPER ADMIN EMAIL
-- =====================================================
-- This script:
-- 1. Creates a new user: mattmalouf@wisdomcg.com.au (NEW super admin)
-- 2. Keeps existing user: mattmalouf@wisdomcoaching.com.au (will be converted to client)
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check current users
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au')
ORDER BY email;

-- Step 2: Check current system roles
SELECT
  sr.user_id,
  u.email,
  sr.role,
  sr.created_at
FROM public.system_roles sr
JOIN auth.users u ON u.id = sr.user_id
WHERE u.email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au');

-- =====================================================
-- Step 3: CREATE NEW SUPER ADMIN USER
-- =====================================================
-- IMPORTANT: Replace 'YOUR_PASSWORD_HERE' with your actual password

/*

-- Create the new super admin user
-- This creates a completely new user with a new UUID
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- New UUID
  'authenticated',
  'authenticated',
  'mattmalouf@wisdomcg.com.au',
  crypt('YOUR_PASSWORD_HERE', gen_salt('bf')), -- Replace with your password
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Matt","last_name":"Malouf"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the new user ID
DO $$
DECLARE
  new_user_id UUID;
  old_user_id UUID;
BEGIN
  -- Get the new user's ID
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'mattmalouf@wisdomcg.com.au';

  -- Get the old user's ID
  SELECT id INTO old_user_id
  FROM auth.users
  WHERE email = 'mattmalouf@wisdomcoaching.com.au';

  RAISE NOTICE 'New super admin user ID: %', new_user_id;
  RAISE NOTICE 'Old user ID (will keep): %', old_user_id;

  -- Set the new user as super_admin
  INSERT INTO public.system_roles (user_id, role)
  VALUES (new_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

  -- Remove super_admin role from old user (if it has one)
  DELETE FROM public.system_roles
  WHERE user_id = old_user_id AND role = 'super_admin';

  -- Optionally: Set old user as client (if they have a business)
  -- Uncomment if you want to make the old email a client
  -- INSERT INTO public.system_roles (user_id, role)
  -- VALUES (old_user_id, 'client')
  -- ON CONFLICT (user_id) DO UPDATE SET role = 'client';

  RAISE NOTICE '✓ New super admin created: mattmalouf@wisdomcg.com.au';
  RAISE NOTICE '✓ Old user preserved: mattmalouf@wisdomcoaching.com.au';
END $$;

*/

-- =====================================================
-- Step 4: VERIFY THE CHANGES
-- =====================================================

/*

-- Check all users
SELECT
  id,
  email,
  created_at
FROM auth.users
WHERE email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au')
ORDER BY email;

-- Check system roles
SELECT
  sr.user_id,
  u.email,
  sr.role,
  sr.created_at
FROM public.system_roles sr
JOIN auth.users u ON u.id = sr.user_id
WHERE u.email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au')
ORDER BY u.email;

-- Check if old user has businesses
SELECT
  b.id,
  b.name,
  b.business_name,
  u.email as owner_email
FROM public.businesses b
JOIN auth.users u ON u.id = b.owner_id
WHERE u.email = 'mattmalouf@wisdomcoaching.com.au';

*/

-- =====================================================
-- ALTERNATIVE: Use Supabase Auth Admin API
-- =====================================================
-- If the above doesn't work, you can also create the user via the Supabase dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user"
-- 3. Email: mattmalouf@wisdomcg.com.au
-- 4. Set password
-- 5. Then run this to set as super admin:

/*
-- Get the user ID from the dashboard and replace USER_ID_HERE
INSERT INTO public.system_roles (user_id, role)
VALUES ('USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
*/
