-- Check current system roles
SELECT
  sr.user_id,
  u.email,
  sr.role,
  sr.created_at
FROM public.system_roles sr
JOIN auth.users u ON u.id = sr.user_id
WHERE u.email IN ('mattmalouf@wisdomcoaching.com.au', 'mattmalouf@wisdomcg.com.au');
