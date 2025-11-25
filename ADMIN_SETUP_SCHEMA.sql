-- =====================================================
-- ADMIN SETUP & CLIENT ONBOARDING
-- =====================================================
-- Add this to extend COACH_ADMIN_SCHEMA.sql

-- =====================================================
-- 1. SYSTEM ROLES (Super Admin / Coach / Client)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'coach', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own system role
CREATE POLICY "Users can view their own system role" ON public.system_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- 2. EXTEND BUSINESSES TABLE
-- =====================================================

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS assigned_coach_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS program_type TEXT,
  ADD COLUMN IF NOT EXISTS engagement_start_date DATE,
  ADD COLUMN IF NOT EXISTS session_frequency TEXT CHECK (session_frequency IN ('weekly', 'fortnightly', 'monthly')),
  ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '{"plan": true, "forecast": true, "goals": true, "chat": true, "documents": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive', 'archived'));

-- Index for coach assignments
CREATE INDEX IF NOT EXISTS idx_businesses_assigned_coach ON public.businesses(assigned_coach_id);

-- =====================================================
-- 3. CLIENT INVITATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),

  -- Invitation details
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Business setup data (stored until account created)
  business_data JSONB,

  -- Tracking
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Super admins can see all invitations
CREATE POLICY "Super admins can view all invitations" ON public.client_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.system_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- 4. ONBOARDING PROGRESS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Onboarding steps
  profile_completed BOOLEAN DEFAULT false,
  first_plan_created BOOLEAN DEFAULT false,
  first_forecast_created BOOLEAN DEFAULT false,
  first_goal_set BOOLEAN DEFAULT false,
  team_member_invited BOOLEAN DEFAULT false,
  first_session_scheduled BOOLEAN DEFAULT false,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own business onboarding
CREATE POLICY "Users can view their business onboarding" ON public.onboarding_progress
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.system_roles
    WHERE user_id = p_user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is coach
CREATE OR REPLACE FUNCTION public.is_coach(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.system_roles
    WHERE user_id = p_user_id AND role = 'coach'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's system role
CREATE OR REPLACE FUNCTION public.get_user_system_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.system_roles
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_role, 'client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create complete client account
CREATE OR REPLACE FUNCTION public.create_client_account(
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_business_name TEXT,
  p_business_data JSONB,
  p_coach_id UUID,
  p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_business_id UUID;
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- This function will be called from the Next.js API after creating user in Supabase Auth
  -- Just create the business and roles

  -- Create business
  INSERT INTO public.businesses (
    business_name,
    industry,
    abn,
    user_id,
    assigned_coach_id,
    program_type,
    engagement_start_date,
    session_frequency,
    status
  )
  VALUES (
    p_business_name,
    p_business_data->>'industry',
    p_business_data->>'abn',
    p_created_by, -- Temporary, will be updated
    p_coach_id,
    p_business_data->>'program_type',
    (p_business_data->>'engagement_start_date')::DATE,
    p_business_data->>'session_frequency',
    'pending'
  )
  RETURNING id INTO v_business_id;

  -- Create onboarding progress tracker
  INSERT INTO public.onboarding_progress (business_id)
  VALUES (v_business_id);

  -- Return result
  v_result := jsonb_build_object(
    'business_id', v_business_id,
    'success', true
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_client_invitations_email ON public.client_invitations(email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_token ON public.client_invitations(token);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON public.client_invitations(status);
CREATE INDEX IF NOT EXISTS idx_system_roles_role ON public.system_roles(role);

-- =====================================================
-- 7. SET YOUR USER AS SUPER ADMIN
-- =====================================================

-- IMPORTANT: Replace 'your-user-id-here' with your actual Supabase user ID
-- You can find this by running: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- INSERT INTO public.system_roles (user_id, role)
-- VALUES ('your-user-id-here', 'super_admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- =====================================================
-- SUCCESS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Admin setup schema created successfully';
  RAISE NOTICE '✓ System roles table ready';
  RAISE NOTICE '✓ Client invitation system ready';
  RAISE NOTICE '✓ Onboarding tracking enabled';
  RAISE NOTICE '';
  RAISE NOTICE '⚠ NEXT STEP: Set your user as super_admin';
  RAISE NOTICE 'Run: SELECT id FROM auth.users WHERE email = ''your@email.com'';';
  RAISE NOTICE 'Then uncomment and run the INSERT at the bottom of this file';
END $$;
