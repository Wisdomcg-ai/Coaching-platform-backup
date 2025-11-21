// Financial Forecast Types

export interface ForecastEmployee {
  id?: string
  forecast_id?: string
  employee_name: string
  position?: string
  category: 'Wages Admin' | 'Wages COGS' | 'Contractor' | 'Other'
  start_date?: string
  end_date?: string
  hours?: number
  rate?: number
  weekly_budget?: number
  annual_salary?: number
  weekly_payg?: number
  super_rate?: number
  sort_order?: number
  is_active?: boolean
}

export type ForecastMethod =
  | 'none'             // Zero out - don't forecast this line
  | 'straight_line'    // Same amount each month (Even Split)
  | 'growth_rate'      // % increase month-over-month or year-over-year
  | 'seasonal_pattern' // Repeat historical pattern (Match FY25 Pattern)
  | 'driver_based'     // Linked to another metric (e.g., % of revenue)
  | 'manual'           // Custom per month

export interface ForecastMethodConfig {
  method: ForecastMethod
  // Parameters vary by method
  percentage_increase?: number  // % increase to apply to base (e.g., 0.05 = 5% increase)
  growth_rate?: number          // For growth_rate method (e.g., 0.05 = 5%)
  growth_type?: 'MoM' | 'YoY'   // Month-over-month or Year-over-year
  driver_line_id?: string       // For driver_based method - which line to link to
  driver_percentage?: number    // For driver_based method (e.g., 0.25 = 25% of revenue)
  base_amount?: number          // For straight_line method
}

export interface LineAnalysis {
  // Revenue analysis
  pct_of_total_revenue?: number     // % of total revenue
  fy_average_per_month?: number     // FY25 total ÷ 12
  yoy_growth_rate?: number          // Year-over-year growth

  // COGS analysis
  pct_of_revenue?: number           // COGS as % of revenue (gross margin)

  // OpEx analysis
  trend_direction?: 'up' | 'down' | 'stable'
  trend_percentage?: number
}

export interface PLLine {
  id?: string
  forecast_id?: string
  account_code?: string
  account_name: string
  account_type?: string
  account_class?: string
  category?: string
  subcategory?: string
  sort_order?: number
  actual_months: { [key: string]: number } // e.g., { "2024-07": 10000, "2024-08": 12000 }
  forecast_months: { [key: string]: number }
  is_from_xero?: boolean
  is_manual?: boolean
  notes?: string

  // Forecasting configuration
  forecast_method?: ForecastMethodConfig
  analysis?: LineAnalysis
}

export interface PayrollSummary {
  id?: string
  forecast_id?: string
  pay_runs_per_month: { [key: string]: number }
  wages_admin_monthly: { [key: string]: number }
  wages_cogs_monthly: { [key: string]: number }
  payg_monthly: { [key: string]: number }
  net_wages_monthly: { [key: string]: number }
  superannuation_monthly: { [key: string]: number }
  payroll_tax_monthly: { [key: string]: number }
}

export type DistributionMethod = 'even' | 'linear' | 'seasonal_pattern' | 'custom'

export interface CategoryAssumptions {
  [category: string]: {
    method: ForecastMethod
    config: ForecastMethodConfig
  }
}

export type Currency = 'AUD' | 'USD' | 'NZD' | 'GBP' | 'EUR'

export interface FinancialForecast {
  id?: string
  business_id: string
  user_id: string
  name: string
  description?: string
  fiscal_year: number
  year_type: 'CY' | 'FY'
  actual_start_month: string // e.g., "2024-07"
  actual_end_month: string
  forecast_start_month: string
  forecast_end_month: string
  is_completed?: boolean
  completed_at?: string
  last_xero_sync_at?: string
  xero_connection_id?: string
  created_at?: string
  updated_at?: string
  currency?: Currency // Default: AUD

  // Goal-driven forecasting fields
  revenue_goal?: number
  gross_profit_goal?: number
  net_profit_goal?: number
  goal_source?: 'annual_plan' | 'manual'
  annual_plan_id?: string
  revenue_distribution_method?: DistributionMethod
  revenue_distribution_data?: { [monthKey: string]: number }
  category_assumptions?: CategoryAssumptions

  // Cost assumptions
  cogs_percentage?: number // e.g., 0.40 = 40% COGS
  opex_wages?: number // Annual wages from payroll
  opex_fixed?: number // Annual fixed costs
  opex_variable?: number // Annual variable costs
  opex_variable_percentage?: number // e.g., 0.05 = 5% of revenue
  opex_other?: number // Annual other/seasonal costs
}

export interface XeroConnection {
  id: string
  business_id: string
  user_id: string
  tenant_id: string
  tenant_name?: string
  is_active: boolean
  last_synced_at?: string
  created_at?: string
}

// Helper types for UI
export interface MonthColumn {
  key: string // e.g., "2024-07"
  label: string // e.g., "Jul 24"
  isActual: boolean
  isForecast: boolean
}

export const EMPLOYEE_CATEGORIES = [
  'Wages Admin',
  'Wages COGS',
  'Contractor',
  'Other'
] as const

export const PL_CATEGORIES = [
  'Revenue',
  'Cost of Sales',
  'Operating Expenses',
  'Other Income',
  'Other Expenses'
] as const
