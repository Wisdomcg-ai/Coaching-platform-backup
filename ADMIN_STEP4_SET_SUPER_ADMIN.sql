-- REPLACE THE UUID BELOW WITH THE ACTUAL USER ID FROM SUPABASE DASHBOARD
-- After creating mattmalouf@wisdomcg.com.au in Dashboard, copy its ID and paste it below

INSERT INTO public.system_roles (user_id, role)
VALUES ('YOUR-USER-ID-GOES-HERE', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
