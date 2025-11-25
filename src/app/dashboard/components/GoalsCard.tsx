'use client'

import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import type { FinancialGoals } from '../types'
import { formatCurrency } from '../utils/formatters'
import ProgressRing from './ProgressRing'

interface GoalsCardProps {
  title: string
  goals: FinancialGoals | null
  icon: LucideIcon
  emptyStateText: string
  emptyStateCta: string
  emptyStateHref: string
  subtitle?: string
  daysRemaining?: number
  timeProgress?: number // % of time elapsed in period
}

export default function GoalsCard({
  title,
  goals,
  icon: Icon,
  emptyStateText,
  emptyStateCta,
  emptyStateHref,
  subtitle,
  daysRemaining,
  timeProgress = 0
}: GoalsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
              <Icon className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {daysRemaining !== undefined && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {daysRemaining}d left
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {goals ? (
          <div className="flex items-start gap-5">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <ProgressRing progress={timeProgress} size={72} strokeWidth={5} />
              <p className="text-xs text-slate-500 text-center mt-1">Time elapsed</p>
            </div>

            {/* Goals Data */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Revenue Target</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(goals.revenue)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Gross Profit</p>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(goals.grossProfit)}</p>
                  <p className="text-xs text-teal-600 font-medium">{goals.grossMargin.toFixed(0)}% margin</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Profit</p>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(goals.netProfit)}</p>
                  <p className="text-xs text-teal-600 font-medium">{goals.netMargin.toFixed(0)}% margin</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">{emptyStateText}</p>
            <p className="text-sm text-slate-400 mb-4">Set targets to track progress</p>
            <Link
              href={emptyStateHref}
              className="inline-flex items-center px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
            >
              {emptyStateCta}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
