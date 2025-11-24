'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Printer, Loader2, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react'

interface OnePagePlanData {
  // Vision/Mission/Values
  vision: string
  mission: string
  coreValues: string[]

  // SWOT
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]

  // Financial & Metrics
  financialGoals: {
    year3: { revenue: number; grossProfit: number; netProfit: number }
    year1: { revenue: number; grossProfit: number; netProfit: number }
    quarter: { revenue: number; grossProfit: number; netProfit: number }
  }

  coreMetrics: {
    year3: { [key: string]: any }
    year1: { [key: string]: any }
    quarter: { [key: string]: any }
  }

  kpis: Array<{
    name: string
    category: string
    year3Target: number
    year1Target: number
    quarterTarget: number
  }>

  // Strategic Initiatives (12-month plan)
  strategicInitiatives: Array<{
    title: string
    quarters: string[] // ['Q1', 'Q3'] etc
    owner?: string
  }>

  // Current Quarter Rocks (90-day sprint)
  quarterlyRocks: Array<{
    action: string
    owner?: string
    dueDate?: string
  }>

  currentQuarter: string
  planYear: number
  companyName: string

  // Owner Personal Goals
  ownerGoals: {
    desiredHoursPerWeek?: number
    currentHoursPerWeek?: number
    primaryGoal?: string
    timeHorizon?: string
    exitStrategy?: string
  }
}

