'use client'

import { createClient } from '@/lib/supabase/client'
import type {
  FinancialForecast,
  PLLine,
  ForecastEmployee,
  PayrollSummary,
  XeroConnection
} from '../types'

export class ForecastService {
  private static supabase = createClient()

  /**
   * Get or create a forecast for a business
   */
  static async getOrCreateForecast(
    businessId: string,
    userId: string,
    fiscalYear: number
  ): Promise<{ forecast: FinancialForecast | null; error?: string }> {
    try {
      // Try to find existing forecast for this business (any fiscal year)
      // Use limit(1) instead of single() to avoid 406 errors when multiple forecasts exist
      const { data: existing, error: fetchError } = await this.supabase
        .from('financial_forecasts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (existing && existing.length > 0) {
        const forecast = existing[0]
        console.log('[Forecast] Found existing forecast:', forecast.id, 'fiscal_year:', forecast.fiscal_year)

        // If the forecast has wrong fiscal year or dates, update them
        if (forecast.fiscal_year !== fiscalYear ||
            forecast.actual_start_month !== `${fiscalYear - 2}-07` ||
            forecast.forecast_start_month !== `${fiscalYear - 1}-07`) {
          console.log('[Forecast] Updating forecast dates to correct FY')
          const { error: updateError } = await this.supabase
            .from('financial_forecasts')
            .update({
              fiscal_year: fiscalYear,
              name: `FY${fiscalYear} Financial Forecast`,
              actual_start_month: `${fiscalYear - 2}-07`, // Jul 2024 (FY25 actuals)
              actual_end_month: `${fiscalYear - 1}-06`, // Jun 2025 (FY25 actuals)
              forecast_start_month: `${fiscalYear - 1}-07`, // Jul 2025 (FY26 forecast)
              forecast_end_month: `${fiscalYear}-06`, // Jun 2026 (FY26 forecast)
              updated_at: new Date().toISOString()
            })
            .eq('id', forecast.id)

          if (updateError) {
            console.error('[Forecast] Error updating forecast:', updateError)
          } else {
            // Return updated forecast
            forecast.fiscal_year = fiscalYear
            forecast.name = `FY${fiscalYear} Financial Forecast`
            forecast.actual_start_month = `${fiscalYear - 2}-07`
            forecast.actual_end_month = `${fiscalYear - 1}-06`
            forecast.forecast_start_month = `${fiscalYear - 1}-07`
            forecast.forecast_end_month = `${fiscalYear}-06`
          }
        }

        return { forecast }
      }

      // Create new forecast
      // fiscal_year represents the FORECAST year (e.g., 2026 for FY26)
      // Actuals = previous fiscal year (FY25 = Jul 2024 - Jun 2025)
      // Forecast = current fiscal year (FY26 = Jul 2025 - Jun 2026)
      const newForecast: Partial<FinancialForecast> = {
        business_id: businessId,
        user_id: userId,
        name: `FY${fiscalYear} Financial Forecast`,
        fiscal_year: fiscalYear,
        year_type: 'FY',
        actual_start_month: `${fiscalYear - 2}-07`, // Jul 2024 (start of FY25)
        actual_end_month: `${fiscalYear - 1}-06`, // Jun 2025 (end of FY25)
        forecast_start_month: `${fiscalYear - 1}-07`, // Jul 2025 (start of FY26)
        forecast_end_month: `${fiscalYear}-06`, // Jun 2026 (end of FY26)
        is_completed: false
      }

      const { data: created, error: createError } = await this.supabase
        .from('financial_forecasts')
        .insert([newForecast])
        .select()
        .single()

      if (createError) {
        console.error('[Forecast] Error creating forecast:', createError)
        return { forecast: null, error: createError.message }
      }

      console.log('[Forecast] Created new forecast:', created.id)
      return { forecast: created }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return { forecast: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  /**
   * Load P&L lines for a forecast
   */
  static async loadPLLines(forecastId: string): Promise<PLLine[]> {
    try {
      const { data, error } = await this.supabase
        .from('forecast_pl_lines')
        .select('*')
        .eq('forecast_id', forecastId)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('[Forecast] Error loading P&L lines:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return []
    }
  }

  /**
   * Save or update P&L lines
   */
  static async savePLLines(
    forecastId: string,
    lines: PLLine[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete existing lines for this forecast
      await this.supabase
        .from('forecast_pl_lines')
        .delete()
        .eq('forecast_id', forecastId)

      // Insert new lines (remove id field to let database generate new ones)
      const linesToInsert = lines.map((line, index) => {
        const { id, ...lineWithoutId } = line
        return {
          ...lineWithoutId,
          forecast_id: forecastId,
          sort_order: line.sort_order ?? index
        }
      })

      const { error } = await this.supabase
        .from('forecast_pl_lines')
        .insert(linesToInsert)

      if (error) {
        console.error('[Forecast] Error saving P&L lines:', error)
        return { success: false, error: error.message }
      }

      console.log('[Forecast] Saved P&L lines:', lines.length)
      return { success: true }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  /**
   * Load employees for a forecast
   */
  static async loadEmployees(forecastId: string): Promise<ForecastEmployee[]> {
    try {
      const { data, error } = await this.supabase
        .from('forecast_employees')
        .select('*')
        .eq('forecast_id', forecastId)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('[Forecast] Error loading employees:', error)
        return []
      }

      // Convert dates from YYYY-MM-DD back to YYYY-MM format for display
      const employees = (data || []).map(emp => ({
        ...emp,
        start_date: emp.start_date ? emp.start_date.substring(0, 7) : undefined,
        end_date: emp.end_date ? emp.end_date.substring(0, 7) : undefined,
        // Ensure classification is set from category if not already set
        classification: emp.classification || (emp.category === 'Wages COGS' ? 'cogs' : 'opex')
      }))

      return employees
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return []
    }
  }

  /**
   * Save or update employees
   */
  static async saveEmployees(
    forecastId: string,
    employees: ForecastEmployee[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete existing employees for this forecast
      await this.supabase
        .from('forecast_employees')
        .delete()
        .eq('forecast_id', forecastId)

      // Insert new employees (remove id field to let database generate new ones)
      const employeesToInsert = employees.map((emp, index) => {
        const { id, ...empWithoutId } = emp
        return {
          ...empWithoutId,
          forecast_id: forecastId,
          sort_order: emp.sort_order ?? index,
          // Convert YYYY-MM to YYYY-MM-DD format for date fields
          start_date: emp.start_date ? `${emp.start_date}-01` : null,
          end_date: emp.end_date ? `${emp.end_date}-01` : null,
          // Map new classification field to old category field for backwards compatibility
          category: emp.classification === 'cogs' ? 'Wages COGS' : 'Wages Admin'
        }
      })

      const { error } = await this.supabase
        .from('forecast_employees')
        .insert(employeesToInsert)

      if (error) {
        console.error('[Forecast] Error saving employees:', error)
        return { success: false, error: error.message }
      }

      console.log('[Forecast] Saved employees:', employees.length)
      return { success: true }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  /**
   * Load payroll summary for a forecast
   */
  static async loadPayrollSummary(forecastId: string): Promise<PayrollSummary | null> {
    try {
      const { data, error } = await this.supabase
        .from('forecast_payroll_summary')
        .select('*')
        .eq('forecast_id', forecastId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[Forecast] Error loading payroll summary:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return null
    }
  }

  /**
   * Save or update payroll summary
   */
  static async savePayrollSummary(
    forecastId: string,
    summary: PayrollSummary
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('forecast_payroll_summary')
        .upsert({
          ...summary,
          forecast_id: forecastId
        })

      if (error) {
        console.error('[Forecast] Error saving payroll summary:', error)
        return { success: false, error: error.message }
      }

      console.log('[Forecast] Saved payroll summary')
      return { success: true }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  /**
   * Get Xero connection for a business
   */
  static async getXeroConnection(businessId: string): Promise<XeroConnection | null> {
    try {
      const { data, error } = await this.supabase
        .from('xero_connections')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[Forecast] Error loading Xero connection:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('[Forecast] Error:', err)
      return null
    }
  }

  /**
   * Generate month columns for the forecast table
   */
  static generateMonthColumns(
    actualStartMonth: string,
    actualEndMonth: string,
    forecastStartMonth: string,
    forecastEndMonth: string
  ) {
    const columns: Array<{
      key: string
      label: string
      isActual: boolean
      isForecast: boolean
    }> = []

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Generate actual months
    let currentDate = new Date(actualStartMonth + '-01')
    const actualEnd = new Date(actualEndMonth + '-01')

    while (currentDate <= actualEnd) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const yearShort = year.toString().slice(-2)

      columns.push({
        key: `${year}-${(month + 1).toString().padStart(2, '0')}`,
        label: `${monthNames[month]} ${yearShort}`,
        isActual: true,
        isForecast: false
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Generate forecast months
    currentDate = new Date(forecastStartMonth + '-01')
    const forecastEnd = new Date(forecastEndMonth + '-01')

    while (currentDate <= forecastEnd) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const yearShort = year.toString().slice(-2)

      columns.push({
        key: `${year}-${(month + 1).toString().padStart(2, '0')}`,
        label: `${monthNames[month]} ${yearShort}`,
        isActual: false,
        isForecast: true
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return columns
  }
}

export default ForecastService
