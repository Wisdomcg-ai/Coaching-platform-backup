'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, Unlock, TrendingUp, TrendingDown, Minus, Settings } from 'lucide-react'
import WeeklyMetricsService, { WeeklyMetricsSnapshot } from './services/weekly-metrics-service'
import DashboardPreferencesService, { DashboardPreferences } from './services/dashboard-preferences-service'
import ManageMetricsModal from './components/ManageMetricsModal'
import { FinancialService } from '../goals/services/financial-service'
import { KPIService } from '../goals/services/kpi-service'
import type { FinancialData, CoreMetricsData, KPIData, YearType } from '../goals/types'
import { calculateQuarters, determinePlanYear } from '../goals/utils/quarters'
import { formatPercentage, parseDollarInput } from '../goals/utils/formatting'

export default function BusinessDashboardPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  // Past weeks editing lock state
  const [pastWeeksUnlocked, setPastWeeksUnlocked] = useState(false)

  // View mode: 'quarter' shows current quarter only, 'year' shows all quarters
  const [viewMode, setViewMode] = useState<'quarter' | 'year'>('quarter')

  // Dashboard preferences (which metrics are visible)
  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences | null>(null)
  const [isManageMetricsOpen, setIsManageMetricsOpen] = useState(false)

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

      // Load dashboard preferences
      const { preferences } = await DashboardPreferencesService.loadPreferences(bizId, uid)
      setDashboardPreferences(preferences)

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

  // Update and auto-save current week snapshot
  const updateCurrentSnapshot = async (updates: Partial<WeeklyMetricsSnapshot>) => {
    if (!currentSnapshot) return

    const updatedSnapshot = { ...currentSnapshot, ...updates }

    // Update in state
    setCurrentSnapshot(updatedSnapshot)

    // Auto-save to database
    await WeeklyMetricsService.saveSnapshot(updatedSnapshot)
  }

  // Update and auto-save past week snapshot
  const updatePastSnapshot = async (snapshot: WeeklyMetricsSnapshot | null, updates: Partial<WeeklyMetricsSnapshot>) => {
    if (!snapshot) return

    const updatedSnapshot = { ...snapshot, ...updates }

    // Update in state
    setSnapshots(prev => prev.map(s =>
      s.week_ending_date === snapshot.week_ending_date ? updatedSnapshot : s
    ))

    // Auto-save to database
    await WeeklyMetricsService.saveSnapshot(updatedSnapshot)
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

  // Save dashboard preferences
  const savePreferences = async (preferences: DashboardPreferences) => {
    const result = await DashboardPreferencesService.savePreferences(preferences)
    if (result.success) {
      setDashboardPreferences(preferences)
      console.log('[Dashboard] Preferences saved successfully')
    } else {
      console.error('[Dashboard] Failed to save preferences:', result.error)
    }
  }

  // Handle KPI creation from modal
  const handleKpiCreated = async () => {
    console.log('[Dashboard] KPI created, reloading KPIs...')
    // Reload KPIs to show the newly created one
    const loadedKPIs = await KPIService.getUserKPIs(businessId)
    setKpis(loadedKPIs)
  }

  // Toggle quarter expansion
  const toggleQuarter = (quarterKey: string) => {
    setExpandedQuarters(prev =>
      prev.includes(quarterKey)
        ? prev.filter(q => q !== quarterKey)
        : [...prev, quarterKey]
    )
  }

  // Check if a week is editable (current week always editable, past weeks only if unlocked, future weeks never editable)
  const isWeekEditable = (isCurrentWeek: boolean, weekDate?: string): boolean => {
    if (isCurrentWeek) return true

    // If no week date provided, assume not editable
    if (!weekDate) return false

    // Check if this week is in the past
    const currentWeekDate = weekPreference === 'ending'
      ? WeeklyMetricsService.getWeekEnding()
      : WeeklyMetricsService.getWeekBeginning()

    const isPastWeek = weekDate < currentWeekDate

    // Only allow editing past weeks if unlocked
    return isPastWeek && pastWeeksUnlocked
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

  // Calculate quarter progress
  const getQuarterProgress = (quarterInfo: any) => {
    if (!quarterInfo) return { currentWeek: 0, totalWeeks: 0, percentComplete: 0 }

    const currentWeekDate = weekPreference === 'ending'
      ? WeeklyMetricsService.getWeekEnding()
      : WeeklyMetricsService.getWeekBeginning()

    const allWeeks = WeeklyMetricsService.getWeeksInRange(
      quarterInfo.startDate,
      quarterInfo.endDate,
      weekPreference
    )

    const totalWeeks = allWeeks.length
    const completedWeeks = allWeeks.filter(week => week <= currentWeekDate).length
    const percentComplete = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0

    return { currentWeek: completedWeeks, totalWeeks, percentComplete }
  }

  // Calculate if metric is on track (green), at risk (yellow), or behind (red)
  const getTrendStatus = (actual: number, target: number, percentComplete: number): 'ahead' | 'on-track' | 'behind' => {
    if (target === 0) return 'on-track'

    const expectedAtThisPoint = (target * percentComplete) / 100
    const percentOfExpected = (actual / expectedAtThisPoint) * 100

    if (percentOfExpected >= 95) return 'ahead' // Within 95%+ of where we should be
    if (percentOfExpected >= 85) return 'on-track' // Within 85-95%
    return 'behind' // Less than 85%
  }

  // Build quarter columns based on fiscal/calendar year
  const allQuarterInfos = calculateQuarters(yearType, planYear)

  // Filter quarters based on view mode
  const quarterInfos = viewMode === 'quarter'
    ? allQuarterInfos.filter(q => q.isCurrent) // Show only current quarter
    : allQuarterInfos.filter(q => q.isPast || q.isCurrent) // Show past and current quarters

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
              onClick={() => setPastWeeksUnlocked(!pastWeeksUnlocked)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                pastWeeksUnlocked
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {pastWeeksUnlocked ? (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Lock Past Weeks</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Edit Past Weeks</span>
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

        {/* Quarter Progress Summary Card */}
        {currentQuarterInfo && (() => {
          const progress = getQuarterProgress(currentQuarterInfo)
          const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
            currentQuarterInfo.startDate,
            currentQuarterInfo.endDate,
            weekPreference
          )
          const quarterSnapshots = quarterWeeks
            .map(date => snapshots.find(s => s.week_ending_date === date))
            .filter(Boolean) as WeeklyMetricsSnapshot[]

          // Calculate QTD actuals
          const revenueQTD = calculateQTD(quarterSnapshots, 'revenue_actual')
          const grossProfitQTD = calculateQTD(quarterSnapshots, 'gross_profit_actual')
          const netProfitQTD = calculateQTD(quarterSnapshots, 'net_profit_actual')

          // Get quarter targets
          const revenueTarget = (financialData?.revenue?.year1 || 0) / 4
          const grossProfitTarget = (financialData?.grossProfit?.year1 || 0) / 4
          const netProfitTarget = (financialData?.netProfit?.year1 || 0) / 4

          // Calculate trends
          const revenueTrend = getTrendStatus(revenueQTD, revenueTarget, progress.percentComplete)
          const grossProfitTrend = getTrendStatus(grossProfitQTD, grossProfitTarget, progress.percentComplete)
          const netProfitTrend = getTrendStatus(netProfitQTD, netProfitTarget, progress.percentComplete)

          const getTrendIcon = (trend: string) => {
            if (trend === 'ahead') return <TrendingUp className="w-5 h-5 text-green-600" />
            if (trend === 'behind') return <TrendingDown className="w-5 h-5 text-red-600" />
            return <Minus className="w-5 h-5 text-yellow-600" />
          }

          const getTrendColor = (trend: string) => {
            if (trend === 'ahead') return 'bg-green-50 border-green-200'
            if (trend === 'behind') return 'bg-red-50 border-red-200'
            return 'bg-yellow-50 border-yellow-200'
          }

          const getTrendLabel = (trend: string) => {
            if (trend === 'ahead') return 'Ahead of Pace'
            if (trend === 'behind') return 'Behind Pace'
            return 'On Track'
          }

          return (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentQuarterInfo.label} Progress</h2>
                  <p className="text-gray-600">
                    Week {progress.currentWeek} of {progress.totalWeeks} ({progress.percentComplete}% complete)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{currentQuarterInfo.months}</div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all"
                      style={{ width: `${progress.percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Revenue Card */}
                <div className={`p-4 rounded-lg border-2 ${getTrendColor(revenueTrend)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Revenue</h3>
                    {getTrendIcon(revenueTrend)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold">{formatCurrency(revenueTarget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actual (QTD):</span>
                      <span className="font-semibold">{formatCurrency(revenueQTD)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">% of Target:</span>
                      <span className="font-semibold">
                        {revenueTarget > 0 ? Math.round((revenueQTD / revenueTarget) * 100) : 0}%
                      </span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs font-medium">{getTrendLabel(revenueTrend)}</span>
                    </div>
                  </div>
                </div>

                {/* Gross Profit Card */}
                <div className={`p-4 rounded-lg border-2 ${getTrendColor(grossProfitTrend)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Gross Profit</h3>
                    {getTrendIcon(grossProfitTrend)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold">{formatCurrency(grossProfitTarget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actual (QTD):</span>
                      <span className="font-semibold">{formatCurrency(grossProfitQTD)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">% of Target:</span>
                      <span className="font-semibold">
                        {grossProfitTarget > 0 ? Math.round((grossProfitQTD / grossProfitTarget) * 100) : 0}%
                      </span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs font-medium">{getTrendLabel(grossProfitTrend)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Profit Card */}
                <div className={`p-4 rounded-lg border-2 ${getTrendColor(netProfitTrend)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Net Profit</h3>
                    {getTrendIcon(netProfitTrend)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold">{formatCurrency(netProfitTarget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actual (QTD):</span>
                      <span className="font-semibold">{formatCurrency(netProfitQTD)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">% of Target:</span>
                      <span className="font-semibold">
                        {netProfitTarget > 0 ? Math.round((netProfitQTD / netProfitTarget) * 100) : 0}%
                      </span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs font-medium">{getTrendLabel(netProfitTrend)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Unified Dashboard Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Business Metrics Dashboard</h2>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50">
                  <button
                    onClick={() => setViewMode('quarter')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                      viewMode === 'quarter'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Current Quarter
                  </button>
                  <button
                    onClick={() => setViewMode('year')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      viewMode === 'year'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Current Year
                  </button>
                </div>

                {/* Manage Metrics Button */}
                <button
                  onClick={() => setIsManageMetricsOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Metrics</span>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }} />
                <col style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }} />
                <col style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }} />
                <col style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }} />
                {columns.map((col, idx) => (
                  <col key={col.quarterKey || col.date || idx} style={{ width: col.type === 'week' ? '144px' : '128px' }} />
                ))}
              </colgroup>
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
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-[460px] bg-gray-50 z-20" style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    QTD Actual
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
                  <td colSpan={3 + columns.length} className="px-4 py-3 bg-gray-100"></td>
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const qtd = calculateQTD(quarterSnapshots, 'revenue_actual')
                    const target = (financialData?.revenue?.year1 || 0) / 4
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(qtd, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatCurrency(qtd)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'revenue_actual')
                      const target = (financialData?.revenue?.year1 || 0) / 4
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(qtd, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatCurrency(qtd)}
                              <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />
                            </span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={formatCurrency(col.isCurrentWeek ? currentSnapshot?.revenue_actual || 0 : col.snapshot?.revenue_actual || 0)}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ revenue_actual: parseDollarInput(e.target.value) })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { revenue_actual: parseDollarInput(e.target.value) })
                                }
                              }}
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const qtd = calculateQTD(quarterSnapshots, 'gross_profit_actual')
                    const target = (financialData?.grossProfit?.year1 || 0) / 4
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(qtd, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatCurrency(qtd)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'gross_profit_actual')
                      const target = (financialData?.grossProfit?.year1 || 0) / 4
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(qtd, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatCurrency(qtd)}
                              <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />
                            </span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={formatCurrency(col.isCurrentWeek ? currentSnapshot?.gross_profit_actual || 0 : col.snapshot?.gross_profit_actual || 0)}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ gross_profit_actual: parseDollarInput(e.target.value) })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { gross_profit_actual: parseDollarInput(e.target.value) })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatCurrency(col.snapshot?.gross_profit_actual)}</span>
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const qtd = calculateQTD(quarterSnapshots, 'net_profit_actual')
                    const target = (financialData?.netProfit?.year1 || 0) / 4
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(qtd, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatCurrency(qtd)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'net_profit_actual')
                      const target = (financialData?.netProfit?.year1 || 0) / 4
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(qtd, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatCurrency(qtd)}
                              <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />
                            </span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={formatCurrency(col.isCurrentWeek ? currentSnapshot?.net_profit_actual || 0 : col.snapshot?.net_profit_actual || 0)}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ net_profit_actual: parseDollarInput(e.target.value) })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { net_profit_actual: parseDollarInput(e.target.value) })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatCurrency(col.snapshot?.net_profit_actual)}</span>
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
                  <td colSpan={3 + columns.length} className="px-4 py-3 bg-gray-100"></td>
                </tr>
                {/* Leads */}
                {DashboardPreferencesService.isMetricVisible('leads', dashboardPreferences) && (
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const qtd = calculateQTD(quarterSnapshots, 'leads_actual')
                    const target = Math.round((coreMetrics?.leadsPerMonth?.year1 || 0) / 4)
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(qtd, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatNumber(qtd)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtd = calculateQTD(col.quarterSnapshots || [], 'leads_actual')
                      const target = Math.round((coreMetrics?.leadsPerMonth?.year1 || 0) / 4)
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(qtd, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatNumber(qtd)}
                              <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />
                            </span>
                            <span className="text-xs text-gray-500">QTD</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="number"
                              value={col.isCurrentWeek ? currentSnapshot?.leads_actual || '' : col.snapshot?.leads_actual || ''}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ leads_actual: parseInt(e.target.value) || 0 })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { leads_actual: parseInt(e.target.value) || 0 })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatNumber(col.snapshot?.leads_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>
                )}

                {/* Conversion Rate */}
                {DashboardPreferencesService.isMetricVisible('conversion_rate', dashboardPreferences) && (
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const qtdCount = quarterSnapshots.filter(s => s.conversion_rate_actual).length
                    const qtdSum = quarterSnapshots.reduce((sum, s) => sum + (s.conversion_rate_actual || 0), 0)
                    const qtdAvg = qtdCount > 0 ? qtdSum / qtdCount : 0
                    const target = coreMetrics?.conversionRate?.year1 || 0
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(qtdAvg, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {qtdAvg > 0 ? `${qtdAvg.toFixed(1)}%` : ''}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtdCount = col.quarterSnapshots?.filter(s => s.conversion_rate_actual).length || 0
                      const qtdSum = col.quarterSnapshots?.reduce((sum, s) => sum + (s.conversion_rate_actual || 0), 0) || 0
                      const qtdAvg = qtdCount > 0 ? qtdSum / qtdCount : 0
                      const target = coreMetrics?.conversionRate?.year1 || 0
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(qtdAvg, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {qtdAvg > 0 ? `${qtdAvg.toFixed(1)}%` : ''}
                              {qtdAvg > 0 && <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />}
                            </span>
                            <span className="text-xs text-gray-500">Avg</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      const snapshotData = col.isCurrentWeek ? currentSnapshot : col.snapshot
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={snapshotData?.conversion_rate_actual ? `${snapshotData.conversion_rate_actual}%` : ''}
                              onChange={(e) => {
                                const numValue = parseFloat(e.target.value.replace('%', '')) || 0
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ conversion_rate_actual: numValue })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { conversion_rate_actual: numValue })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0%"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{col.snapshot?.conversion_rate_actual ? `${col.snapshot.conversion_rate_actual}%` : ''}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>
                )}

                {/* Avg Transaction Value */}
                {DashboardPreferencesService.isMetricVisible('avg_transaction', dashboardPreferences) && (
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const qtdCount = quarterSnapshots.filter(s => s.avg_transaction_value_actual).length
                    const qtdSum = quarterSnapshots.reduce((sum, s) => sum + (s.avg_transaction_value_actual || 0), 0)
                    const qtdAvg = qtdCount > 0 ? qtdSum / qtdCount : 0
                    const target = (coreMetrics?.avgTransactionValue?.year1 || 0) / 4
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(qtdAvg, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatCurrency(qtdAvg)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const qtdCount = col.quarterSnapshots?.filter(s => s.avg_transaction_value_actual).length || 0
                      const qtdSum = col.quarterSnapshots?.reduce((sum, s) => sum + (s.avg_transaction_value_actual || 0), 0) || 0
                      const qtdAvg = qtdCount > 0 ? qtdSum / qtdCount : 0
                      const target = (coreMetrics?.avgTransactionValue?.year1 || 0) / 4
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(qtdAvg, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatCurrency(qtdAvg)}
                              {qtdAvg > 0 && <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />}
                            </span>
                            <span className="text-xs text-gray-500">Avg</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="text"
                              value={formatCurrency(col.isCurrentWeek ? currentSnapshot?.avg_transaction_value_actual || 0 : col.snapshot?.avg_transaction_value_actual || 0)}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ avg_transaction_value_actual: parseDollarInput(e.target.value) })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { avg_transaction_value_actual: parseDollarInput(e.target.value) })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="$0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatCurrency(col.snapshot?.avg_transaction_value_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>
                )}

                {/* Team Headcount */}
                {DashboardPreferencesService.isMetricVisible('team_headcount', dashboardPreferences) && (
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
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const lastSnapshot = quarterSnapshots[quarterSnapshots.length - 1]
                    const headcount = lastSnapshot?.team_headcount_actual || 0
                    const target = Math.round((coreMetrics?.teamHeadcount?.year1 || 0) / 4)
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(headcount, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatNumber(headcount)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const lastSnapshot = col.quarterSnapshots?.[col.quarterSnapshots.length - 1]
                      const headcount = lastSnapshot?.team_headcount_actual || 0
                      const target = Math.round((coreMetrics?.teamHeadcount?.year1 || 0) / 4)
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(headcount, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatNumber(headcount)}
                              {headcount > 0 && <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />}
                            </span>
                            <span className="text-xs text-gray-500">Latest</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="number"
                              value={col.isCurrentWeek ? currentSnapshot?.team_headcount_actual || '' : col.snapshot?.team_headcount_actual || ''}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ team_headcount_actual: parseInt(e.target.value) || 0 })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { team_headcount_actual: parseInt(e.target.value) || 0 })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatNumber(col.snapshot?.team_headcount_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>
                )}

                {/* Owner Hours per Week */}
                {DashboardPreferencesService.isMetricVisible('owner_hours', dashboardPreferences) && (
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                    Owner Hours per Week
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '200px', width: '140px', minWidth: '140px', maxWidth: '140px' }}>
                    {coreMetrics?.ownerHoursPerWeek?.year1 || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600 font-semibold sticky bg-white z-10" style={{ left: '340px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                    {Math.round((coreMetrics?.ownerHoursPerWeek?.year1 || 0) / 4)}
                  </td>
                  {(() => {
                    if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                    const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                      currentQuarterInfo.startDate,
                      currentQuarterInfo.endDate,
                      weekPreference
                    )
                    const quarterSnapshots = quarterWeeks
                      .map(date => snapshots.find(s => s.week_ending_date === date))
                      .filter(Boolean) as WeeklyMetricsSnapshot[]

                    const lastSnapshot = quarterSnapshots[quarterSnapshots.length - 1]
                    const hours = lastSnapshot?.owner_hours_actual || 0
                    const target = Math.round((coreMetrics?.ownerHoursPerWeek?.year1 || 0) / 4)
                    const progress = getQuarterProgress(currentQuarterInfo)
                    const trend = getTrendStatus(hours, target, progress.percentComplete)
                    const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                    return (
                      <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                        {formatNumber(hours)}
                      </td>
                    )
                  })()}
                  {columns.map((col, idx) => {
                    if (col.type === 'quarter-collapsed') {
                      const lastSnapshot = col.quarterSnapshots?.[col.quarterSnapshots.length - 1]
                      const hours = lastSnapshot?.owner_hours_actual || 0
                      const target = Math.round((coreMetrics?.ownerHoursPerWeek?.year1 || 0) / 4)
                      const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                      const trend = getTrendStatus(hours, target, progress.percentComplete)
                      const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                      const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                      const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                      return (
                        <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                            onClick={() => toggleQuarter(col.quarterKey!)}>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium flex items-center">
                              {formatNumber(hours)}
                              {hours > 0 && <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />}
                            </span>
                            <span className="text-xs text-gray-500">Latest</span>
                          </div>
                        </td>
                      )
                    } else if (col.type === 'quarter-header') {
                      return (
                        <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                      )
                    } else {
                      const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                      return (
                        <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                          {isEditable ? (
                            <input
                              type="number"
                              value={col.isCurrentWeek ? currentSnapshot?.owner_hours_actual || '' : col.snapshot?.owner_hours_actual || ''}
                              onChange={(e) => {
                                if (col.isCurrentWeek) {
                                  updateCurrentSnapshot({ owner_hours_actual: parseFloat(e.target.value) || 0 })
                                } else {
                                  updatePastSnapshot(col.snapshot || null, { owner_hours_actual: parseFloat(e.target.value) || 0 })
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                              placeholder="0"
                            />
                          ) : (
                            <span className="text-gray-900 text-sm">{formatNumber(col.snapshot?.owner_hours_actual)}</span>
                          )}
                        </td>
                      )
                    }
                  })}
                </tr>
                )}

                {/* Custom KPIs Section Header */}
                {kpis.filter(kpi => DashboardPreferencesService.isKpiVisible(kpi.id, dashboardPreferences)).length > 0 && (
                  <tr className="bg-gray-100">
                    <td className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                      Custom KPIs
                    </td>
                    <td colSpan={3 + columns.length} className="px-4 py-3 bg-gray-100"></td>
                  </tr>
                )}

                {/* Custom KPI Rows */}
                {kpis
                  .filter(kpi => DashboardPreferencesService.isKpiVisible(kpi.id, dashboardPreferences))
                  .map((kpi) => (
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
                      {(() => {
                        if (!currentQuarterInfo) return <td className="px-4 py-4 text-sm text-right sticky bg-white z-10" style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}></td>

                        const quarterWeeks = WeeklyMetricsService.getWeeksInRange(
                          currentQuarterInfo.startDate,
                          currentQuarterInfo.endDate,
                          weekPreference
                        )
                        const quarterSnapshots = quarterWeeks
                          .map(date => snapshots.find(s => s.week_ending_date === date))
                          .filter(Boolean) as WeeklyMetricsSnapshot[]

                        let qtd: number
                        if (kpi.unit === 'percentage') {
                          const qtdCount = quarterSnapshots.filter(s => s.kpi_actuals?.[kpi.id]).length
                          const qtdSum = quarterSnapshots.reduce((sum, s) => sum + (s.kpi_actuals?.[kpi.id] || 0), 0)
                          qtd = qtdCount > 0 ? qtdSum / qtdCount : 0
                        } else {
                          qtd = calculateKpiQTD(quarterSnapshots, kpi.id)
                        }

                        const target = Math.round(kpi.year1Target / 4)
                        const progress = getQuarterProgress(currentQuarterInfo)
                        const trend = getTrendStatus(qtd, target, progress.percentComplete)
                        const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'

                        const formattedQtd = qtd ? (
                          kpi.unit === 'currency' ? formatCurrency(qtd) :
                          kpi.unit === 'percentage' ? `${qtd.toFixed(1)}%` :
                          formatNumber(qtd)
                        ) : ''

                        return (
                          <td className={`px-4 py-4 text-sm text-right font-semibold sticky z-10 ${bgColor}`} style={{ left: '460px', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                            {formattedQtd}
                          </td>
                        )
                      })()}
                      {columns.map((col, idx) => {
                        if (col.type === 'quarter-collapsed') {
                          // Calculate QTD based on unit type
                          let qtd: number
                          let label: string

                          if (kpi.unit === 'percentage') {
                            // For percentages, calculate average
                            const qtdCount = col.quarterSnapshots?.filter(s => s.kpi_actuals?.[kpi.id]).length || 0
                            const qtdSum = col.quarterSnapshots?.reduce((sum, s) => sum + (s.kpi_actuals?.[kpi.id] || 0), 0) || 0
                            qtd = qtdCount > 0 ? qtdSum / qtdCount : 0
                            label = 'Avg'
                          } else {
                            // For currency and number, sum
                            qtd = calculateKpiQTD(col.quarterSnapshots || [], kpi.id)
                            label = 'QTD'
                          }

                          const target = Math.round(kpi.year1Target / 4)
                          const progress = currentQuarterInfo ? getQuarterProgress(currentQuarterInfo) : { percentComplete: 0 }
                          const trend = getTrendStatus(qtd, target, progress.percentComplete)
                          const bgColor = trend === 'ahead' ? 'bg-green-50' : trend === 'behind' ? 'bg-red-50' : 'bg-yellow-50'
                          const TrendIcon = trend === 'ahead' ? TrendingUp : trend === 'behind' ? TrendingDown : Minus
                          const iconColor = trend === 'ahead' ? 'text-green-600' : trend === 'behind' ? 'text-red-600' : 'text-yellow-600'

                          const formattedQtd = qtd ? (
                            kpi.unit === 'currency' ? formatCurrency(qtd) :
                            kpi.unit === 'percentage' ? `${qtd.toFixed(1)}%` :
                            formatNumber(qtd)
                          ) : ''

                          return (
                            <td key={col.quarterKey} className={`px-3 py-4 text-sm text-center ${bgColor} cursor-pointer hover:opacity-80`}
                                onClick={() => toggleQuarter(col.quarterKey!)}>
                              <div className="flex flex-col items-center">
                                <span className="text-gray-900 font-medium flex items-center">
                                  {formattedQtd}
                                  {qtd > 0 && <TrendIcon className={`w-3 h-3 ml-1 ${iconColor}`} />}
                                </span>
                                <span className="text-xs text-gray-500">{label}</span>
                              </div>
                            </td>
                          )
                        } else if (col.type === 'quarter-header') {
                          return (
                            <td key={col.quarterKey} className="px-3 py-4 text-sm text-center bg-blue-50 border-l-2 border-blue-200"></td>
                          )
                        } else {
                          const isEditable = isWeekEditable(col.isCurrentWeek || false, col.date)
                          const snapshotData = col.isCurrentWeek ? currentSnapshot : col.snapshot
                          const value = snapshotData?.kpi_actuals?.[kpi.id]
                          return (
                            <td key={col.date || idx} className={`px-3 py-4 text-sm text-center ${col.isCurrentWeek ? 'bg-blue-50' : ''}`}>
                              {isEditable ? (
                                <>
                                  {kpi.unit === 'currency' ? (
                                    <input
                                      type="text"
                                      value={formatCurrency(value || 0)}
                                      onChange={(e) => {
                                        const parsedValue = parseDollarInput(e.target.value)
                                        if (col.isCurrentWeek) {
                                          const newKpiActuals = { ...currentSnapshot?.kpi_actuals }
                                          newKpiActuals[kpi.id] = parsedValue
                                          updateCurrentSnapshot({ kpi_actuals: newKpiActuals })
                                        } else {
                                          const newKpiActuals = { ...col.snapshot?.kpi_actuals }
                                          newKpiActuals[kpi.id] = parsedValue
                                          updatePastSnapshot(col.snapshot || null, { kpi_actuals: newKpiActuals })
                                        }
                                      }}
                                      onKeyDown={handleKeyDown}
                                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                                      placeholder="$0"
                                    />
                                  ) : kpi.unit === 'percentage' ? (
                                    <input
                                      type="text"
                                      value={value ? `${value}%` : ''}
                                      onChange={(e) => {
                                        const numValue = parseFloat(e.target.value.replace('%', '')) || 0
                                        if (col.isCurrentWeek) {
                                          const newKpiActuals = { ...currentSnapshot?.kpi_actuals }
                                          newKpiActuals[kpi.id] = numValue
                                          updateCurrentSnapshot({ kpi_actuals: newKpiActuals })
                                        } else {
                                          const newKpiActuals = { ...col.snapshot?.kpi_actuals }
                                          newKpiActuals[kpi.id] = numValue
                                          updatePastSnapshot(col.snapshot || null, { kpi_actuals: newKpiActuals })
                                        }
                                      }}
                                      onKeyDown={handleKeyDown}
                                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                                      placeholder="0%"
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      value={value || ''}
                                      onChange={(e) => {
                                        const parsedValue = parseFloat(e.target.value) || 0
                                        if (col.isCurrentWeek) {
                                          const newKpiActuals = { ...currentSnapshot?.kpi_actuals }
                                          newKpiActuals[kpi.id] = parsedValue
                                          updateCurrentSnapshot({ kpi_actuals: newKpiActuals })
                                        } else {
                                          const newKpiActuals = { ...col.snapshot?.kpi_actuals }
                                          newKpiActuals[kpi.id] = parsedValue
                                          updatePastSnapshot(col.snapshot || null, { kpi_actuals: newKpiActuals })
                                        }
                                      }}
                                      onKeyDown={handleKeyDown}
                                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                                      placeholder="0"
                                    />
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-900 text-sm">
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

        {/* Manage Metrics Modal */}
        {dashboardPreferences && (
          <ManageMetricsModal
            isOpen={isManageMetricsOpen}
            onClose={() => setIsManageMetricsOpen(false)}
            preferences={dashboardPreferences}
            kpis={kpis}
            onSave={savePreferences}
            businessId={businessId}
            userId={userId}
            onKpiCreated={handleKpiCreated}
          />
        )}
      </div>
    </div>
  )
}