export default function OnePagePlan() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<OnePagePlanData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  // Auto-reload data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAllData()
      }
    }

    const handleFocus = () => {
      loadAllData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      console.log('[One Page Plan] 🔍 User:', user?.id)

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get business_id from business_profiles (same as strategic planning wizard)
      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('id, industry, owner_info')
        .eq('user_id', user.id)
        .single()

      console.log('[One Page Plan] 🏢 Business Profile query:', { profile, error: profileError })

      // Fallback to user.id if no profile (same as strategic planning wizard)
      const businessId = profile?.id || user.id

      // Parse owner_info if it exists (JSONB field)
      const ownerInfo = profile?.owner_info || {}

      // Build team members lookup map (ID -> name) from localStorage
      const teamMembersMap: Record<string, string> = {}

      // Try to load team members from localStorage (same as Step5AnnualPlan)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('team_members')
        if (stored) {
          try {
            const teamMembers = JSON.parse(stored)
            if (Array.isArray(teamMembers)) {
              teamMembers.forEach((member: any) => {
                if (member.id && member.name) {
                  teamMembersMap[member.id] = member.name
                }
              })
            }
          } catch (e) {
            console.warn('[One Page Plan] Failed to parse team members from localStorage')
          }
        }
      }

      console.log('[One Page Plan] 👥 Team Members Map:', teamMembersMap)

      // Get company name from businesses table
      const { data: businessData } = await supabase
        .from('businesses')
        .select('name')
        .eq('owner_id', user.id)
        .limit(1)
        .single()

      const companyName = businessData?.name || 'Your Company'
      console.log('[One Page Plan] ✅ Business ID:', businessId, 'Name:', companyName)

      // Load Vision/Mission/Values
      const { data: visionMissionData, error: vmError } = await supabase
        .from('strategy_data')
        .select('vision_mission')
        .eq('user_id', user.id)
        .single()

      console.log('[One Page Plan] 📖 Vision/Mission data:', { data: visionMissionData, error: vmError })

      const visionMission = visionMissionData?.vision_mission || {}

      // Load SWOT (Note: SWOT uses user.id as business_id)
      const currentYear = new Date().getFullYear()
      const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`

      console.log('[One Page Plan] 📅 Looking for SWOT:', { year: currentYear, quarter: currentQuarter, userId: user.id })

      // Try to get any SWOT data first
      const { data: allSwotData, error: allSwotError } = await supabase
        .from('swot_analyses')
        .select(`
          *,
          swot_items (
            id,
            category,
            title,
            description
          )
        `)
        .eq('business_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      console.log('[One Page Plan] 💡 All SWOT data:', { data: allSwotData, error: allSwotError })

      // Use the most recent SWOT if found
      const swotData = allSwotData && allSwotData.length > 0 ? allSwotData[0] : null
      const swotItems = swotData?.swot_items || []

      console.log('[One Page Plan] 💡 SWOT items extracted:', swotItems?.length)

      // Load Financial Goals & Core Metrics
      const { data: financialGoals, error: finError } = await supabase
        .from('business_financial_goals')
        .select('*')
        .eq('business_id', businessId)
        .single()

      console.log('[One Page Plan] 💰 Financial Goals data:', { data: financialGoals, error: finError })

      // Load KPIs
      const { data: kpisData, error: kpiError } = await supabase
        .from('business_kpis')
        .select('*')
        .eq('business_id', businessId)

      console.log('[One Page Plan] 📊 KPIs data:', { count: kpisData?.length, error: kpiError })

      // Load Quarterly Targets
      const { data: quarterlyTargetsData, error: qtError } = await supabase
        .from('business_financial_goals')
        .select('quarterly_targets')
        .eq('business_id', businessId)
        .single()

      console.log('[One Page Plan] 📅 Quarterly Targets data:', { data: quarterlyTargetsData, error: qtError })

      // Quarterly targets is already an object (Supabase auto-parses JSONB)
      const allQuarterlyTargets = quarterlyTargetsData?.quarterly_targets || null
      const currentQuarterTargets = allQuarterlyTargets?.[currentQuarter.toLowerCase()] || {}

      console.log('[One Page Plan] 📅 Current Quarter Targets:', { quarter: currentQuarter, targets: currentQuarterTargets })

      // Load Strategic Initiatives (12-month plan)
      const { data: initiatives, error: initError } = await supabase
        .from('strategic_initiatives')
        .select('*')
        .eq('business_id', businessId)
        .eq('step_type', 'twelve_month')
        .order('order_index', { ascending: true })

      console.log('[One Page Plan] 🎯 Strategic Initiatives:', { count: initiatives?.length, error: initError })

      // Load current quarter initiatives for rocks
      const currentQuarterStepType = currentQuarter.toLowerCase() // 'q1', 'q2', 'q3', or 'q4'
      const { data: quarterInitiatives, error: quarterError } = await supabase
        .from('strategic_initiatives')
        .select('*')
        .eq('business_id', businessId)
        .eq('step_type', currentQuarterStepType)
        .order('order_index', { ascending: true })

      console.log(`[One Page Plan] 🪨 ${currentQuarter} Initiatives:`, { count: quarterInitiatives?.length, error: quarterError })

      // Note: We use quarterInitiatives (from strategic_initiatives table with current quarter filter)
      // instead of sprint_key_actions because sprint_key_actions doesn't have a quarter field
      // This ensures Quarterly Rocks always show the current quarter's initiatives
      console.log('[One Page Plan] ⚡ Using Quarter Initiatives for Rocks:', { count: quarterInitiatives?.length })

      // Debug: Log what we're about to assemble
      console.log('[One Page Plan] 🔧 Assembling data...')
      console.log('  - Vision Mission:', visionMission)
      console.log('  - SWOT Items:', swotItems?.length)
      console.log('  - Financial Goals structure:', financialGoals ? Object.keys(financialGoals) : 'null')
      console.log('  - KPIs count:', kpisData?.length)

      // Assemble the data
      const planData: OnePagePlanData = {
        vision: visionMission.vision_statement || '',
        mission: visionMission.mission_statement || '',
        coreValues: (visionMission.core_values || []).filter((v: string) => v.trim()),

        strengths: swotItems.filter((item: any) => item.category === 'strength').slice(0, 5).map((item: any) => item.title),
        weaknesses: swotItems.filter((item: any) => item.category === 'weakness').slice(0, 5).map((item: any) => item.title),
        opportunities: swotItems.filter((item: any) => item.category === 'opportunity').slice(0, 5).map((item: any) => item.title),
        threats: swotItems.filter((item: any) => item.category === 'threat').slice(0, 5).map((item: any) => item.title),

        financialGoals: {
          year3: {
            revenue: financialGoals?.revenue_year3 || 0,
            grossProfit: financialGoals?.gross_profit_year3 || 0,
            netProfit: financialGoals?.net_profit_year3 || 0,
          },
          year1: {
            revenue: financialGoals?.revenue_year1 || 0,
            grossProfit: financialGoals?.gross_profit_year1 || 0,
            netProfit: financialGoals?.net_profit_year1 || 0,
          },
          quarter: {
            revenue: currentQuarterTargets?.revenue || 0,
            grossProfit: currentQuarterTargets?.grossProfit || 0,
            netProfit: currentQuarterTargets?.netProfit || 0,
          },
        },

        coreMetrics: {
          year3: {
            leadsPerMonth: financialGoals?.leads_per_month_year3 || 0,
            conversionRate: financialGoals?.conversion_rate_year3 || 0,
            avgTransactionValue: financialGoals?.avg_transaction_value_year3 || 0,
            teamHeadcount: financialGoals?.team_headcount_year3 || 0,
            ownerHoursPerWeek: financialGoals?.owner_hours_per_week_year3 || 0,
          },
          year1: {
            leadsPerMonth: financialGoals?.leads_per_month_year1 || 0,
            conversionRate: financialGoals?.conversion_rate_year1 || 0,
            avgTransactionValue: financialGoals?.avg_transaction_value_year1 || 0,
            teamHeadcount: financialGoals?.team_headcount_year1 || 0,
            ownerHoursPerWeek: financialGoals?.owner_hours_per_week_year1 || 0,
          },
          quarter: {
            leadsPerMonth: currentQuarterTargets?.leadsPerMonth || 0,
            conversionRate: currentQuarterTargets?.conversionRate || 0,
            avgTransactionValue: currentQuarterTargets?.avgTransactionValue || 0,
            teamHeadcount: currentQuarterTargets?.teamHeadcount || 0,
            ownerHoursPerWeek: currentQuarterTargets?.ownerHoursPerWeek || 0,
          },
        },

        kpis: (kpisData || []).slice(0, 5).map((kpi: any) => ({
          name: kpi.kpi_name || kpi.name,
          category: kpi.category || '',
          year3Target: kpi.year3_target || 0,
          year1Target: kpi.year1_target || 0,
          quarterTarget: currentQuarterTargets?.kpis?.[kpi.kpi_name || kpi.name] || 0,
        })),

        strategicInitiatives: (initiatives || []).map((init: any) => ({
          title: init.title,
          quarters: [], // We'll need to load quarterly assignments
          owner: init.assigned_to ? (teamMembersMap[init.assigned_to] || init.assigned_to) : undefined
        })),

        quarterlyRocks: (quarterInitiatives || []).map((init: any) => ({
          action: init.title,
          owner: init.assigned_to ? (teamMembersMap[init.assigned_to] || init.assigned_to) : undefined,
          dueDate: init.timeline
        })),

        currentQuarter,
        planYear: currentYear,
        companyName,

        ownerGoals: {
          desiredHoursPerWeek: ownerInfo?.desired_hours,
          currentHoursPerWeek: ownerInfo?.current_hours,
          primaryGoal: ownerInfo?.primary_goal,
          timeHorizon: ownerInfo?.time_horizon,
          exitStrategy: ownerInfo?.exit_strategy
        }
      }

      console.log('[One Page Plan] ✅ Final assembled data:', planData)
      console.log('[One Page Plan] 📋 Strategic Initiatives Array:', planData.strategicInitiatives)
      console.log('[One Page Plan] 📋 First Initiative:', planData.strategicInitiatives[0])
      console.log('[One Page Plan] 🪨 Quarterly Rocks Array:', planData.quarterlyRocks)
      console.log('[One Page Plan] 🪨 First Rock:', planData.quarterlyRocks[0])
      console.log('[One Page Plan] 👤 Owner Goals:', planData.ownerGoals)
      setData(planData)
    } catch (err) {
      console.error('[One Page Plan] ❌ Error loading data:', err)
      console.error('[One Page Plan] ❌ Error details:', err instanceof Error ? err.message : String(err))
      console.error('[One Page Plan] ❌ Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      setError(`Failed to load plan data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your One Page Plan...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error loading plan</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Navigation - Hidden when printing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/goals')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Edit Strategic Plan
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* One Page Plan - Printable */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="border-b-4 border-gray-900 p-6 print:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">{data.companyName}</h1>
                <p className="text-base text-gray-600 mt-1">One Page Strategic Plan</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900">Year {data.planYear}</p>
                <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                <p className="text-sm text-red-600 mt-1 font-medium">CONFIDENTIAL</p>
              </div>
            </div>
          </div>

          {/* Vision, Mission & Core Values Row */}
          <div className="grid grid-cols-3 border-b border-gray-300">
            <div className="border-r border-gray-300 flex flex-col">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <h3 className="text-sm font-bold text-blue-900 uppercase text-center">Vision (Where We're Going)</h3>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-base text-gray-900 leading-relaxed text-center">{data.vision || 'Not set'}</p>
              </div>
            </div>
            <div className="border-r border-gray-300 flex flex-col">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <h3 className="text-sm font-bold text-blue-900 uppercase text-center">Mission (Why We Exist)</h3>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-base text-gray-900 leading-relaxed text-center">{data.mission || 'Not set'}</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <h3 className="text-sm font-bold text-blue-900 uppercase text-center">Core Values</h3>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <ul className="space-y-1.5 text-center">
                  {data.coreValues.slice(0, 8).map((value, idx) => (
                    <li key={idx} className="text-sm text-gray-900">
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SWOT Row */}
          <div className="grid grid-cols-4 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300">
              <h3 className="text-sm font-bold text-green-700 uppercase mb-2">Strengths</h3>
              <ol className="space-y-1.5">
                {data.strengths.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-800">{idx + 1}. {item}</li>
                ))}
              </ol>
            </div>

            <div className="p-4 border-r border-gray-300">
              <h3 className="text-sm font-bold text-orange-700 uppercase mb-2">Weaknesses</h3>
              <ol className="space-y-1.5">
                {data.weaknesses.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-800">{idx + 1}. {item}</li>
                ))}
              </ol>
            </div>

            <div className="p-4 border-r border-gray-300">
              <h3 className="text-sm font-bold text-blue-700 uppercase mb-2">Opportunities</h3>
              <ol className="space-y-1.5">
                {data.opportunities.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-800">{idx + 1}. {item}</li>
                ))}
              </ol>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-bold text-red-700 uppercase mb-2">Threats</h3>
              <ol className="space-y-1.5">
                {data.threats.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-800">{idx + 1}. {item}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Goals & Metrics Table */}
          <div className="border-b border-gray-300">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-300">
              <h3 className="text-sm font-bold text-blue-900 uppercase">Goals & Key Metrics</h3>
            </div>
            <table className="w-full text-xs">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[25%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-left p-2 font-semibold text-gray-700">Metric</th>
                  <th className="text-center p-2 font-semibold text-gray-700">3-Year Goal</th>
                  <th className="text-center p-2 font-semibold text-blue-700">1-Year Goal</th>
                  <th className="text-center p-2 font-semibold text-green-700">{data.currentQuarter} Target</th>
                </tr>
              </thead>
              <tbody>
                {/* Financial Goals Section */}
                <tr className="bg-gray-100">
                  <td colSpan={4} className="p-2 font-bold text-gray-700 text-xs uppercase">Financial Goals</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Revenue</td>
                  <td className="p-2 text-center">{formatCurrency(data.financialGoals.year3.revenue)}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{formatCurrency(data.financialGoals.year1.revenue)}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{formatCurrency(data.financialGoals.quarter.revenue)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Gross Profit</td>
                  <td className="p-2 text-center">{formatCurrency(data.financialGoals.year3.grossProfit)}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{formatCurrency(data.financialGoals.year1.grossProfit)}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{formatCurrency(data.financialGoals.quarter.grossProfit)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Net Profit</td>
                  <td className="p-2 text-center">{formatCurrency(data.financialGoals.year3.netProfit)}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{formatCurrency(data.financialGoals.year1.netProfit)}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{formatCurrency(data.financialGoals.quarter.netProfit)}</td>
                </tr>

                {/* Core Business Metrics Section */}
                <tr className="bg-gray-100">
                  <td colSpan={4} className="p-2 font-bold text-gray-700 text-xs uppercase">Core Business Metrics</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Leads per Month</td>
                  <td className="p-2 text-center">{data.coreMetrics.year3.leadsPerMonth || 0}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{data.coreMetrics.year1.leadsPerMonth || 0}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{data.coreMetrics.quarter.leadsPerMonth || 0}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Conversion Rate (%)</td>
                  <td className="p-2 text-center">{data.coreMetrics.year3.conversionRate || 0}%</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{data.coreMetrics.year1.conversionRate || 0}%</td>
                  <td className="p-2 text-center font-semibold text-green-700">{data.coreMetrics.quarter.conversionRate || 0}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Avg Transaction Value</td>
                  <td className="p-2 text-center">{formatCurrency(data.coreMetrics.year3.avgTransactionValue || 0)}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{formatCurrency(data.coreMetrics.year1.avgTransactionValue || 0)}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{formatCurrency(data.coreMetrics.quarter.avgTransactionValue || 0)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Team Headcount (FTE)</td>
                  <td className="p-2 text-center">{data.coreMetrics.year3.teamHeadcount || 0}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{data.coreMetrics.year1.teamHeadcount || 0}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{data.coreMetrics.quarter.teamHeadcount || 0}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold pl-4">Owner Hours per Week</td>
                  <td className="p-2 text-center">{data.coreMetrics.year3.ownerHoursPerWeek || 0}</td>
                  <td className="p-2 text-center font-semibold text-blue-900">{data.coreMetrics.year1.ownerHoursPerWeek || 0}</td>
                  <td className="p-2 text-center font-semibold text-green-700">{data.coreMetrics.quarter.ownerHoursPerWeek || 0}</td>
                </tr>

                {/* Top KPIs Section */}
                <tr className="bg-gray-100">
                  <td colSpan={4} className="p-2 font-bold text-gray-700 text-xs uppercase">Key Performance Indicators</td>
                </tr>
                {data.kpis.slice(0, 5).map((kpi, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="p-2 font-semibold pl-4">{kpi.name}</td>
                    <td className="p-2 text-center">{kpi.year3Target}</td>
                    <td className="p-2 text-center font-semibold text-blue-900">{kpi.year1Target}</td>
                    <td className="p-2 text-center font-semibold text-green-700">{kpi.quarterTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strategic Initiatives & Quarterly Rocks - Aligned with columns */}
          <div className="grid grid-cols-[30%_20%_25%_25%] border-t border-gray-300">
            {/* Owner Personal Goals - Left columns (only show if data exists) */}
            {(data.ownerGoals.primaryGoal || data.ownerGoals.desiredHoursPerWeek || data.ownerGoals.timeHorizon || data.ownerGoals.exitStrategy) ? (
              <div className="col-span-2 border-r border-gray-300">
                <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                  <h3 className="text-xs font-bold text-blue-900 uppercase">What I Want From This Business</h3>
                </div>
                <div className="p-3 space-y-3">
                  {data.ownerGoals.primaryGoal && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Primary Goal</p>
                      <p className="text-sm font-bold text-gray-900">{data.ownerGoals.primaryGoal}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {data.ownerGoals.timeHorizon && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Time Horizon</p>
                        <p className="text-xs text-gray-900">{data.ownerGoals.timeHorizon}</p>
                      </div>
                    )}
                    {data.ownerGoals.exitStrategy && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Exit Strategy</p>
                        <p className="text-xs text-gray-900">{data.ownerGoals.exitStrategy}</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {data.ownerGoals.currentHoursPerWeek && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Current Hours/Week</p>
                        <p className="text-sm font-bold text-gray-900">{data.ownerGoals.currentHoursPerWeek} hrs</p>
                      </div>
                    )}
                    {data.ownerGoals.desiredHoursPerWeek && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Desired Hours/Week</p>
                        <p className="text-sm font-bold text-gray-900">{data.ownerGoals.desiredHoursPerWeek} hrs</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Empty placeholder when no owner goals data
              <div className="col-span-2 border-r border-gray-300 bg-gray-50"></div>
            )}

            {/* Strategic Initiatives - Under 1-Year Goal */}
            <div className="border-r border-gray-300">
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <h3 className="text-xs font-bold text-blue-900 uppercase">12-Month Initiatives</h3>
              </div>
              <div className="p-3">
                <ol className="space-y-1.5">
                  {data.strategicInitiatives.slice(0, 12).map((initiative, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="font-medium text-gray-900">{idx + 1}. {initiative.title}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Current Quarter Rocks - Under Quarter Target */}
            <div>
              <div className="bg-blue-50 px-3 py-2 border-b border-gray-300">
                <h3 className="text-xs font-bold text-blue-900 uppercase">{data.currentQuarter} Rocks</h3>
              </div>
              <div className="p-3">
                <ol className="space-y-1.5">
                  {data.quarterlyRocks.slice(0, 5).map((rock, idx) => (
                    <li key={idx} className="text-xs">
                      <div className="font-medium text-gray-900">{idx + 1}. {rock.action}</div>
                      {(rock.owner || rock.dueDate) && (
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          {rock.owner && <span>Owner: {rock.owner}</span>}
                          {rock.owner && rock.dueDate && <span> • </span>}
                          {rock.dueDate && <span>Due: {new Date(rock.dueDate).toLocaleDateString()}</span>}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 p-4 bg-gray-50 text-center print:hidden">
            <p className="text-xs text-gray-600">
              Generated with Business Coaching Platform • {new Date().toLocaleDateString()} •
              <button onClick={() => router.push('/goals')} className="text-blue-600 hover:underline ml-1">
                Edit Strategic Plan →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
