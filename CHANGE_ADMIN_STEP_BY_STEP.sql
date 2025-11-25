-- =====================================================
-- STEP 1: Check current users
-- =====================================================
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au')
ORDER BY email;

-- =====================================================
-- STEP 2: Check current system roles
-- =====================================================
SELECT
  sr.user_id,
  u.email,
  sr.role,
  sr.created_at
FROM public.system_roles sr
JOIN auth.users u ON u.id = sr.user_id
WHERE u.email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au');

-- =====================================================
-- STEP 3: Create new super admin user via Supabase Dashboard
-- =====================================================
-- DO THIS IN SUPABASE DASHBOARD:
-- 1. Go to Authentication > Users
-- 2. Click "Add user"
-- 3. Email: mattmalouf@wisdomcg.com.au
-- 4. Auto Confirm User: YES
-- 5. Set a password
-- 6. Click "Create user"
-- 7. COPY THE USER ID (you'll need it for Step 4)

-- =====================================================
-- STEP 4: Set new user as super_admin
-- =====================================================
-- Run this query and replace 'PASTE_NEW_USER_ID_HERE' with the ID from Step 3

INSERT INTO public.system_roles (user_id, role)
VALUES ('PASTE_NEW_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- =====================================================
-- STEP 5: Remove super_admin from old email (OPTIONAL)
-- =====================================================
-- Only run this if you want to remove super admin access from the old email

DELETE FROM public.system_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mattmalouf@wisdomcoaching.com.au'
)
AND role = 'super_admin';

-- =====================================================
-- STEP 6: Verify the changes
-- =====================================================
SELECT
  sr.user_id,
  u.email,
  sr.role,
  sr.created_at
FROM public.system_roles sr
JOIN auth.users u ON u.id = sr.user_id
WHERE u.email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au')
ORDER BY u.email;
