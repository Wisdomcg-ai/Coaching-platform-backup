'use client'

import Link from 'next/link'
import { RefreshCw, AlertTriangle, Target, Calendar, PartyPopper } from 'lucide-react'
import type { DashboardInsight } from '../types'

interface InsightHeaderProps {
  insight?: DashboardInsight
  onRefresh: () => void
}

function getInsightIcon(type: DashboardInsight['type']) {
  switch (type) {
    case 'rock_attention':
      return AlertTriangle
    case 'goal_deadline':
      return Target
    case 'weekly_review':
      return Calendar
    case 'celebration':
      return PartyPopper
    default:
      return Target
  }
}

function getInsightStyle(priority: DashboardInsight['priority']) {
  switch (priority) {
    case 'high':
      return {
        iconBg: 'bg-amber-500',
        iconColor: 'text-white',
        badge: 'bg-amber-500/20 text-amber-300'
      }
    case 'medium':
      return {
        iconBg: 'bg-slate-600',
        iconColor: 'text-white',
        badge: 'bg-slate-600 text-slate-300'
      }
    case 'low':
      return {
        iconBg: 'bg-teal-500',
        iconColor: 'text-white',
        badge: 'bg-teal-500/20 text-teal-300'
      }
  }
}

export default function InsightHeader({ insight, onRefresh }: InsightHeaderProps) {
  const defaultInsight: DashboardInsight = {
    type: 'goal_deadline',
    title: 'Welcome Back',
    message: 'Review your progress and stay focused on what matters most.',
    priority: 'low'
  }

  const activeInsight = insight || defaultInsight
  const Icon = getInsightIcon(activeInsight.type)
  const style = getInsightStyle(activeInsight.priority)

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-11 h-11 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Icon className={`h-5 w-5 ${style.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-white">
                {activeInsight.title}
              </h2>
              {activeInsight.priority === 'high' && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                  Action needed
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeInsight.message}
            </p>

            {activeInsight.actionLabel && activeInsight.actionHref && (
              <Link
                href={activeInsight.actionHref}
                className="inline-flex items-center mt-4 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-400 transition-colors shadow-md"
              >
                {activeInsight.actionLabel}
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
