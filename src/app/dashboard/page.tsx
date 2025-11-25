'use client'

import { useState } from 'react'
import { Target, TrendingUp, RefreshCw } from 'lucide-react'
import AskCoachModal from '@/components/dashboard/AskCoachModal'
import { useDashboardData } from './hooks/useDashboardData'
import {
  GoalsCard,
  RocksCard,
  WeeklyPrioritiesCard,
  QuickActionsGrid,
  AskCoachCard,
  DashboardSkeleton,
  DashboardError
} from './components'
import { getQuarterDisplayName } from './utils/formatters'

export default function DashboardPage() {
  const { data, isLoading, error, businessId, userId, refresh } = useDashboardData()
  const [isAskCoachOpen, setIsAskCoachOpen] = useState(false)

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

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Show error state
  if (error) {
    return <DashboardError error={error} onRetry={refresh} />
  }

  return (
    <div className="space-y-6">
      {/* Header with date and refresh */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Command Centre</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={refresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-AU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Top Row: Annual Goals, 90-Day Goals, Quarterly Rocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <GoalsCard
          title="Annual Goals"
          goals={data.annualGoals}
          icon={Target}
          emptyStateText="No annual goals set"
          emptyStateCta="Set Your Goals"
          emptyStateHref="/goals?step=1"
        />

        <GoalsCard
          title={`90-Day Goals (${getQuarterDisplayName(data.currentQuarter)})`}
          goals={data.quarterlyGoals}
          icon={TrendingUp}
          emptyStateText="No quarterly targets set"
          emptyStateCta="Create 90-Day Sprint"
          emptyStateHref="/goals?step=4"
        />

        <RocksCard
          rocks={data.rocks}
          currentQuarter={data.currentQuarter}
        />
      </div>

      {/* Second Row: Weekly Priorities, Ask Your Coach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <WeeklyPrioritiesCard weeklyGoals={data.weeklyGoals} />
        <AskCoachCard onOpenModal={() => setIsAskCoachOpen(true)} />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid />

      {/* Ask Coach Modal */}
      <AskCoachModal
        isOpen={isAskCoachOpen}
        onClose={() => setIsAskCoachOpen(false)}
        onSubmit={handleAskCoach}
      />
    </div>
  )
}
