'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FinancialGoals, Rock, DashboardData, DashboardError } from '../types'

interface UseDashboardDataReturn {
  data: DashboardData
  isLoading: boolean
  error: DashboardError | null
  businessId: string | null
  userId: string | null
  refresh: () => Promise<void>
}

type TeamMembersMap = Record<string, string>

/**
 * Calculate the current fiscal quarter based on Australian financial year (Jul-Jun)
 */
function getCurrentQuarter(): 'q1' | 'q2' | 'q3' | 'q4' {
  const now = new Date()
  const month = now.getMonth() // 0-indexed (0 = Jan, 6 = Jul)

  // Australian FY: Q1 = Jul-Sep, Q2 = Oct-Dec, Q3 = Jan-Mar, Q4 = Apr-Jun
  if (month >= 6 && month <= 8) return 'q1'   // Jul, Aug, Sep
  if (month >= 9 && month <= 11) return 'q2'  // Oct, Nov, Dec
  if (month >= 0 && month <= 2) return 'q3'   // Jan, Feb, Mar
  return 'q4' // Apr, May, Jun
}

/**
 * Calculate financial margins from raw values
 */
function calculateGoals(revenue: number, grossProfit: number, netProfit: number): FinancialGoals {
  return {
    revenue,
    grossProfit,
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    netProfit,
    netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
  }
}

export function useDashboardData(): UseDashboardDataReturn {
  const supabase = useMemo(() => createClient(), [])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<DashboardError | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [data, setData] = useState<DashboardData>({
    annualGoals: null,
    quarterlyGoals: null,
    currentQuarter: getCurrentQuarter(),
    rocks: [],
    weeklyGoals: []
  })

  /**
   * Build a lookup map from assigned_to IDs to actual names
   * IDs are stored as "owner-{businessId}" or "role-{businessId}-{index}"
   */
  const buildTeamMembersMap = useCallback(async (bId: string): Promise<TeamMembersMap> => {
    const map: TeamMembersMap = {}

    const { data: profile } = await supabase
      .from('business_profiles')
      .select('owner_info, key_roles')
      .eq('id', bId)
      .single()

    if (!profile) return map

    // Add owner from owner_info
    const ownerInfo = profile.owner_info as { owner_name?: string } | null
    if (ownerInfo?.owner_name) {
      map[`owner-${bId}`] = ownerInfo.owner_name
    }

    // Add team members from key_roles
    const keyRoles = profile.key_roles as Array<{ name?: string }> | null
    if (keyRoles && Array.isArray(keyRoles)) {
      keyRoles.forEach((role, index) => {
        if (role.name?.trim()) {
          map[`role-${bId}-${index}`] = role.name
        }
      })
    }

    return map
  }, [supabase])

  const loadAnnualGoals = useCallback(async (bId: string): Promise<FinancialGoals | null> => {
    const { data, error } = await supabase
      .from('business_financial_goals')
      .select('revenue_year1, gross_profit_year1, net_profit_year1')
      .eq('business_id', bId)
      .single()

    if (error || !data) return null

    const revenue = parseFloat(data.revenue_year1) || 0
    const grossProfit = parseFloat(data.gross_profit_year1) || 0
    const netProfit = parseFloat(data.net_profit_year1) || 0

    if (revenue === 0 && grossProfit === 0 && netProfit === 0) return null

    return calculateGoals(revenue, grossProfit, netProfit)
  }, [supabase])

  const loadQuarterlyGoals = useCallback(async (bId: string, quarter: string): Promise<FinancialGoals | null> => {
    const { data, error } = await supabase
      .from('business_financial_goals')
      .select('quarterly_targets')
      .eq('business_id', bId)
      .single()

    if (error || !data?.quarterly_targets) return null

    const targets = data.quarterly_targets
    const revenueQ = parseFloat(targets.revenue?.[quarter]) || 0
    const grossProfitQ = parseFloat(targets.grossProfit?.[quarter]) || 0
    const netProfitQ = parseFloat(targets.netProfit?.[quarter]) || 0

    if (revenueQ === 0 && grossProfitQ === 0 && netProfitQ === 0) return null

    return calculateGoals(revenueQ, grossProfitQ, netProfitQ)
  }, [supabase])

  const loadRocks = useCallback(async (bId: string, quarter: string, teamMap: TeamMembersMap): Promise<Rock[]> => {
    const { data, error } = await supabase
      .from('strategic_initiatives')
      .select('id, title, assigned_to, status, progress_percentage')
      .eq('business_id', bId)
      .eq('step_type', quarter)
      .order('order_index', { ascending: true })
      .limit(4)

    if (error || !data) return []

    return data.map(rock => ({
      id: rock.id,
      title: rock.title,
      // Convert assigned_to ID to actual name using team map
      owner: rock.assigned_to
        ? (teamMap[rock.assigned_to] || rock.assigned_to)
        : 'Unassigned',
      // Use actual status if available, otherwise default to not_started
      status: (rock.status as Rock['status']) || 'not_started',
      // Use actual progress if available
      progressPercentage: rock.progress_percentage || 0
    }))
  }, [supabase])

  const loadWeeklyGoals = useCallback(async (bId: string, uId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('next_week_goals')
      .eq('business_id', bId)
      .eq('user_id', uId)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single()

    if (error || !data?.next_week_goals) return []

    return data.next_week_goals
  }, [supabase])

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setError({
          type: 'auth',
          message: 'Please sign in to view your dashboard',
          details: authError?.message
        })
        setIsLoading(false)
        return
      }

      setUserId(user.id)

      // Get business profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const bId = profile?.id || user.id
      setBusinessId(bId)

      // Determine current quarter
      const currentQuarter = getCurrentQuarter()

      // Build team members map first (needed for rock owner names)
      const teamMap = await buildTeamMembersMap(bId)

      // Load all data in parallel
      const [annualGoals, quarterlyGoals, rocks, weeklyGoals] = await Promise.all([
        loadAnnualGoals(bId),
        loadQuarterlyGoals(bId, currentQuarter),
        loadRocks(bId, currentQuarter, teamMap),
        loadWeeklyGoals(bId, user.id)
      ])

      setData({
        annualGoals,
        quarterlyGoals,
        currentQuarter,
        rocks,
        weeklyGoals
      })

      setIsLoading(false)
    } catch (err) {
      setError({
        type: 'network',
        message: 'Failed to load dashboard data',
        details: err instanceof Error ? err.message : 'Unknown error'
      })
      setIsLoading(false)
    }
  }, [supabase, buildTeamMembersMap, loadAnnualGoals, loadQuarterlyGoals, loadRocks, loadWeeklyGoals])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    data,
    isLoading,
    error,
    businessId,
    userId,
    refresh: loadDashboardData
  }
}
