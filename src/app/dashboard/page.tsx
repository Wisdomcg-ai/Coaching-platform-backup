'use client'

import { useState } from 'react'
import { Target, TrendingUp } from 'lucide-react'
import AskCoachModal from '@/components/dashboard/AskCoachModal'
import { useDashboardData } from './hooks/useDashboardData'
import {
  DashboardHeader,
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

  // Calculate rock status for header
  const rocksOnTrack = data.rocks.filter(r => r.status === 'on_track' || r.status === 'completed').length
  const rocksAtRisk = data.rocks.filter(r => r.status === 'at_risk' || (r.status === 'not_started' && r.progressPercentage === 0)).length

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <DashboardError error={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <DashboardHeader
          onRefresh={refresh}
          rocksOnTrack={rocksOnTrack}
          rocksAtRisk={rocksAtRisk}
        />

        {/* Top Row: Annual Goals, 90-Day Goals, Quarterly Rocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GoalsCard
            title="Annual Goals"
            goals={data.annualGoals}
            icon={Target}
            emptyStateText="No annual goals set"
            emptyStateCta="Set Your Goals"
            emptyStateHref="/goals?step=1"
          />

          <GoalsCard
            title="90-Day Goals"
            subtitle={getQuarterDisplayName(data.currentQuarter)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  )
}
