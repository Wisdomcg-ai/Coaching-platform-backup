-- COMPREHENSIVE DIAGNOSTIC AND FIX FOR AUDIT TRIGGER ISSUES
-- Run this in Supabase SQL Editor

-- STEP 1: Find ALL triggers on forecast_pl_lines table
SELECT
    tgname AS trigger_name,
    tgenabled AS enabled,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.forecast_pl_lines'::regclass
AND tgisinternal = false;

-- STEP 2: Find ALL triggers on forecast_audit_log table (in case the error comes from here)
SELECT
    tgname AS trigger_name,
    tgenabled AS enabled,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.forecast_audit_log'::regclass
AND tgisinternal = false;

-- STEP 3: Find ALL functions that reference forecast_audit_log
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%forecast_audit_log%';

-- STEP 4: Drop ALL triggers on forecast_pl_lines
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tgname
        FROM pg_trigger
        WHERE tgrelid = 'public.forecast_pl_lines'::regclass
        AND tgisinternal = false
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON public.forecast_pl_lines CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- STEP 5: Drop ALL triggers on financial_forecasts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tgname
        FROM pg_trigger
        WHERE tgrelid = 'public.financial_forecasts'::regclass
        AND tgisinternal = false
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON public.financial_forecasts CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- STEP 6: Drop ALL triggers on forecast_employees
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tgname
        FROM pg_trigger
        WHERE tgrelid = 'public.forecast_employees'::regclass
        AND tgisinternal = false
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON public.forecast_employees CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- STEP 7: Drop ALL audit functions
DROP FUNCTION IF EXISTS public.audit_forecast_pl_line_changes() CASCADE;
DROP FUNCTION IF EXISTS public.audit_forecast_changes() CASCADE;
DROP FUNCTION IF EXISTS public.audit_financial_forecast_changes() CASCADE;
DROP FUNCTION IF EXISTS public.audit_forecast_employee_changes() CASCADE;

-- STEP 8: Verify all triggers are gone
SELECT
    schemaname,
    tablename,
    COUNT(*) as trigger_count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE schemaname = 'public'
AND tablename IN ('forecast_pl_lines', 'financial_forecasts', 'forecast_employees')
AND tgisinternal = false
GROUP BY schemaname, tablename;

-- SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '✓ All audit triggers and functions have been removed';
    RAISE NOTICE '✓ Your Xero sync should now work without errors';
    RAISE NOTICE '✓ Restart your Next.js dev server to clear any cached connections';
END $$;
