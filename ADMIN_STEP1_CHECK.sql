-- Check current users
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au')
ORDER BY email;
