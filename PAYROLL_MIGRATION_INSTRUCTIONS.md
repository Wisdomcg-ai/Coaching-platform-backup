# Payroll Enhancement Migration Instructions

## Database Migration Required

The enhanced payroll functionality requires new database columns. Please run the following SQL in your Supabase SQL Editor:

### 1. Navigate to Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### 2. Copy and run this SQL:

```sql
-- Add payroll settings to financial_forecasts table
ALTER TABLE financial_forecasts
ADD COLUMN IF NOT EXISTS payroll_frequency TEXT DEFAULT 'fortnightly' CHECK (payroll_frequency IN ('weekly', 'fortnightly', 'monthly')),
ADD COLUMN IF NOT EXISTS pay_day TEXT CHECK (pay_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
ADD COLUMN IF NOT EXISTS superannuation_rate DECIMAL(5,4) DEFAULT 0.12,
ADD COLUMN IF NOT EXISTS wages_opex_pl_line_id UUID REFERENCES forecast_pl_lines(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS wages_cogs_pl_line_id UUID REFERENCES forecast_pl_lines(id) ON DELETE SET NULL;

-- Add new employee fields to forecast_employees table
ALTER TABLE forecast_employees
ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'opex' CHECK (classification IN ('opex', 'cogs')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS standard_hours_per_week DECIMAL(5,2) DEFAULT 38,
ADD COLUMN IF NOT EXISTS pay_per_period DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS super_per_period DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payg_per_period DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(10,2);

-- Add payroll tracking to P&L lines
ALTER TABLE forecast_pl_lines
ADD COLUMN IF NOT EXISTS is_from_payroll BOOLEAN DEFAULT false;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forecast_employees_classification ON forecast_employees(classification);
CREATE INDEX IF NOT EXISTS idx_forecast_employees_dates ON forecast_employees(start_date, end_date);

-- Update existing employees to have default classification based on category
UPDATE forecast_employees
SET classification = CASE
  WHEN category = 'Wages COGS' THEN 'cogs'
  ELSE 'opex'
END
WHERE classification IS NULL;
```

### 3. Click "Run" to execute the migration

## What's New in Payroll

### Enhanced Payroll Settings
- **Payroll Frequency**: Choose between Weekly, Fortnightly, or Monthly
- **Pay Day**: Select which day of the week employees are paid (for weekly/fortnightly)
- **Superannuation Rate**: Customize super rate (defaults to 12%)

### Smart Employee Management
- **Bidirectional Salary Calculator**: Enter annual salary OR hourly rate, and the other calculates automatically
- **Simple Classification**: Employees are either OpEx or COGS (no complex percentage splits)
- **Start/End Date Support**: Employees are automatically prorated based on their employment period
- **PAYG Calculation**: Australian tax calculated automatically (stored for future cashflow features)

### Improved UI/UX
- Professional gradient design for payroll settings
- Custom-styled dropdowns with better visual feedback
- Currency formatting with $ symbol
- Color-coded sections (Employee Info, Salary Details, Calculated fields)
- Clearer visual hierarchy

### Payroll to P&L Mapping
- **Map to Existing Lines**: Select existing P&L lines to sync payroll totals to
- **Create New Lines**: Create dedicated "Salaries & Wages" lines for OpEx and COGS
- **Auto-Sync**: Payroll totals automatically update mapped P&L lines
- **Visual Indicators**: See which lines are from Payroll, Xero, or Manual

### P&L Forecast Management
- **Add Rows**: Click "Add Row" button on any category to add custom P&L lines
- **Delete Rows**: Delete any row (Manual, Xero, or Payroll) with appropriate warnings
- **Smart Confirmations**: Different warnings based on line source (prevents accidental deletion)

### Forecast Integration
- Automatic monthly calculations including superannuation
- Proration for partial months of employment
- Separate tracking for OpEx vs COGS wages

## After Running Migration

1. Refresh your browser
2. Navigate to Finances > Forecast > Payroll tab
3. Configure your payroll settings
4. Add or edit employees
5. Watch the magic happen! 🎉

## Support

If you encounter any issues:
1. Check that all SQL commands executed successfully
2. Verify the new columns exist in both tables
3. Try refreshing your browser cache
4. Check the browser console for any errors
