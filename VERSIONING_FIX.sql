-- Quick fix for forecast versioning RLS policy
-- Run this in Supabase SQL Editor if you're getting 401 errors on version fetching

-- Step 1: Drop ALL existing SELECT policies to avoid conflicts
DO $$
BEGIN
  -- Drop all SELECT policies on financial_forecasts
  DROP POLICY IF EXISTS "Users can view their own forecasts" ON public.financial_forecasts;
  DROP POLICY IF EXISTS "Users can view forecasts" ON public.financial_forecasts;
  DROP POLICY IF EXISTS "Users can view their forecasts" ON public.financial_forecasts;
  DROP POLICY IF EXISTS "Users can view all business forecasts" ON public.financial_forecasts;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.financial_forecasts;
END $$;

-- Step 2: Create a single comprehensive read policy
CREATE POLICY "forecast_select_policy" ON public.financial_forecasts
  FOR SELECT
  USING (
    -- Allow users to see all forecasts for businesses they have access to
    business_id IN (
      SELECT DISTINCT business_id
      FROM public.financial_forecasts
      WHERE user_id = auth.uid()
    )
  );
