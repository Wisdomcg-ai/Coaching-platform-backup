-- SIMPLIFIED FIX FOR AUDIT TRIGGER ISSUES
-- Run this in Supabase SQL Editor

-- STEP 1: Drop ALL triggers on forecast_pl_lines
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
        RAISE NOTICE 'Dropped trigger on forecast_pl_lines: %', r.tgname;
    END LOOP;
END $$;

-- STEP 2: Drop ALL triggers on financial_forecasts
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
        RAISE NOTICE 'Dropped trigger on financial_forecasts: %', r.tgname;
    END LOOP;
END $$;

-- STEP 3: Drop ALL triggers on forecast_employees
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
        RAISE NOTICE 'Dropped trigger on forecast_employees: %', r.tgname;
    END LOOP;
END $$;

-- STEP 4: Drop ALL audit functions
DROP FUNCTION IF EXISTS public.audit_forecast_pl_line_changes() CASCADE;
DROP FUNCTION IF EXISTS public.audit_forecast_changes() CASCADE;
DROP FUNCTION IF EXISTS public.audit_financial_forecast_changes() CASCADE;
DROP FUNCTION IF EXISTS public.audit_forecast_employee_changes() CASCADE;

-- STEP 5: Verify all triggers are gone
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relname IN ('forecast_pl_lines', 'financial_forecasts', 'forecast_employees')
    AND t.tgisinternal = false;

    IF trigger_count = 0 THEN
        RAISE NOTICE '✓ SUCCESS: All audit triggers have been removed';
        RAISE NOTICE '✓ Your Xero sync should now work';
        RAISE NOTICE '✓ Restart your dev server to clear cached connections';
    ELSE
        RAISE NOTICE '⚠ WARNING: % triggers still remain', trigger_count;
    END IF;
END $$;
