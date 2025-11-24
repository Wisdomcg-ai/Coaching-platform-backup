'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, CheckSquare, XCircle, MessageCircle, TrendingUp, Target, Rocket } from 'lucide-react'
import AskCoachModal from '@/components/dashboard/AskCoachModal'
import { createClient } from '@/lib/supabase/client'

interface AnnualGoals {
  revenue: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
}

interface QuarterlyGoals {
  revenue: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
}

interface Rock {
  id: string
  title: string
  owner: string
  status: string
  progressPercentage: number
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Data state
  const [annualGoals, setAnnualGoals] = useState<AnnualGoals | null>(null)
  const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoals | null>(null)
  const [rocks, setRocks] = useState<Rock[]>([])
  const [weeklyGoals, setWeeklyGoals] = useState<string[]>([])

  // Modal state
  const [isAskCoachOpen, setIsAskCoachOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        setLoading(false)
        return
      }
      setUserId(user.id)

      // Get business profile (use business_profiles table like the goals wizard does)
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // If no profile exists, use user.id as business_id (fallback)
      const bId = profile?.id || user.id
      setBusinessId(bId)

      console.log('Dashboard loading data for business ID:', bId)

      // Load all data in parallel
      await Promise.all([
        loadAnnualGoals(bId),
        loadQuarterlyGoals(bId),
        loadRocks(bId),
        loadWeeklyGoals(bId, user.id)
      ])

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const loadAnnualGoals = async (bId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_financial_goals')
        .select('*')
        .eq('business_id', bId)
        .single()

      if (error) {
        console.error('Error loading annual goals:', error)
        return
      }

      if (data) {
        // Parse year1 goals from the database
        const revenue = parseFloat(data.revenue_year1) || 0
        const grossProfit = parseFloat(data.gross_profit_year1) || 0
        const netProfit = parseFloat(data.net_profit_year1) || 0

        setAnnualGoals({
          revenue,
          grossProfit,
          grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
          netProfit,
          netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
        })
      }
    } catch (error) {
      console.error('Error loading annual goals:', error)
    }
  }

  const loadQuarterlyGoals = async (bId: string) => {
    try {
      // Get quarterly targets from business_financial_goals
      const { data, error } = await supabase
        .from('business_financial_goals')
        .select('quarterly_targets')
        .eq('business_id', bId)
        .single()

      console.log('Quarterly targets data:', data)
      console.log('Quarterly targets error:', error)

      if (error) {
        console.log('No quarterly targets found, will show placeholder')
        return
      }

      if (data && data.quarterly_targets) {
        // quarterly_targets is a JSONB field with keys like 'revenue', 'grossProfit', etc.
        // Each key has q1, q2, q3, q4 values
        const targets = data.quarterly_targets
        console.log('Quarterly targets structure:', JSON.stringify(targets, null, 2))

        // Try to find the first quarter with data
        const quarters = ['q1', 'q2', 'q3', 'q4']

        for (const quarter of quarters) {
          const revenueQ = targets.revenue?.[quarter] ? parseFloat(targets.revenue[quarter]) : 0
          const grossProfitQ = targets.grossProfit?.[quarter] ? parseFloat(targets.grossProfit[quarter]) : 0
          const netProfitQ = targets.netProfit?.[quarter] ? parseFloat(targets.netProfit[quarter]) : 0

          console.log(`${quarter.toUpperCase()} values:`, { revenueQ, grossProfitQ, netProfitQ })

          if (revenueQ > 0 || grossProfitQ > 0 || netProfitQ > 0) {
            console.log(`Using ${quarter.toUpperCase()} targets for dashboard`)
            setQuarterlyGoals({
              revenue: revenueQ,
              grossProfit: grossProfitQ,
              grossMargin: revenueQ > 0 ? (grossProfitQ / revenueQ) * 100 : 0,
              netProfit: netProfitQ,
              netMargin: revenueQ > 0 ? (netProfitQ / revenueQ) * 100 : 0
            })
            return
          }
        }

        console.log('No quarterly targets found with values > 0')
      }
    } catch (error) {
      console.error('Error loading quarterly goals:', error)
    }
  }

  const loadRocks = async (bId: string) => {
    try {
      // Try to load from each quarter, starting with Q1
      const quarters = ['q1', 'q2', 'q3', 'q4']

      for (const quarter of quarters) {
        const { data, error } = await supabase
          .from('strategic_initiatives')
          .select('*')
          .eq('business_id', bId)
          .eq('step_type', quarter)
          .order('order_index', { ascending: true })
          .limit(4)

        if (!error && data && data.length > 0) {
          console.log(`Found ${data.length} rocks in ${quarter.toUpperCase()}`)
          setRocks(data.map(rock => ({
            id: rock.id,
            title: rock.title,
            owner: rock.assigned_to || 'Unassigned',
            status: rock.priority === 'high' ? 'on_track' : 'not_started',
            progressPercentage: 0 // We don't have progress tracking yet
          })))
          return
        }
      }

      console.log('No quarterly rocks found in any quarter')
    } catch (error) {
      console.error('Error loading rocks:', error)
    }
  }

  const loadWeeklyGoals = async (bId: string, uId: string) => {
    try {
      // Get the most recent completed weekly review
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('business_id', bId)
        .eq('user_id', uId)
        .order('week_start_date', { ascending: false })
        .limit(1)
        .single()

      console.log('Weekly review data:', data)
      console.log('Weekly review error:', error)

      if (error) {
        console.log('No weekly review found, will show placeholder:', error.message)
        return
      }

      if (data && data.next_week_goals) {
        console.log('Setting weekly goals:', data.next_week_goals)
        setWeeklyGoals(data.next_week_goals)
      } else {
        console.log('No next_week_goals found in weekly review')
      }
    } catch (error) {
      console.error('Error loading weekly goals:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toLocaleString()}`
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getRockStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-500'
      case 'at_risk':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-blue-500'
      default:
        return 'bg-gray-400'
    }
  }

  const handleAskCoach = async (question: string, priority: 'normal' | 'urgent') => {
    if (!businessId || !userId) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/coach-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, priority, businessId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit question')
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Display */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Command Centre</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Top Row: Annual Goals, 90-Day Goals, Q1 Rocks */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Annual Goals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Annual Goals</h3>
            </div>
          </div>
          {annualGoals ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualGoals.revenue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Gross Profit</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualGoals.grossProfit)}</p>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatPercent(annualGoals.grossMargin)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Net Profit</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualGoals.netProfit)}</p>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatPercent(annualGoals.netMargin)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">No annual goals set</p>
              <Link
                href="/goals?step=1"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Set Your Goals →
              </Link>
            </div>
          )}
        </div>

        {/* 90-Day Goals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">90-Day Goals</h3>
            </div>
          </div>
          {quarterlyGoals ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(quarterlyGoals.revenue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Gross Profit</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(quarterlyGoals.grossProfit)}</p>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatPercent(quarterlyGoals.grossMargin)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Net Profit</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(quarterlyGoals.netProfit)}</p>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatPercent(quarterlyGoals.netMargin)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">No quarterly sprint set</p>
              <Link
                href="/goals?step=4"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create 90-Day Sprint →
              </Link>
            </div>
          )}
        </div>

        {/* Quarterly Rocks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quarterly Rocks</h3>
            </div>
          </div>
          {rocks.length > 0 ? (
            <div className="space-y-3">
              {rocks.map((rock) => (
                <div key={rock.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{rock.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Owner: {rock.owner}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 ml-2 bg-blue-50 px-2 py-1 rounded">
                      {rock.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getRockStatusColor(rock.status)}`}
                      style={{ width: `${rock.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">No rocks defined</p>
              <Link
                href="/goals?step=4"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Set Your Rocks →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Weekly Priorities, Ask Your Coach */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* This Week's Priorities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Priorities</h3>
          {weeklyGoals.length > 0 ? (
            <div className="space-y-2">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{goal}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-3">No weekly goals set</p>
              <Link
                href="/reviews/weekly"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Complete Weekly Review →
              </Link>
            </div>
          )}
        </div>

        {/* Ask Your Coach */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="text-center py-4">
            <button
              onClick={() => setIsAskCoachOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Ask Your Coach
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Your coach will respond within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-6">
          <Link
            href="/business-dashboard"
            className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
              <BarChart3 className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-semibold text-gray-900 mb-1">Business Dashboard</span>
            <span className="text-xs text-gray-500 text-center">View metrics & analytics</span>
          </Link>

          <Link
            href="/todo"
            className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
              <CheckSquare className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-semibold text-gray-900 mb-1">To-Do List</span>
            <span className="text-xs text-gray-500 text-center">Manage your tasks</span>
          </Link>

          <Link
            href="/stop-doing"
            className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
              <XCircle className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-semibold text-gray-900 mb-1">Stop Doing List</span>
            <span className="text-xs text-gray-500 text-center">Eliminate time wasters</span>
          </Link>
        </div>
      </div>

      {/* Ask Coach Modal */}
      <AskCoachModal
        isOpen={isAskCoachOpen}
        onClose={() => setIsAskCoachOpen(false)}
        onSubmit={handleAskCoach}
      />
    </div>
  )
}
