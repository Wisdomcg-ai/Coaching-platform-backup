-- Remove super_admin from old email
DELETE FROM public.system_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mattmalouf@wisdomcoaching.com.au'
)
AND role = 'super_admin';
