-- ============================================================================
-- CLEANUP DUPLICATE BUSINESS PROFILES
-- This script removes duplicate business_profile records, keeping only the
-- most recently updated one for each user
-- ============================================================================

-- Step 1: Identify and delete duplicate profiles, keeping the most recent one
DELETE FROM business_profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM business_profiles
  ORDER BY user_id, updated_at DESC NULLS LAST
);

-- Step 2: Verify - this should show only one profile per user
SELECT user_id, COUNT(*) as profile_count
FROM business_profiles
GROUP BY user_id
ORDER BY profile_count DESC;
