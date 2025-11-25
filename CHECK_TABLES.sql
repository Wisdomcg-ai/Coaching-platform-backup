-- Check what tables and columns actually exist
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('businesses', 'financial_forecasts', 'strategic_goals', 'business_financial_goals', 'strategic_initiatives', 'annual_plans')
ORDER BY table_name, ordinal_position;
