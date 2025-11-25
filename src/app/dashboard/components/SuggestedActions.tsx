'use client'

import Link from 'next/link'
import { Rocket, Calendar, MessageCircle, TrendingUp, Target, ArrowRight, Zap } from 'lucide-react'
import type { SuggestedAction } from '../types'

interface SuggestedActionsProps {
  actions?: SuggestedAction[]
}

function getActionIcon(icon: SuggestedAction['icon']) {
  switch (icon) {
    case 'rock':
      return Rocket
    case 'review':
      return Calendar
    case 'coach':
      return MessageCircle
    case 'forecast':
      return TrendingUp
    case 'goal':
      return Target
    default:
      return Target
  }
}

function getPriorityStyle(priority: SuggestedAction['priority']) {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-amber-50 hover:bg-amber-100',
        border: 'border-amber-200',
        iconBg: 'bg-amber-500',
        iconColor: 'text-white'
      }
    case 'medium':
      return {
        bg: 'bg-slate-50 hover:bg-slate-100',
        border: 'border-slate-200',
        iconBg: 'bg-slate-600',
        iconColor: 'text-white'
      }
    case 'low':
      return {
        bg: 'bg-white hover:bg-slate-50',
        border: 'border-slate-200',
        iconBg: 'bg-teal-500',
        iconColor: 'text-white'
      }
  }
}

const defaultActions: SuggestedAction[] = [
  {
    id: 'review-forecast',
    label: 'Review financial forecast',
    description: 'Stay on top of the numbers',
    href: '/finances/forecast',
    priority: 'low',
    icon: 'forecast'
  },
  {
    id: 'one-page-plan',
    label: 'Update your One Page Plan',
    description: 'Keep strategy aligned',
    href: '/one-page-plan',
    priority: 'low',
    icon: 'goal'
  },
  {
    id: 'ask-coach',
    label: 'Ask your coach a question',
    description: 'Get expert guidance',
    href: '#ask-coach',
    priority: 'low',
    icon: 'coach'
  }
]

export default function SuggestedActions({ actions }: SuggestedActionsProps) {
  const displayActions = actions && actions.length > 0 ? actions : defaultActions

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Suggested Actions</h3>
            <p className="text-xs text-slate-500">Based on your current priorities</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {displayActions.map((action) => {
            const Icon = getActionIcon(action.icon)
            const style = getPriorityStyle(action.priority)

            return (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center gap-4 p-3 rounded-lg border ${style.border} ${style.bg} transition-all group`}
              >
                <div className={`w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className={`h-5 w-5 ${style.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
