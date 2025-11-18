'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import WeeklyMetricsService, { WeeklyMetricsSnapshot } from './services/weekly-metrics-service'
import { FinancialService } from '../goals/services/financial-service'
import { KPIService } from '../goals/services/kpi-service'
import type { FinancialData, CoreMetricsData, KPIData, YearType } from '../goals/types'
import { calculateQuarters, determinePlanYear } from '../goals/utils/quarters'
import { formatPercentage, parseDollarInput } from '../goals/utils/formatting'

export default function BusinessDashboardPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [businessId, setBusinessId] = useState('')
  const [userId, setUserId] = useState('')

  // Fiscal year settings
  const [yearType, setYearType] = useState<YearType>('CY')
  const [planYear, setPlanYear] = useState<number>(new Date().getFullYear())

  // Week preference: 'ending' (Friday) or 'beginning' (Monday)
  const [weekPreference, setWeekPreference] = useState<'ending' | 'beginning'>('ending')

  // All snapshots for the current year
  const [snapshots, setSnapshots] = useState<WeeklyMetricsSnapshot[]>([])
  const [currentSnapshot, setCurrentSnapshot] = useState<WeeklyMetricsSnapshot | null>(null)

  // Expanded quarters state (e.g., ['2024-Q3', '2024-Q2'])
  const [expandedQuarters, setExpandedQuarters] = useState<string[]>([])

  // Goals/Targets
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [coreMetrics, setCoreMetrics] = useState<CoreMetricsData | null>(null)
  const [kpis, setKpis] = useState<KPIData[]>([])

  // Ref for current week column to auto-scroll
  const currentWeekRef = useRef<HTMLTableCellElement>(null)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  // Auto-scroll to current week when data loads
  useEffect(() => {
    if (!isLoading && currentWeekRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        currentWeekRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }, 100)
    }
  }, [isLoading])

  // Reload data when week preference changes
  useEffect(() => {
    if (mounted && businessId && userId) {
      loadCurrentWeekSnapshot()
    }
  }, [weekPreference, mounted, businessId, userId])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Get user and business ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const uid = user.id
      setUserId(uid)

      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id, industry')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('[Business Dashboard] ❌ Error loading business profile:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        })
      }

      const bizId = profile?.id || user.id
      console.log('[Business Dashboard] 📊 Using business ID:', bizId, profile ? '(from profile)' : '(from user.id fallback)')
      setBusinessId(bizId)

      // Load targets (includes year_type and plan_year)
      const {
        financialData: loadedFinancial,
        coreMetrics: loadedCore,
        yearType: loadedYearType
      } = await FinancialService.loadFinancialGoals(bizId)
      const loadedKPIs = await KPIService.getUserKPIs(bizId)

      setFinancialData(loadedFinancial)
      setCoreMetrics(loadedCore)
      setKpis(loadedKPIs)

      // Set year type from financial data
      const actualYearType = loadedYearType || 'FY'
      setYearType(actualYearType)

      // Set plan year using the determinePlanYear function
      const correctPlanYear = determinePlanYear(actualYearType)
      setPlanYear(correctPlanYear)

      console.log('[Business Dashboard] 📅 Year settings:', {
        yearType: actualYearType,
        planYear: correctPlanYear,
        today: new Date().toISOString().split('T')[0]
      })

      // Load all snapshots for the current year (up to 52 weeks)
      const yearSnapshots = await WeeklyMetricsService.getRecentSnapshots(bizId, 52)
      setSnapshots(yearSnapshots)

      // Get or create current week snapshot based on preference
      const currentWeekDate = weekPreference === 'ending'
        ? WeeklyMetricsService.getWeekEnding()
        : WeeklyMetricsService.getWeekBeginning()
      const { snapshot: current } = await WeeklyMetricsService.getOrCreateSnapshot(
        bizId,
        uid,
        currentWeekDate
      )

      setCurrentSnapshot(current)
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading data:', err)
      setIsLoading(false)
    }
  }

  const loadCurrentWeekSnapshot = async () => {
    try {
      // Get current week date based on preference
      const currentWeekDate = weekPreference === 'ending'
        ? WeeklyMetricsService.getWeekEnding()
        : WeeklyMetricsService.getWeekBeginning()

      const { snapshot: current } = await WeeklyMetricsService.getOrCreateSnapshot(
        businessId,
        userId,
        currentWeekDate
      )

      setCurrentSnapshot(current)
    } catch (err) {
      console.error('Error loading current week snapshot:', err)
    }
  }

  const handleSave = async () => {
    if (!currentSnapshot) return

    setIsSaving(true)
    const result = await WeeklyMetricsService.saveSnapshot(currentSnapshot)
    if (result.success) {
      // Reload snapshots to update the table
      const recentSnapshots = await WeeklyMetricsService.getRecentSnapshots(businessId, 8)
      setSnapshots(recentSnapshots)
    }
    setIsSaving(false)
  }

  const updateCurrentSnapshot = (updates: Partial<WeeklyMetricsSnapshot>) => {
    if (currentSnapshot) {
      setCurrentSnapshot({ ...currentSnapshot, ...updates })
    }
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (!value && value !== 0) return ''
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value: number | undefined | null) => {
    if (!value && value !== 0) return ''
    return value.toLocaleString()
  }

  // Handle Enter key to move to next input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const form = e.currentTarget.form
      const inputs = form ? Array.from(form.querySelectorAll('input:not([disabled])')) : []
      const index = inputs.indexOf(e.currentTarget)
      if (index > -1 && index < inputs.length - 1) {
        (inputs[index + 1] as HTMLInputElement).focus()
      }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // Parse the date string (YYYY-MM-DD format)
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Toggle quarter expansion
  const toggleQuarter = (quarterKey: string) => {
    setExpandedQuarters(prev =>
      prev.includes(quarterKey)
        ? prev.filter(q => q !== quarterKey)
        : [...prev, quarterKey]
    )
  }

  // Calculate QTD (Quarter-to-Date) total for a metric
  const calculateQTD = (quarterSnapshots: WeeklyMetricsSnapshot[], metricKey: keyof WeeklyMetricsSnapshot): number => {
    return quarterSnapshots.reduce((sum, snapshot) => {
      const value = snapshot[metricKey]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
  }

  // Calculate QTD for KPIs
  const calculateKpiQTD = (quarterSnapshots: WeeklyMetricsSnapshot[], kpiId: string): number => {
    return quarterSnapshots.reduce((sum, snapshot) => {
      const value = snapshot.kpi_actuals?.[kpiId]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
  }

  // Build quarter columns based on fiscal/calendar year
  const allQuarterInfos = calculateQuarters(yearType, planYear)

  // Filter to only show past and current quarters (not future quarters)
  const quarterInfos = allQuarterInfos.filter(q => q.isPast || q.isCurrent)

  // Find current quarter
  const currentQuarterInfo = quarterInfos.find(q => q.isCurrent)
  const currentQuarter = currentQuarterInfo ? parseInt(currentQuarterInfo.id.substring(1)) : 1
  const currentYear = planYear

  // Map quarter info to simple format for column building
  const quarters = quarterInfos.map((q, idx) => ({
    quarter: idx + 1,
    year: q.startDate.getFullYear(),
    quarterInfo: q
  }))

  // Build columns for display
  interface QuarterColumn {
    type: 'quarter-collapsed' | 'quarter-header' | 'week'
    quarterKey?: string
    quarterLabel?: string
    quarterDateRange?: string
    date?: string
    snapshot?: WeeklyMetricsSnapshot | null
    isCurrentWeek?: boolean
    quarterSnapshots?: WeeklyMetricsSnapshot[] // For QTD calculations
    isFirstWeekInQuarter?: boolean
  }

  const buildColumns = (): QuarterColumn[] => {
    const columns: QuarterColumn[] = []

    // Calculate what the current week date should be based on preference
    const calculatedCurrentWeekDate = weekPreference === 'ending'
      ? WeeklyMetricsService.getWeekEnding()
      : WeeklyMetricsService.getWeekBeginning()

    quarters.forEach(({ quarter, year, quarterInfo }) => {
      const quarterKey = `${year}-Q${quarter}`
      const isCurrentQuarter = quarterInfo.isCurrent
      const isExpanded = expandedQuarters.includes(quarterKey)

      // Get all week dates for this quarter using the fiscal quarter boundaries
      const quarterStart = quarterInfo.startDate
      const quarterEnd = quarterInfo.endDate

      // Generate all weeks in the quarter
      let quarterWeekDates = WeeklyMetricsService.getWeeksInRange(quarterStart, quarterEnd, weekPreference)

      // If this is the current quarter and the calculated current week isn't in the list, add it
      if (isCurrentQuarter && !quarterWeekDates.includes(calculatedCurrentWeekDate)) {
        quarterWeekDates = [...quarterWeekDates, calculatedCurrentWeekDate].sort()
      }

      // Get snapshots for this quarter
      const quarterSnapshots = quarterWeekDates
        .map(date => snapshots.find(s => s.week_ending_date === date) || null)
        .filter(Boolean) as WeeklyMetricsSnapshot[]

      if (isExpanded || isCurrentQuarter) {
        // Add quarter header for expanded quarters (except current quarter which is always visible)
        if (!isCurrentQuarter) {
          columns.push({
            type: 'quarter-header',
            quarterKey,
            quarterLabel: quarterInfo.label,
            quarterDateRange: quarterInfo.months,
          })
        }

        // Show all weeks in this quarter
        quarterWeekDates.forEach((date, idx) => {
          const snapshot = snapshots.find(s => s.week_ending_date === date) || null
          const isCurrentWeek = isCurrentQuarter && date === calculatedCurrentWeekDate

          columns.push({
            type: 'week',
            date,
            snapshot: isCurrentWeek ? currentSnapshot : snapshot,
            isCurrentWeek,
            quarterKey,
            isFirstWeekInQuarter: idx === 0,
          })
        })
      } else {
        // Show collapsed quarter with QTD
        columns.push({
          type: 'quarter-collapsed',
          quarterKey,
          quarterLabel: quarterInfo.label,
          quarterDateRange: quarterInfo.months,
          quarterSnapshots,
        })
      }
    })

    return columns
  }

  const columns = buildColumns()

  if (!mounted) {
    return <div className="p-8"><div className="max-w-7xl mx-auto"><div className="h-8 bg-gray-200 rounded"></div></div></div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <style jsx>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
              <p className="text-gray-600">Track your weekly progress against annual targets</p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save This Week</span>
                </>
              )}
            </button>
          </div>

          {/* Week Preference Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View weeks as:</span>
            <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50">
              <button
                onClick={() => setWeekPreference('beginning')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  weekPreference === 'beginning'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Week Beginning (Monday)
              </button>
              <button
                onClick={() => setWeekPreference('ending')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  weekPreference === 'ending'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Week Ending (Friday)
              </button>
            </div>
          </div>
        </div>

        {/* Unified Dashboard Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Business Metrics Dashboard</h2>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-20" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Metric
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-[200px] bg-gray-50 z-20" style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    Annual Target
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-[340px] bg-gray-50 z-20" style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    Q{currentQuarter} Target
                  </th>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      return (
                        <th key={col.quarterKey} className="w-32 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100 cursor-pointer hover:bg-gray-200"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span>{col.quarterLabel}</span>
                            <span className="text-xs text-gray-500">{col.quarterDateRange}</span>
                            <span className="text-lg">▶</span>
                          </div>
                        </th>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <th key={col.quarterKey} className="w-32 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-100 cursor-pointer hover:bg-blue-200"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span>{col.quarterLabel}</span>
                            <span className="text-xs text-gray-500">{col.quarterDateRange}</span>
                            <span className="text-lg">▼</span>
                          </div>
                        </th>
                      )
                    } else {
                      return (
                        <th
                          key={col.date || idx}
                          ref={col.isCurrentWeek ? currentWeekRef : null}
                          className={`w-36 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider ${col.isCurrentWeek ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                          {col.date ? formatDate(col.date) : ''}
                        </th>
                      )
                    }
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Financial Goals Section Header */}
                <tr className="bg-gray-100">
                  <td className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Financial Goals
                  </td>
                  <td colSpan={2 + columns.length} className="px-4 py-3 bg-gray-100"></td>
                </tr>

                {/* Revenue */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Revenue
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {formatCurrency(financialData?.revenue?.year1)}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {formatCurrency((financialData?.revenue?.year1 || 0) / 4)}
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'revenue_actual')
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{formatCurrency(qtd)}</span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="text"
                              value={formatCurrency(currentSnapshot?.revenue_actual || 0)}
                              onChange={(e) => updateCurrentSnapshot({ revenue_actual: parseDollarInput(e.target.value) })}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatCurrency(col.snapshot?.revenue_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Gross Profit */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Gross Profit
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {formatCurrency(financialData?.grossProfit?.year1)}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {formatCurrency((financialData?.grossProfit?.year1 || 0) / 4)}
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'gross_profit_actual')
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{formatCurrency(qtd)}</span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="text"
                              value={formatCurrency(currentSnapshot?.gross_profit_actual || 0)}
                              onChange={(e) => updateCurrentSnapshot({ gross_profit_actual: parseDollarInput(e.target.value) })}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs">{formatCurrency(col.snapshot?.gross_profit_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Net Profit */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Net Profit
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {formatCurrency(financialData?.netProfit?.year1)}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {formatCurrency((financialData?.netProfit?.year1 || 0) / 4)}
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'net_profit_actual')
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{formatCurrency(qtd)}</span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="text"
                              value={formatCurrency(currentSnapshot?.net_profit_actual || 0)}
                              onChange={(e) => updateCurrentSnapshot({ net_profit_actual: parseDollarInput(e.target.value) })}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs">{formatCurrency(col.snapshot?.net_profit_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Core Metrics Section Header */}
                <tr className="bg-gray-100">
                  <td className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Core Metrics
                  </td>
                  <td colSpan={2 + columns.length} className="px-4 py-3 bg-gray-100"></td>
                </tr>
                {/* Leads */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Leads per Month
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {coreMetrics?.leadsPerMonth?.year1 || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {Math.round((coreMetrics?.leadsPerMonth?.year1 || 0) / 4)}
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'leads_actual')
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{formatNumber(qtd)}</span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="number"
                              value={currentSnapshot?.leads_actual || ''}
                              onChange={(e) => updateCurrentSnapshot({ leads_actual: parseInt(e.target.value) || 0 })}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs">{formatNumber(col.snapshot?.leads_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Conversion Rate */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Conversion Rate
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {coreMetrics?.conversionRate?.year1 || 0}%
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {coreMetrics?.conversionRate?.year1 || 0}%
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtdCount = col.quarterSnapshots?.filter(s => s.conversion_rate_actual).length || 0
                      const qtdSum = col.quarterSnapshots?.reduce((sum, s) => sum + (s.conversion_rate_actual || 0), 0) || 0
                      const qtdAvg = qtdCount > 0 ? qtdSum / qtdCount : 0
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{qtdAvg > 0 ? `${qtdAvg.toFixed(1)}%` : ''}</span>
                            <span className="text-xs text-gray-500">Avg</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="text"
                              value={currentSnapshot?.conversion_rate_actual ? `${currentSnapshot.conversion_rate_actual}%` : ''}
                              onChange={(e) => {
                                const numValue = parseFloat(e.target.value.replace('%', '')) || 0
                                updateCurrentSnapshot({ conversion_rate_actual: numValue })
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0%"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs">{col.snapshot?.conversion_rate_actual ? `${col.snapshot.conversion_rate_actual}%` : ''}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Avg Transaction Value */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Avg Transaction Value
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {formatCurrency(coreMetrics?.avgTransactionValue?.year1)}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {formatCurrency((coreMetrics?.avgTransactionValue?.year1 || 0) / 4)}
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtdCount = col.quarterSnapshots?.filter(s => s.avg_transaction_value_actual).length || 0
                      const qtdSum = col.quarterSnapshots?.reduce((sum, s) => sum + (s.avg_transaction_value_actual || 0), 0) || 0
                      const qtdAvg = qtdCount > 0 ? qtdSum / qtdCount : 0
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{formatCurrency(qtdAvg)}</span>
                            <span className="text-xs text-gray-500">Avg</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="text"
                              value={formatCurrency(currentSnapshot?.avg_transaction_value_actual || 0)}
                              onChange={(e) => updateCurrentSnapshot({ avg_transaction_value_actual: parseDollarInput(e.target.value) })}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs">{formatCurrency(col.snapshot?.avg_transaction_value_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Team Headcount */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Team Headcount
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {coreMetrics?.teamHeadcount?.year1 || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {Math.round((coreMetrics?.teamHeadcount?.year1 || 0) / 4)}
                  </td>
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const lastSnapshot = col.quarterSnapshots?.[col.quarterSnapshots.length - 1]
                      const headcount = lastSnapshot?.team_headcount_actual || 0
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{formatNumber(headcount)}</span>
                            <span className="text-xs text-gray-500">Latest</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {col.isCurrentWeek ? (
                            <input
                              type="number"
                              value={currentSnapshot?.team_headcount_actual || ''}
                              onChange={(e) => updateCurrentSnapshot({ team_headcount_actual: parseInt(e.target.value) || 0 })}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs">{formatNumber(col.snapshot?.team_headcount_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>

                {/* Custom KPIs Section Header */}
                {kpis.length > 0 && (
                  <tr className="bg-gray-100">
                    <td className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                      Custom KPIs
                    </td>
                    <td colSpan={2 + columns.length} className="px-4 py-3 bg-gray-100"></td>
                  </tr>
                )}

                {/* Custom KPI Rows */}
                {kpis.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                        {kpi.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                        {kpi.unit === 'currency' ? formatCurrency(kpi.year1Target) :
                         kpi.unit === 'percentage' ? `${kpi.year1Target}%` :
                         formatNumber(kpi.year1Target)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {kpi.unit === 'currency' ? formatCurrency(Math.round(kpi.year1Target / 4)) :
                         kpi.unit === 'percentage' ? `${Math.round(kpi.year1Target / 4)}%` :
                         formatNumber(Math.round(kpi.year1Target / 4))}
                      </td>
                      {columns.map((col, idx) => {
                        if (col.type === 'quarter-collapsed') {
                          const qtd = calculateKpiQTD(col.quarterSnapshots || [], kpi.id)
                          const formattedQtd = qtd ? (
                            kpi.unit === 'currency' ? formatCurrency(qtd) :
                            kpi.unit === 'percentage' ? `${qtd}%` :
                            formatNumber(qtd)
                          ) : ''
                          return (
                            <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleQuarter(col.quarterKey!)}>
                              <div className="flex flex-col items-center">
                                <span className="text-gray-900 font-medium">{formattedQtd}</span>
                                <span className="text-xs text-gray-500">QTD</span>
                              </div>
                            </td>
                          )
                        } else if (col.type === 'quarter-header') {
                          return (
                            <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                          )
                        } else {
                          const value = col.snapshot?.kpi_actuals?.[kpi.id]
                          return (
                            <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                              {col.isCurrentWeek ? (
                                <>
                                  {kpi.unit === 'currency' ? (
                                    <input
                                      type="text"
                                      value={formatCurrency(currentSnapshot?.kpi_actuals?.[kpi.id] || 0)}
                                      onChange={(e) => {
                                        const newKpiActuals = { ...currentSnapshot?.kpi_actuals }
                                        newKpiActuals[kpi.id] = parseDollarInput(e.target.value)
                                        updateCurrentSnapshot({ kpi_actuals: newKpiActuals })
                                      }}
                                      onKeyDown={handleKeyDown}
                                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                                      placeholder="$0"
                                    />
                                  ) : kpi.unit === 'percentage' ? (
                                    <input
                                      type="text"
                                      value={currentSnapshot?.kpi_actuals?.[kpi.id] ? `${currentSnapshot.kpi_actuals[kpi.id]}%` : ''}
                                      onChange={(e) => {
                                        const numValue = parseFloat(e.target.value.replace('%', '')) || 0
                                        const newKpiActuals = { ...currentSnapshot?.kpi_actuals }
                                        newKpiActuals[kpi.id] = numValue
                                        updateCurrentSnapshot({ kpi_actuals: newKpiActuals })
                                      }}
                                      onKeyDown={handleKeyDown}
                                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                                      placeholder="0%"
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      value={currentSnapshot?.kpi_actuals?.[kpi.id] || ''}
                                      onChange={(e) => {
                                        const newKpiActuals = { ...currentSnapshot?.kpi_actuals }
                                        newKpiActuals[kpi.id] = parseFloat(e.target.value) || 0
                                        updateCurrentSnapshot({ kpi_actuals: newKpiActuals })
                                      }}
                                      onKeyDown={handleKeyDown}
                                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                                      placeholder="0"
                                    />
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-900 text-xs">
                                  {value ? (
                                    kpi.unit === 'currency' ? formatCurrency(value) :
                                    kpi.unit === 'percentage' ? `${value}%` :
                                    formatNumber(value)
                                  ) : ''}
                                </span>
                              )}
                            </td>
                          )
                        }
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}
