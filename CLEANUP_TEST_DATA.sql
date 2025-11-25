-- =====================================================
-- CLEANUP TEST DATA - Keep Super Admin Only
-- =====================================================
-- This script removes all test clients and businesses
-- while preserving the super admin account
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: First, let's see what we're about to delete
-- (Run this first to review before deleting)
SELECT
  'Super Admins (KEEP)' as category,
  u.id,
  u.email,
  sr.role
FROM auth.users u
JOIN public.system_roles sr ON sr.user_id = u.id
WHERE sr.role = 'super_admin'

UNION ALL

SELECT
  'Clients (DELETE)' as category,
  u.id,
  u.email,
  sr.role
FROM auth.users u
LEFT JOIN public.system_roles sr ON sr.user_id = u.id
WHERE sr.role = 'client' OR sr.role IS NULL

UNION ALL

SELECT
  'Coaches (DELETE)' as category,
  u.id,
  u.email,
  sr.role
FROM auth.users u
JOIN public.system_roles sr ON sr.user_id = u.id
WHERE sr.role = 'coach';

-- =====================================================
-- Step 2: DELETE TEST DATA
-- =====================================================

-- Delete in the correct order to avoid foreign key violations
DO $$
DECLARE
  business_to_delete UUID;
  user_to_delete UUID;
  deleted_businesses INT := 0;
  deleted_users INT := 0;
BEGIN
  -- First: Delete all businesses owned by non-super-admins
  FOR business_to_delete IN
    SELECT b.id
    FROM public.businesses b
    WHERE b.owner_id NOT IN (
      SELECT user_id FROM public.system_roles WHERE role = 'super_admin'
    )
    OR b.owner_id IS NULL
  LOOP
    DELETE FROM public.businesses WHERE id = business_to_delete;
    deleted_businesses := deleted_businesses + 1;
    RAISE NOTICE 'Deleted business: %', business_to_delete;
  END LOOP;

  -- Second: Delete all users who are NOT super admins
  FOR user_to_delete IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.system_roles sr ON sr.user_id = u.id
    WHERE sr.role IS NULL
       OR sr.role != 'super_admin'
  LOOP
    DELETE FROM auth.users WHERE id = user_to_delete;
    deleted_users := deleted_users + 1;
    RAISE NOTICE 'Deleted user: %', user_to_delete;
  END LOOP;

  RAISE NOTICE '✓ Cleanup complete!';
  RAISE NOTICE '✓ Deleted % businesses', deleted_businesses;
  RAISE NOTICE '✓ Deleted % users', deleted_users;
  RAISE NOTICE '✓ Super admin account(s) preserved';
END $$;

-- =====================================================
-- Step 3: Verify cleanup (Run this after Step 2)
-- =====================================================

-- Check remaining users
SELECT
  'Remaining Users' as info,
  COUNT(*) as count
FROM auth.users;

-- Check remaining businesses
SELECT
  'Remaining Businesses' as info,
  COUNT(*) as count
FROM public.businesses;

-- Check system roles
SELECT
  role,
  COUNT(*) as count
FROM public.system_roles
GROUP BY role;
