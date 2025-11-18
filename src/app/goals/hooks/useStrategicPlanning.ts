// /app/goals/hooks/useStrategicPlanning.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import { FinancialData, CoreMetricsData, KPIData, StrategicInitiative, YearType, MonthlyTargetsData } from '../types'
import { STANDARD_KPIS, INDUSTRY_KPIS } from '../utils/constants'
import { FinancialService } from '../services/financial-service'
import { KPIService } from '../services/kpi-service'
import { StrategicPlanningService } from '../services/strategic-planning-service'
import { OperationalActivitiesService, OperationalActivity } from '../services/operational-activities-service'
import { createClient } from '@/lib/supabase/client'

interface KeyAction {
  id: string
  action: string
  owner?: string
  dueDate?: string
}

export function useStrategicPlanning() {
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [industry, setIndustry] = useState<string>('building_construction')
  const supabase = createClient()

  // Step 1: Financial Data & KPIs - Initialize with empty defaults to prevent hydration mismatch
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: { current: 0, year1: 0, year2: 0, year3: 0 },
    grossProfit: { current: 0, year1: 0, year2: 0, year3: 0 },
    grossMargin: { current: 0, year1: 0, year2: 0, year3: 0 },
    netProfit: { current: 0, year1: 0, year2: 0, year3: 0 },
    netMargin: { current: 0, year1: 0, year2: 0, year3: 0 },
    customers: { current: 0, year1: 0, year2: 0, year3: 0 },
    employees: { current: 0, year1: 0, year2: 0, year3: 0 }
  })

  const [coreMetrics, setCoreMetrics] = useState<CoreMetricsData>({
    leadsPerMonth: { current: 0, year1: 0, year2: 0, year3: 0 },
    conversionRate: { current: 0, year1: 0, year2: 0, year3: 0 },
    avgTransactionValue: { current: 0, year1: 0, year2: 0, year3: 0 },
    teamHeadcount: { current: 0, year1: 0, year2: 0, year3: 0 },
    ownerHoursPerWeek: { current: 0, year1: 0, year2: 0, year3: 0 }
  })

  const [kpis, setKpis] = useState<KPIData[]>([])

  const [yearType, setYearType] = useState<YearType>('FY')

  // Step 2: Strategic Ideas
  const [strategicIdeas, setStrategicIdeas] = useState<StrategicInitiative[]>([])

  // Step 3: Roadmap Suggestions
  const [roadmapSuggestions, setRoadmapSuggestions] = useState<StrategicInitiative[]>([])

  // Step 4: 12-Month Initiatives
  const [twelveMonthInitiatives, setTwelveMonthInitiatives] = useState<StrategicInitiative[]>([])

  // Step 5: Annual Plan by Quarter
  const [annualPlanByQuarter, setAnnualPlanByQuarter] = useState<Record<string, StrategicInitiative[]>>({
    q1: [],
    q2: [],
    q3: [],
    q4: []
  })

  // Step 5: Quarterly Targets
  const [quarterlyTargets, setQuarterlyTargets] = useState<Record<string, { q1: string; q2: string; q3: string; q4: string }>>({})

  // Step 5: Monthly Targets (for 90-day sprint planning)
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTargetsData>({})

  // Step 6: 90-Day Sprint
  const [sprintFocus, setSprintFocus] = useState<StrategicInitiative[]>([])
  const [sprintKeyActions, setSprintKeyActions] = useState<KeyAction[]>([])

  // Operational Activities
  const [operationalActivities, setOperationalActivities] = useState<OperationalActivity[]>([])

  // Update financial value with auto-calculation
  const updateFinancialValue = useCallback(
    (metric: keyof FinancialData, period: 'current' | 'year1' | 'year2' | 'year3', value: number, isPercentage?: boolean) => {
      setFinancialData(prev => {
        const newData = {
          ...prev,
          [metric]: {
            ...prev[metric],
            [period]: value
          }
        }

        // Auto-calculate related metrics
        const revenue = metric === 'revenue' ? value : prev.revenue[period]

        if (revenue > 0) {
          // If Gross Margin % changes, calculate Gross Profit $
          if (metric === 'grossMargin') {
            newData.grossProfit = {
              ...newData.grossProfit,
              [period]: Math.round(revenue * (value / 100))
            }
          }
          // If Gross Profit $ changes, calculate Gross Margin %
          else if (metric === 'grossProfit') {
            newData.grossMargin = {
              ...newData.grossMargin,
              [period]: Math.round((value / revenue) * 100 * 100) / 100 // Round to 2 decimals
            }
          }
          // If Net Margin % changes, calculate Net Profit $
          else if (metric === 'netMargin') {
            newData.netProfit = {
              ...newData.netProfit,
              [period]: Math.round(revenue * (value / 100))
            }
          }
          // If Net Profit $ changes, calculate Net Margin %
          else if (metric === 'netProfit') {
            newData.netMargin = {
              ...newData.netMargin,
              [period]: Math.round((value / revenue) * 100 * 100) / 100 // Round to 2 decimals
            }
          }
          // If Revenue changes, recalculate both Gross Profit and Net Profit based on existing margins
          else if (metric === 'revenue') {
            const grossMarginPercent = prev.grossMargin[period]
            const netMarginPercent = prev.netMargin[period]

            if (grossMarginPercent > 0) {
              newData.grossProfit = {
                ...newData.grossProfit,
                [period]: Math.round(value * (grossMarginPercent / 100))
              }
            }

            if (netMarginPercent > 0) {
              newData.netProfit = {
                ...newData.netProfit,
                [period]: Math.round(value * (netMarginPercent / 100))
              }
            }
          }
        }

        return newData
      })
    },
    []
  )

  // Update core metrics value
  const updateCoreMetric = useCallback(
    (metric: keyof CoreMetricsData, period: 'current' | 'year1' | 'year2' | 'year3', value: number) => {
      setCoreMetrics(prev => ({
        ...prev,
        [metric]: {
          ...prev[metric],
          [period]: value
        }
      }))
    },
    []
  )

  // Update KPI value
  const updateKPIValue = useCallback(
    (kpiId: string, field: 'currentValue' | 'year1Target' | 'year2Target' | 'year3Target', value: number) => {
      setKpis(prev =>
        prev.map(kpi =>
          kpi.id === kpiId
            ? { ...kpi, [field]: value }
            : kpi
        )
      )
    },
    []
  )

  // Add KPI
  const addKPI = useCallback((kpi: KPIData) => {
    setKpis(prev => {
      // Check if KPI already exists
      if (prev.some(k => k.id === kpi.id)) {
        return prev
      }
      // Add new KPI with initialized values
      const newKPI = {
        ...kpi,
        currentValue: kpi.currentValue || 0,
        year1Target: kpi.year1Target || 0,
        year2Target: kpi.year2Target || 0,
        year3Target: kpi.year3Target || 0
      }
      return [...prev, newKPI]
    })
  }, [])

  // Delete KPI
  const deleteKPI = useCallback((kpiId: string) => {
    setKpis(prev => prev.filter(k => k.id !== kpiId))
  }, [])

  // Save all data to Supabase with auto-debouncing
  const saveAllData = useCallback(async () => {
    try {
      if (!businessId || !userId) {
        console.log('[Strategic Planning] ⚠️ Cannot save: missing businessId or userId')
        return false
      }

      console.log('[Strategic Planning] 💾 Saving to Supabase...')
      console.log('[Strategic Planning] 📊 Annual Plan by Quarter:', {
        q1: annualPlanByQuarter.q1?.map(i => ({ id: i.id, title: i.title, assignedTo: i.assignedTo })),
        q2: annualPlanByQuarter.q2?.map(i => ({ id: i.id, title: i.title, assignedTo: i.assignedTo })),
        q3: annualPlanByQuarter.q3?.map(i => ({ id: i.id, title: i.title, assignedTo: i.assignedTo })),
        q4: annualPlanByQuarter.q4?.map(i => ({ id: i.id, title: i.title, assignedTo: i.assignedTo }))
      })

      // Save financial data, core metrics, and quarterly targets
      const financialResult = await FinancialService.saveFinancialGoals(
        businessId,
        userId,
        financialData,
        yearType,
        coreMetrics,
        quarterlyTargets
      )

      if (!financialResult.success) {
        setError(`Failed to save financial data: ${financialResult.error}`)
        return false
      }

      // Save KPIs
      const kpiResult = await KPIService.saveUserKPIs(businessId, userId, kpis)

      if (!kpiResult.success) {
        setError(`Failed to save KPIs: ${kpiResult.error}`)
        return false
      }

      // Save strategic ideas (Step 2)
      const strategicIdeasResult = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        strategicIdeas,
        'strategic_ideas'
      )

      if (!strategicIdeasResult.success) {
        setError(`Failed to save strategic ideas: ${strategicIdeasResult.error}`)
        return false
      }

      // Save roadmap suggestions (Step 3)
      const roadmapResult = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        roadmapSuggestions,
        'roadmap'
      )

      if (!roadmapResult.success) {
        setError(`Failed to save roadmap: ${roadmapResult.error}`)
        return false
      }

      // Save 12-month initiatives (Step 4)
      const twelveMonthResult = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        twelveMonthInitiatives,
        'twelve_month'
      )

      if (!twelveMonthResult.success) {
        setError(`Failed to save 12-month initiatives: ${twelveMonthResult.error}`)
        return false
      }

      // Save quarterly plans (Step 5)
      const q1Result = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        annualPlanByQuarter.q1,
        'q1'
      )

      if (!q1Result.success) {
        setError(`Failed to save Q1 plan: ${q1Result.error}`)
        return false
      }

      const q2Result = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        annualPlanByQuarter.q2,
        'q2'
      )

      if (!q2Result.success) {
        setError(`Failed to save Q2 plan: ${q2Result.error}`)
        return false
      }

      const q3Result = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        annualPlanByQuarter.q3,
        'q3'
      )

      if (!q3Result.success) {
        setError(`Failed to save Q3 plan: ${q3Result.error}`)
        return false
      }

      const q4Result = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        annualPlanByQuarter.q4,
        'q4'
      )

      if (!q4Result.success) {
        setError(`Failed to save Q4 plan: ${q4Result.error}`)
        return false
      }

      // Save sprint focus (Step 6)
      const sprintResult = await StrategicPlanningService.saveInitiatives(
        businessId,
        userId,
        sprintFocus,
        'sprint'
      )

      if (!sprintResult.success) {
        setError(`Failed to save sprint focus: ${sprintResult.error}`)
        return false
      }

      // Save sprint key actions (Step 6)
      const sprintActionsResult = await StrategicPlanningService.saveSprintActions(
        businessId,
        userId,
        sprintKeyActions
      )

      if (!sprintActionsResult.success) {
        setError(`Failed to save sprint actions: ${sprintActionsResult.error}`)
        return false
      }

      // Save operational activities
      const operationalActivitiesResult = await OperationalActivitiesService.saveActivities(
        businessId,
        userId,
        operationalActivities
      )

      if (!operationalActivitiesResult.success) {
        setError(`Failed to save operational activities: ${operationalActivitiesResult.error}`)
        return false
      }

      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        const allData = {
          financialData,
          coreMetrics,
          kpis,
          yearType,
          strategicIdeas,
          roadmapSuggestions,
          twelveMonthInitiatives,
          annualPlanByQuarter,
          quarterlyTargets,
          monthlyTargets,
          sprintFocus,
          sprintKeyActions,
          operationalActivities,
          lastSaved: new Date().toISOString()
        }
        localStorage.setItem('strategicPlan', JSON.stringify(allData))
      }

      console.log('[Strategic Planning] ✅ Successfully saved all data')
      return true
    } catch (err) {
      console.error('[Strategic Planning] ❌ Error saving data:', err)
      setError('Failed to save data')
      return false
    }
  }, [
    businessId,
    userId,
    financialData,
    coreMetrics,
    kpis,
    yearType,
    strategicIdeas,
    roadmapSuggestions,
    twelveMonthInitiatives,
    annualPlanByQuarter,
    quarterlyTargets,
    sprintFocus,
    sprintKeyActions,
    operationalActivities
  ])

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          console.log('[Strategic Planning] ⚠️ No user logged in')
          setIsLoading(false)
          return
        }

        setUserId(user.id)

        // Get business profile to get business_id and industry
        const { data: profile } = await supabase
          .from('business_profiles')
          .select('id, industry')
          .eq('user_id', user.id)
          .single()

        const bizId = profile?.id || user.id

        setBusinessId(bizId)

        // Set industry from profile, fallback to default
        if (profile?.industry) {
          setIndustry(profile.industry)
          console.log(`[Strategic Planning] ✅ Loaded industry: ${profile.industry}`)
        }

        console.log(`[Strategic Planning] 📥 Loading data for business: ${bizId}`)

        // Load financial data, core metrics, and quarterly targets from Supabase
        const {
          financialData: loadedFinancialData,
          coreMetrics: loadedCoreMetrics,
          yearType: loadedYearType,
          quarterlyTargets: loadedQuarterlyTargets
        } = await FinancialService.loadFinancialGoals(bizId)

        // Load KPIs from Supabase
        const loadedKPIs = await KPIService.getUserKPIs(bizId)

        // Set loaded data or defaults
        if (loadedFinancialData) {
          setFinancialData(loadedFinancialData)
          setYearType(loadedYearType)
          console.log('[Strategic Planning] ✅ Loaded financial data from Supabase')
        }

        if (loadedCoreMetrics) {
          setCoreMetrics(loadedCoreMetrics)
          console.log('[Strategic Planning] ✅ Loaded core metrics from Supabase')
        }

        if (loadedQuarterlyTargets && Object.keys(loadedQuarterlyTargets).length > 0) {
          setQuarterlyTargets(loadedQuarterlyTargets)
          console.log(`[Strategic Planning] ✅ Loaded quarterly targets from Supabase`)
        }

        if (loadedKPIs && loadedKPIs.length > 0) {
          setKpis(loadedKPIs)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedKPIs.length} KPIs from Supabase`)
        }

        // Load strategic planning data from Supabase (Steps 2-6)

        // Step 2: Strategic Ideas
        const loadedStrategicIdeas = await StrategicPlanningService.loadInitiatives(bizId, 'strategic_ideas')
        if (loadedStrategicIdeas && loadedStrategicIdeas.length > 0) {
          setStrategicIdeas(loadedStrategicIdeas)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedStrategicIdeas.length} strategic ideas from Supabase`)
        }

        // Step 3: Roadmap Suggestions
        const loadedRoadmap = await StrategicPlanningService.loadInitiatives(bizId, 'roadmap')
        if (loadedRoadmap && loadedRoadmap.length > 0) {
          setRoadmapSuggestions(loadedRoadmap)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedRoadmap.length} roadmap suggestions from Supabase`)
        }

        // Step 4: 12-Month Initiatives
        const loadedTwelveMonth = await StrategicPlanningService.loadInitiatives(bizId, 'twelve_month')
        if (loadedTwelveMonth && loadedTwelveMonth.length > 0) {
          setTwelveMonthInitiatives(loadedTwelveMonth)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedTwelveMonth.length} twelve-month initiatives from Supabase`)
        }

        // Step 5: Annual Plan by Quarter
        const loadedQ1 = await StrategicPlanningService.loadInitiatives(bizId, 'q1')
        const loadedQ2 = await StrategicPlanningService.loadInitiatives(bizId, 'q2')
        const loadedQ3 = await StrategicPlanningService.loadInitiatives(bizId, 'q3')
        const loadedQ4 = await StrategicPlanningService.loadInitiatives(bizId, 'q4')

        console.log('[Strategic Planning] 🔍 Q2 loaded from database:', loadedQ2.map(i => ({ id: i.id, title: i.title, assignedTo: i.assignedTo })))

        setAnnualPlanByQuarter({
          q1: loadedQ1 || [],
          q2: loadedQ2 || [],
          q3: loadedQ3 || [],
          q4: loadedQ4 || []
        })
        console.log(`[Strategic Planning] ✅ Loaded quarterly plans from Supabase (Q1: ${loadedQ1.length}, Q2: ${loadedQ2.length}, Q3: ${loadedQ3.length}, Q4: ${loadedQ4.length})`)

        // Step 6: 90-Day Sprint
        const loadedSprintFocus = await StrategicPlanningService.loadInitiatives(bizId, 'sprint')
        if (loadedSprintFocus && loadedSprintFocus.length > 0) {
          setSprintFocus(loadedSprintFocus)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedSprintFocus.length} sprint focus items from Supabase`)
        }

        const loadedSprintActions = await StrategicPlanningService.loadSprintActions(bizId)
        if (loadedSprintActions && loadedSprintActions.length > 0) {
          setSprintKeyActions(loadedSprintActions)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedSprintActions.length} sprint key actions from Supabase`)
        }

        // Load operational activities
        const loadedOperationalActivities = await OperationalActivitiesService.loadActivities(bizId)
        if (loadedOperationalActivities && loadedOperationalActivities.length > 0) {
          setOperationalActivities(loadedOperationalActivities)
          console.log(`[Strategic Planning] ✅ Loaded ${loadedOperationalActivities.length} operational activities from Supabase`)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('[Strategic Planning] ❌ Error loading data:', err)
        setError('Failed to load saved data')
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Auto-save to Supabase when data changes (debounced)
  useEffect(() => {
    if (!businessId || !userId || isLoading) return

    const timeoutId = setTimeout(() => {
      saveAllData()
    }, 2000) // Save 2 seconds after last change

    return () => clearTimeout(timeoutId)
  }, [
    financialData,
    kpis,
    yearType,
    strategicIdeas,
    roadmapSuggestions,
    twelveMonthInitiatives,
    annualPlanByQuarter,
    quarterlyTargets,
    sprintFocus,
    sprintKeyActions,
    operationalActivities,
    businessId,
    userId,
    isLoading,
    saveAllData
  ])

  return {
    // Loading & Error
    isLoading,
    error,

    // Step 1
    financialData,
    updateFinancialValue,
    coreMetrics,
    updateCoreMetric,
    kpis,
    updateKPIValue,
    addKPI,
    deleteKPI,
    yearType,
    setYearType,
    businessId,
    industry,

    // Step 2
    strategicIdeas,
    setStrategicIdeas,

    // Step 3
    roadmapSuggestions,
    setRoadmapSuggestions,

    // Step 4
    twelveMonthInitiatives,
    setTwelveMonthInitiatives,

    // Step 5
    annualPlanByQuarter,
    setAnnualPlanByQuarter,
    quarterlyTargets,
    setQuarterlyTargets,
    monthlyTargets,
    setMonthlyTargets,

    // Step 6
    sprintFocus,
    setSprintFocus,
    sprintKeyActions,
    setSprintKeyActions,

    // Operational Activities
    operationalActivities,
    setOperationalActivities,

    // Save
    saveAllData
  }
}