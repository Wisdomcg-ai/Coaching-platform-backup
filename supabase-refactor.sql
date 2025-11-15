-- ============================================================================
-- SUPABASE DATABASE REFACTOR - OPTION B
-- Normalize business data: businesses (parent) + business_profiles (child)
-- ============================================================================

-- Step 1: Create the critical foreign key column first
-- This is the link between business_profiles (child) and businesses (parent)
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Step 2: Ensure business_profiles has all necessary columns
-- (Most already exist based on schema, but let's add missing ones)

ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS years_in_operation INTEGER;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS contractors_count INTEGER;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS reporting_structure TEXT;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS owner_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS key_roles JSONB DEFAULT '[]'::jsonb;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS top_challenges TEXT[];
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS growth_opportunities TEXT[];
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS current_priorities TEXT[];
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS cash_in_bank NUMERIC;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS gross_profit_margin NUMERIC;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS net_profit_margin NUMERIC;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMPTZ;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS revenue_growth_rate NUMERIC;

-- Step 3: Keep businesses table minimal (already correct in schema)
-- No changes needed - it should only have: id, name, owner_id, created_at, updated_at

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_business_id ON business_profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- Step 5: Add RLS policies for business_profiles if not already present
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can read own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can insert own business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Users can update own business profiles" ON business_profiles;

-- Policy: Users can read their own business profiles
CREATE POLICY "Users can read own business profiles"
ON business_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own business profiles
CREATE POLICY "Users can insert own business profiles"
ON business_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own business profiles
CREATE POLICY "Users can update own business profiles"
ON business_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Step 6: Create helper function to get or create business_profile
CREATE OR REPLACE FUNCTION get_or_create_business_profile(p_user_id UUID, p_business_id UUID)
RETURNS UUID AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Try to find existing profile
  SELECT id INTO v_profile_id
  FROM business_profiles
  WHERE user_id = p_user_id AND business_id = p_business_id;

  -- If not found, create one
  IF v_profile_id IS NULL THEN
    INSERT INTO business_profiles (user_id, business_id, created_at, updated_at)
    VALUES (p_user_id, p_business_id, NOW(), NOW())
    RETURNING id INTO v_profile_id;
  END IF;

  RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add comment for documentation
COMMENT ON TABLE businesses IS 'Lightweight parent table - just business name and owner';
COMMENT ON TABLE business_profiles IS 'Detailed business data - all profile fields, financials, team info';
