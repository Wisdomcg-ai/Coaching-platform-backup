-- =====================================================
-- WISDOM BI - COACH ADMIN PANEL SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor
-- This is safe to run multiple times (uses IF NOT EXISTS)

-- Drop existing indexes first to avoid conflicts
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_roles_business_id;

-- =====================================================
-- 1. USER ROLES & PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, business_id)
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  can_view_annual_plan BOOLEAN DEFAULT false,
  can_view_forecast BOOLEAN DEFAULT false,
  can_view_goals BOOLEAN DEFAULT false,
  can_view_documents BOOLEAN DEFAULT false,
  can_view_sessions BOOLEAN DEFAULT false,
  can_view_chat BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  can_edit_annual_plan BOOLEAN DEFAULT false,
  can_edit_forecast BOOLEAN DEFAULT false,
  can_edit_goals BOOLEAN DEFAULT false,
  can_upload_documents BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- =====================================================
-- 2. COACHING SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  agenda JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  transcript_text TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.session_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  action_text TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CHAT & DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  folder TEXT DEFAULT 'root',
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_business_id ON public.user_roles(business_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_business ON public.coaching_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_business ON public.chat_messages(business_id);

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view roles for their businesses" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view coaching sessions" ON public.coaching_sessions;
DROP POLICY IF EXISTS "Users can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages" ON public.chat_messages;

-- Create policies
CREATE POLICY "Users can view roles for their businesses" ON public.user_roles
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM public.user_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view coaching sessions" ON public.coaching_sessions
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM public.user_roles WHERE user_id = auth.uid())
    OR coach_id = auth.uid()
  );

CREATE POLICY "Users can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM public.user_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    business_id IN (SELECT business_id FROM public.user_roles WHERE user_id = auth.uid())
    AND sender_id = auth.uid()
  );

-- =====================================================
-- SUCCESS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Coach Admin Panel schema created successfully';
END $$;
