'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, TrendingUp, Users, Download, Upload, Link as LinkIcon, Settings, X, Lightbulb } from 'lucide-react'
import ForecastService from './services/forecast-service'
import { ForecastGenerator } from './services/forecast-generator'
import { ForecastingEngine } from './services/forecasting-engine'
import type { FinancialForecast, PLLine, ForecastEmployee, XeroConnection, DistributionMethod, ForecastMethod, ForecastScenario, WhatIfParameters } from './types'
import PLForecastTable from './components/PLForecastTable'
import PayrollTable from './components/PayrollTable'
import AssumptionsTab from './components/AssumptionsTab'
import CompletenessChecker from './components/CompletenessChecker'
import AuditLogViewer from './components/AuditLogViewer'
import WhatIfAnalysisModal from './components/WhatIfAnalysisModal'
import ScenarioSelector from './components/ScenarioSelector'
import ExportControls from './components/ExportControls'
import { LoadingState } from './components/LoadingState'
import ErrorState from './components/ErrorState'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function FinancialForecastPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [businessId, setBusinessId] = useState('')
  const [userId, setUserId] = useState('')

  const [forecast, setForecast] = useState<FinancialForecast | null>(null)
  const [plLines, setPlLines] = useState<PLLine[]>([])
  const [employees, setEmployees] = useState<ForecastEmployee[]>([])
  const [xeroConnection, setXeroConnection] = useState<XeroConnection | null>(null)

  const [activeTab, setActiveTab] = useState<'assumptions' | 'pl' | 'payroll' | 'history'>('assumptions')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // Scenario planning state
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([])
  const [activeScenario, setActiveScenario] = useState<ForecastScenario | null>(null)
  const [showWhatIfModal, setShowWhatIfModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadInitialData()
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      meta: true,
      description: 'Save forecast',
      callback: (e) => {
        e.preventDefault()
        // Trigger save based on current tab
        if (activeTab === 'pl' && plLines.length > 0) {
          handleSavePLLines(plLines)
        }
      }
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      callback: () => {
        setShowKeyboardHelp(true)
      }
    }
  ])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('[Forecast] No user logged in')
        setIsLoading(false)
        return
      }

      const uid = user.id
      setUserId(uid)

      // Get business profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const bizId = profile?.id || user.id
      setBusinessId(bizId)

      console.log(`[Forecast] Loading data for business: ${bizId}`)

      // Get or create forecast for current fiscal year
      const currentYear = new Date().getFullYear()
      const fiscalYear = new Date().getMonth() >= 6 ? currentYear + 1 : currentYear

      const { forecast: loadedForecast, error: forecastError } =
        await ForecastService.getOrCreateForecast(bizId, uid, fiscalYear)

      if (forecastError || !loadedForecast) {
        console.error('[Forecast] Error loading forecast:', forecastError)
        setIsLoading(false)
        return
      }

      console.log('[Forecast Page] Forecast dates:', {
        actual_start: loadedForecast.actual_start_month,
        actual_end: loadedForecast.actual_end_month,
        forecast_start: loadedForecast.forecast_start_month,
        forecast_end: loadedForecast.forecast_end_month
      })
      setForecast(loadedForecast)

      // Load P&L lines
      const lines = await ForecastService.loadPLLines(loadedForecast.id!)
      console.log('[Forecast Page] Loaded P&L lines:', lines.length)
      if (lines.length > 0) {
        console.log('[Forecast Page] Sample line:', {
          name: lines[0].account_name,
          actual_months: lines[0].actual_months,
          monthKeys: Object.keys(lines[0].actual_months || {})
        })
      }
      setPlLines(lines)

      // Load employees
      const emps = await ForecastService.loadEmployees(loadedForecast.id!)
      setEmployees(emps)

      // Load Xero connection
      const xeroConn = await ForecastService.getXeroConnection(bizId)
      setXeroConnection(xeroConn)

      setIsLoading(false)

      // Load scenarios if we have a forecast (run after loading to not block UI)
      if (loadedForecast?.id) {
        loadScenarios(loadedForecast.id).catch(console.error)
      }
    } catch (err) {
      console.error('[Forecast] Error in loadInitialData:', err)
      setError(err instanceof Error ? err.message : 'Failed to load forecast data')
      setIsLoading(false)
    }
  }

  // Scenario management functions
  const loadScenarios = async (forecastId: string) => {
    try {
      const response = await fetch(`/api/forecasts/scenarios?forecast_id=${forecastId}`, {
        credentials: 'include'
      })
      if (!response.ok) {
        // Scenarios are optional - just log and continue
        console.log('Scenarios not available (this is fine - feature is optional)')
        return
      }
      const data = await response.json()
      setScenarios(data.scenarios || [])

      // Set active scenario if one exists
      const active = data.scenarios?.find((s: ForecastScenario) => s.is_active)
      if (active) {
        setActiveScenario(active)
      } else if (data.scenarios?.length > 0) {
        // Default to first scenario if none is active
        setActiveScenario(data.scenarios[0])
      }
    } catch (error) {
      // Scenarios are optional - just log and continue
      console.log('Scenarios feature not available:', error)
    }
  }

  const handleCreateScenario = async () => {
    if (!forecast?.id) return

    const scenarioName = prompt('Enter a name for the new scenario:', 'New Scenario')
    if (!scenarioName) return

    try {
      const response = await fetch('/api/forecasts/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast_id: forecast.id,
          name: scenarioName,
          description: '',
          scenario_type: 'planning'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create scenario')
      }

      const data = await response.json()
      setScenarios([...scenarios, data.scenario])
      alert(`Scenario "${scenarioName}" created successfully!`)
    } catch (error) {
      console.error('Error creating scenario:', error)
      alert('Failed to create scenario. Please try again.')
    }
  }

  const handleSelectScenario = async (scenario: ForecastScenario) => {
    setActiveScenario(scenario)

    // Optionally set as active scenario in database
    try {
      await fetch('/api/forecasts/scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenario.id,
          is_active: true
        })
      })
    } catch (error) {
      console.error('Error updating active scenario:', error)
    }
  }

  const handleDuplicateScenario = async (scenario: ForecastScenario) => {
    if (!forecast?.id) return

    const newName = prompt('Enter a name for the duplicated scenario:', `${scenario.name} (Copy)`)
    if (!newName) return

    try {
      const response = await fetch('/api/forecasts/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast_id: forecast.id,
          name: newName,
          description: scenario.description,
          revenue_multiplier: scenario.revenue_multiplier,
          cogs_multiplier: scenario.cogs_multiplier,
          opex_multiplier: scenario.opex_multiplier,
          scenario_type: 'planning'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate scenario')
      }

      const data = await response.json()
      setScenarios([...scenarios, data.scenario])
      alert(`Scenario duplicated as "${newName}"`)
    } catch (error) {
      console.error('Error duplicating scenario:', error)
      alert('Failed to duplicate scenario')
    }
  }

  const handleDeleteScenario = async (scenario: ForecastScenario) => {
    try {
      const response = await fetch(`/api/forecasts/scenarios?scenario_id=${scenario.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete scenario')
      }

      setScenarios(scenarios.filter(s => s.id !== scenario.id))
      if (activeScenario?.id === scenario.id) {
        const remaining = scenarios.filter(s => s.id !== scenario.id)
        setActiveScenario(remaining[0] || null)
      }
      alert(`Scenario "${scenario.name}" deleted`)
    } catch (error) {
      console.error('Error deleting scenario:', error)
      alert('Failed to delete scenario')
    }
  }

  const handleArchiveScenario = async (scenario: ForecastScenario) => {
    try {
      await fetch('/api/forecasts/scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenario.id,
          scenario_type: 'archived'
        })
      })

      // Reload scenarios
      if (forecast?.id) {
        await loadScenarios(forecast.id)
      }
      alert(`Scenario "${scenario.name}" archived`)
    } catch (error) {
      console.error('Error archiving scenario:', error)
      alert('Failed to archive scenario')
    }
  }

  const handleSaveWhatIfScenario = async (scenarioName: string, parameters: WhatIfParameters) => {
    if (!forecast?.id) return

    try {
      const response = await fetch('/api/forecasts/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast_id: forecast.id,
          name: scenarioName,
          description: `Revenue ${parameters.revenueChange > 0 ? '+' : ''}${parameters.revenueChange}%, COGS ${parameters.cogsChange > 0 ? '+' : ''}${parameters.cogsChange}pp, OpEx ${parameters.opexChange > 0 ? '+' : ''}${parameters.opexChange}%`,
          revenue_multiplier: 1 + (parameters.revenueChange / 100),
          cogs_multiplier: 1 + (parameters.cogsChange / 100), // Approximation
          opex_multiplier: 1 + (parameters.opexChange / 100),
          scenario_type: 'planning'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save scenario')
      }

      const data = await response.json()
      setScenarios([...scenarios, data.scenario])
      alert(`Scenario "${scenarioName}" saved successfully!`)
    } catch (error) {
      console.error('Error saving what-if scenario:', error)
      alert('Failed to save scenario')
    }
  }

  // Calculate baseline totals for What-If analysis
  const calculateBaselineTotals = () => {
    let totalRevenue = 0
    let totalCOGS = 0
    let totalOpEx = 0

    plLines.forEach(line => {
      const forecastTotal = Object.values(line.forecast_months || {}).reduce((sum, val) => sum + (val || 0), 0)

      if (line.category === 'Revenue') {
        totalRevenue += forecastTotal
      } else if (line.category === 'Cost of Sales') {
        totalCOGS += forecastTotal
      } else if (line.category === 'Operating Expenses') {
        totalOpEx += forecastTotal
      }
    })

    return { totalRevenue, totalCOGS, totalOpEx }
  }

  const handleSavePLLines = async (updatedLines: PLLine[]) => {
    if (!forecast?.id) return

    try {
      setIsSaving(true)
      setError(null)
      const result = await ForecastService.savePLLines(forecast.id, updatedLines)

      if (result.success) {
        setPlLines(updatedLines)
        console.log('[Forecast] P&L lines saved')
      } else {
        throw new Error(result.error || 'Failed to save P&L lines')
      }
    } catch (err) {
      console.error('[Forecast] Error saving P&L lines:', err)
      setError(err instanceof Error ? err.message : 'Failed to save P&L lines')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEmployees = async (updatedEmployees: ForecastEmployee[]) => {
    if (!forecast?.id) return

    setIsSaving(true)
    const result = await ForecastService.saveEmployees(forecast.id, updatedEmployees)
    setIsSaving(false)

    if (result.success) {
      setEmployees(updatedEmployees)
      console.log('[Forecast] Employees saved')
    } else {
      console.error('[Forecast] Error saving employees:', result.error)
      alert('Error saving employees: ' + result.error)
    }
  }

  const handleBulkOpExIncrease = async (percentageIncrease: number) => {
    if (!forecast?.id) return

    // Update all Operating Expenses lines with seasonal_pattern and the specified increase
    const updatedLines = plLines.map(line => {
      // Only apply to Operating Expenses lines
      if (line.category !== 'Operating Expenses') {
        return line
      }

      // Set to seasonal_pattern with the specified percentage increase
      return {
        ...line,
        forecast_method: {
          method: 'seasonal_pattern' as ForecastMethod,
          percentage_increase: percentageIncrease / 100, // Convert from 5 to 0.05
          base_amount: line.analysis?.fy_average_per_month || 0
        }
      }
    })

    // Recalculate forecasts
    const columns = ForecastService.generateMonthColumns(
      forecast.actual_start_month,
      forecast.actual_end_month,
      forecast.forecast_start_month,
      forecast.forecast_end_month
    )
    const actualMonthKeys = columns.filter(c => c.isActual).map(c => c.key)
    const forecastMonthKeys = columns.filter(c => c.isForecast).map(c => c.key)

    const recalculatedLines = ForecastingEngine.recalculateAllForecasts(
      updatedLines,
      actualMonthKeys,
      forecastMonthKeys
    )

    // Save and update state
    await handleSavePLLines(recalculatedLines)

    // Switch to P&L tab to show changes
    setActiveTab('pl')
  }

  const handleConnectXero = () => {
    // Redirect to Xero auth page
    window.location.href = '/xero-connect'
  }

  const handleDisconnectAndClearAll = async () => {
    if (!confirm('⚠️ WARNING: This will permanently disconnect Xero and delete ALL forecast data (P&L lines, employees, forecasts). This cannot be undone. Continue?')) {
      return
    }

    if (!confirm('Are you absolutely sure? This will remove all sensitive data and you\'ll start fresh.')) {
      return
    }

    setIsSaving(true)
    try {
      // 1. Delete all P&L lines for this business
      if (forecast?.id) {
        await supabase
          .from('forecast_pl_lines')
          .delete()
          .eq('forecast_id', forecast.id)
      }

      // 2. Delete all employees for this business
      if (forecast?.id) {
        await supabase
          .from('forecast_employees')
          .delete()
          .eq('forecast_id', forecast.id)
      }

      // 3. Delete all forecasts for this business
      await supabase
        .from('financial_forecasts')
        .delete()
        .eq('business_id', businessId)

      // 4. Disconnect Xero
      await supabase
        .from('xero_connections')
        .delete()
        .eq('business_id', businessId)

      // 5. Clear all state
      setForecast(null)
      setPlLines([])
      setEmployees([])
      setXeroConnection(null)

      alert('✅ Successfully disconnected Xero and cleared all data. The page will reload.')

      // Reload the page to start fresh
      window.location.reload()
    } catch (err) {
      console.error('[Forecast] Error disconnecting and clearing:', err)
      alert('Error disconnecting and clearing data: ' + err)
    }
    setIsSaving(false)
  }

  const handleClearAndResync = async () => {
    if (!forecast?.id || !xeroConnection) return

    if (!confirm('This will delete all existing P&L data and resync from Xero. Continue?')) {
      return
    }

    setIsSaving(true)
    try {
      // Delete all existing Xero lines
      await supabase
        .from('forecast_pl_lines')
        .delete()
        .eq('forecast_id', forecast.id)
        .eq('is_from_xero', true)

      // Clear the state
      setPlLines([])

      // Wait a moment for the delete to process
      await new Promise(resolve => setTimeout(resolve, 500))

      // Now sync from Xero
      const response = await fetch('/api/Xero/sync-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast_id: forecast.id,
          business_id: businessId
        })
      })

      const result = await response.json()

      if (result.success) {
        // Reload P&L lines
        const lines = await ForecastService.loadPLLines(forecast.id)
        setPlLines(lines)
        alert('Successfully cleared and resynced data from Xero!')
      } else {
        alert('Error syncing from Xero: ' + result.error)
      }
    } catch (err) {
      console.error('[Forecast] Error clearing and resyncing:', err)
      alert('Error clearing and resyncing')
    }
    setIsSaving(false)
  }

  const handleSyncFromXero = async () => {
    if (!forecast?.id || !xeroConnection) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/Xero/sync-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast_id: forecast.id,
          business_id: businessId
        })
      })

      const result = await response.json()

      if (result.success) {
        // Reload P&L lines
        const lines = await ForecastService.loadPLLines(forecast.id)
        setPlLines(lines)
        alert('Successfully synced data from Xero!')
      } else {
        alert('Error syncing from Xero: ' + result.error)
      }
    } catch (err) {
      console.error('[Forecast] Error syncing from Xero:', err)
      alert('Error syncing from Xero')
    }
    setIsSaving(false)
  }

  // Calculate current forecast totals for Goals Panel
  const currentForecastTotals = useMemo(() => {
    const revenue = plLines
      .filter(l => l.category === 'Revenue')
      .reduce((sum, line) => sum + Object.values(line.forecast_months || {}).reduce((s, v) => s + v, 0), 0)

    const cogs = plLines
      .filter(l => l.category === 'Cost of Sales')
      .reduce((sum, line) => sum + Object.values(line.forecast_months || {}).reduce((s, v) => s + v, 0), 0)

    const opex = plLines
      .filter(l => l.category === 'Operating Expenses')
      .reduce((sum, line) => sum + Object.values(line.forecast_months || {}).reduce((s, v) => s + v, 0), 0)

    const otherIncome = plLines
      .filter(l => l.category === 'Other Income')
      .reduce((sum, line) => sum + Object.values(line.forecast_months || {}).reduce((s, v) => s + v, 0), 0)

    const otherExpenses = plLines
      .filter(l => l.category === 'Other Expenses')
      .reduce((sum, line) => sum + Object.values(line.forecast_months || {}).reduce((s, v) => s + v, 0), 0)

    const grossProfit = revenue - cogs
    const netProfit = revenue - cogs - opex + otherIncome - otherExpenses

    return { revenue, grossProfit, netProfit }
  }, [plLines])

  const handleUpdateGoals = async (goals: {
    revenue_goal?: number
    gross_profit_goal?: number
    net_profit_goal?: number
  }) => {
    if (!forecast?.id) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('financial_forecasts')
        .update({
          revenue_goal: goals.revenue_goal,
          gross_profit_goal: goals.gross_profit_goal,
          net_profit_goal: goals.net_profit_goal,
          goal_source: 'manual',
          updated_at: new Date().toISOString()
        })
        .eq('id', forecast.id)

      if (error) {
        console.error('[Forecast] Error updating goals:', error)
        alert('Error saving goals: ' + error.message)
      } else {
        // Update local state
        setForecast({
          ...forecast,
          revenue_goal: goals.revenue_goal,
          gross_profit_goal: goals.gross_profit_goal,
          net_profit_goal: goals.net_profit_goal,
          goal_source: 'manual'
        })
        console.log('[Forecast] Goals updated successfully')
      }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      alert('Error saving goals')
    }
    setIsSaving(false)
  }

  const handleImportGoalsFromAnnualPlan = async () => {
    if (!businessId || !forecast?.id) return

    setIsSaving(true)
    try {
      // Fetch annual plan data from API
      const response = await fetch('/api/annual-plan')
      if (!response.ok) {
        throw new Error('Failed to fetch annual plan data')
      }

      const annualPlanData = await response.json()

      // Check if we have data to import
      if (!annualPlanData.revenue_target && !annualPlanData.profit_target) {
        alert(
          'No annual plan targets found. Please complete your business assessment first to set 12-month targets, or enter goals manually.'
        )
        setIsSaving(false)
        return
      }

      // Show confirmation dialog with what will be imported
      const confirmMessage = `Import the following from your Annual Plan?\n\n` +
        `Revenue Target: ${annualPlanData.revenue_target ? `$${annualPlanData.revenue_target.toLocaleString()}` : 'Not set'}\n` +
        `Profit Target: ${annualPlanData.profit_target ? `$${annualPlanData.profit_target.toLocaleString()}` : 'Not set'}\n` +
        `Source: ${annualPlanData.source === 'assessment' ? 'Business Assessment' : 'Strategic Plan'}\n` +
        (annualPlanData.assessment_date ? `Date: ${new Date(annualPlanData.assessment_date).toLocaleDateString()}` : '') +
        `\n\nThis will update your current forecast goals.`

      if (!confirm(confirmMessage)) {
        setIsSaving(false)
        return
      }

      // Calculate gross profit from net profit (assuming standard 60% GP ratio if not specified)
      const revenueGoal = annualPlanData.revenue_target || forecast.revenue_goal || 0
      const netProfitGoal = annualPlanData.profit_target || 0

      // Estimate gross profit as 60% of revenue if we have revenue but no GP
      const estimatedGrossProfit = revenueGoal * 0.6

      // Update forecast with imported goals
      const { error } = await supabase
        .from('financial_forecasts')
        .update({
          revenue_goal: revenueGoal,
          gross_profit_goal: estimatedGrossProfit,
          net_profit_goal: netProfitGoal,
          goal_source: annualPlanData.source === 'assessment' ? 'annual_plan' : 'manual',
          annual_plan_id: annualPlanData.strategic_plan_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', forecast.id)

      if (error) {
        console.error('[Forecast] Error importing goals:', error)
        alert('Error importing goals: ' + error.message)
      } else {
        // Update local state
        setForecast({
          ...forecast,
          revenue_goal: revenueGoal,
          gross_profit_goal: estimatedGrossProfit,
          net_profit_goal: netProfitGoal,
          goal_source: annualPlanData.source === 'assessment' ? 'annual_plan' : 'manual',
          annual_plan_id: annualPlanData.strategic_plan_id
        })

        alert(
          `Successfully imported goals from your ${annualPlanData.source === 'assessment' ? 'assessment' : 'strategic plan'}!\n\n` +
          `Revenue: $${revenueGoal.toLocaleString()}\n` +
          `Estimated Gross Profit: $${estimatedGrossProfit.toLocaleString()}\n` +
          `Net Profit: $${netProfitGoal.toLocaleString()}\n\n` +
          `You can now adjust these and set your COGS percentage.`
        )

        console.log('[Forecast] Goals imported successfully from annual plan')
      }
    } catch (err) {
      console.error('[Forecast] Error importing goals:', err)
      alert('Error importing goals from Annual Plan. Please try again or enter goals manually.')
    }
    setIsSaving(false)
  }

  const handleUpdateDistribution = async (data: {
    revenue_distribution_method: DistributionMethod
    revenue_distribution_data: { [monthKey: string]: number }
  }) => {
    if (!forecast?.id) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('financial_forecasts')
        .update({
          revenue_distribution_method: data.revenue_distribution_method,
          revenue_distribution_data: data.revenue_distribution_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', forecast.id)

      if (error) {
        console.error('[Forecast] Error updating distribution:', error)
        alert('Error saving distribution: ' + error.message)
      } else {
        // Update local state
        setForecast({
          ...forecast,
          revenue_distribution_method: data.revenue_distribution_method,
          revenue_distribution_data: data.revenue_distribution_data
        })
        console.log('[Forecast] Distribution updated successfully')
      }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      alert('Error saving distribution')
    }
    setIsSaving(false)
  }

  const handleSaveAssumptions = async (data: {
    revenue_goal: number
    gross_profit_goal: number
    net_profit_goal: number
    revenue_distribution_method: DistributionMethod
    cogs_percentage: number
  }) => {
    if (!forecast?.id) return

    setIsSaving(true)
    try {
      // 1. Save assumptions to database
      const { error: saveError } = await supabase
        .from('financial_forecasts')
        .update({
          revenue_goal: data.revenue_goal,
          gross_profit_goal: data.gross_profit_goal,
          net_profit_goal: data.net_profit_goal,
          revenue_distribution_method: data.revenue_distribution_method,
          cogs_percentage: data.cogs_percentage,
          goal_source: 'manual',
          updated_at: new Date().toISOString()
        })
        .eq('id', forecast.id)

      if (saveError) {
        console.error('[Forecast] Error saving assumptions:', saveError)
        alert('Error saving assumptions: ' + saveError.message)
        setIsSaving(false)
        return
      }

      // Update local forecast state
      const updatedForecast: FinancialForecast = {
        ...forecast,
        revenue_goal: data.revenue_goal,
        gross_profit_goal: data.gross_profit_goal,
        net_profit_goal: data.net_profit_goal,
        revenue_distribution_method: data.revenue_distribution_method,
        cogs_percentage: data.cogs_percentage,
        goal_source: 'manual' as const
      }
      setForecast(updatedForecast)

      // 2. Generate forecast P&L lines (Revenue and COGS only - OpEx will be done line-by-line)
      console.log('[Forecast] Generating forecast from assumptions...')

      const { lines } = await ForecastGenerator.generateForecast({
        forecast: updatedForecast,
        revenueGoal: data.revenue_goal,
        cogsPercentage: data.cogs_percentage,
        opexBudget: 0, // OpEx will be forecasted line-by-line in the P&L table
        distributionMethod: data.revenue_distribution_method,
        existingLines: plLines
      })

      console.log('[Forecast] Generated lines:', lines.length)

      // 3. Save generated P&L lines
      const saveResult = await ForecastService.savePLLines(forecast.id, lines)

      if (saveResult.success) {
        setPlLines(lines)
        console.log('[Forecast] Forecast generated and saved successfully')
        alert('Revenue and COGS forecast generated! Now set up your OpEx forecasts line-by-line in the P&L Forecast tab.')

        // Switch to P&L tab
        setActiveTab('pl')
      } else {
        console.error('[Forecast] Error saving generated lines:', saveResult.error)
        alert('Error saving forecast: ' + saveResult.error)
      }
    } catch (err) {
      console.error('[Forecast] Error:', err)
      alert('Error generating forecast')
    }
    setIsSaving(false)
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading financial forecast...</p>
        </div>
      </div>
    )
  }

  if (!forecast) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Error loading forecast. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!mounted || isLoading) {
    return <LoadingState message="Loading your financial forecast..." />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          setError(null)
          loadInitialData()
        }}
        fullPage
        title="Failed to Load Forecast"
      />
    )
  }

  // No forecast state
  if (!forecast) {
    return (
      <LoadingState message="Creating your forecast..." />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Error Banner */}
        {error && !isLoading && (
          <div className="mb-6">
            <ErrorState
              error={error}
              onRetry={() => {
                setError(null)
                loadInitialData()
              }}
              title="Error"
            />
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Forecast</h1>
              <p className="text-gray-600">{forecast.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Scenario Selector */}
              {scenarios.length > 0 && (
                <ScenarioSelector
                  scenarios={scenarios}
                  activeScenario={activeScenario}
                  onSelectScenario={handleSelectScenario}
                  onCreateScenario={handleCreateScenario}
                  onDuplicateScenario={handleDuplicateScenario}
                  onDeleteScenario={handleDeleteScenario}
                  onArchiveScenario={handleArchiveScenario}
                  className="w-64"
                />
              )}

              {/* What-If Analysis Button */}
              <button
                onClick={() => setShowWhatIfModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Lightbulb className="w-4 h-4" />
                What-If Analysis
              </button>

              {/* Export Controls */}
              {forecast?.id && <ExportControls forecastId={forecast.id} />}

              {/* Saving Indicator */}
              {isSaving && (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {!isSaving && (
                <div className="text-sm text-green-600 font-medium">✓ Saved</div>
              )}
            </div>
          </div>

          {/* Xero Connection Status */}
          <div className="border-t pt-4">
            {xeroConnection ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Connected to Xero: {xeroConnection.tenant_name}
                    </p>
                    {xeroConnection.last_synced_at && (
                      <p className="text-xs text-gray-500">
                        Last synced: {new Date(xeroConnection.last_synced_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDisconnectAndClearAll}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 border-2 border-red-700"
                  >
                    <X className="w-4 h-4" />
                    <span>Disconnect & Clear All Data</span>
                  </button>
                  <button
                    onClick={handleClearAndResync}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Clear & Resync</span>
                  </button>
                  <button
                    onClick={handleSyncFromXero}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Sync from Xero</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <p className="text-sm text-gray-600">Not connected to Xero</p>
                </div>
                <button
                  onClick={handleConnectXero}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Connect to Xero</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Completeness Checker */}
        {forecast && (
          <CompletenessChecker
            forecast={forecast}
            plLines={plLines}
            forecastMonthKeys={ForecastService.generateMonthColumns(
              forecast.actual_start_month,
              forecast.actual_end_month,
              forecast.forecast_start_month,
              forecast.forecast_end_month
            ).filter(c => c.isForecast).map(c => c.key)}
            className="mb-6"
          />
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('assumptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'assumptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Goals & Assumptions</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pl')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pl'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>P&L Forecast</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payroll'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Payroll & Staff</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Change History</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'assumptions' && (
          <div className="bg-white rounded-lg shadow-sm">
            <AssumptionsTab
              forecast={forecast}
              onSave={handleSaveAssumptions}
              onImportFromAnnualPlan={handleImportGoalsFromAnnualPlan}
              onApplyBulkOpExIncrease={handleBulkOpExIncrease}
              isSaving={isSaving}
            />
          </div>
        )}

        {activeTab === 'pl' && (
          <PLForecastTable
            forecast={forecast}
            plLines={plLines}
            onSave={handleSavePLLines}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollTable
            forecast={forecast}
            employees={employees}
            onSave={handleSaveEmployees}
          />
        )}

        {activeTab === 'history' && forecast?.id && (
          <AuditLogViewer forecastId={forecast.id} />
        )}
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      {/* What-If Analysis Modal */}
      {forecast && (
        <WhatIfAnalysisModal
          isOpen={showWhatIfModal}
          onClose={() => setShowWhatIfModal(false)}
          forecast={forecast}
          baselineRevenue={calculateBaselineTotals().totalRevenue}
          baselineCOGS={calculateBaselineTotals().totalCOGS}
          baselineOpEx={calculateBaselineTotals().totalOpEx}
          onSaveAsScenario={handleSaveWhatIfScenario}
        />
      )}
    </div>
  )
}
