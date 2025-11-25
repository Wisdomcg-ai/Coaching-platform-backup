'use client'

import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import type { FinancialGoals } from '../types'
import { formatCurrency, formatPercent } from '../utils/formatters'

interface GoalsCardProps {
  title: string
  goals: FinancialGoals | null
  icon: LucideIcon
  emptyStateText: string
  emptyStateCta: string
  emptyStateHref: string
  subtitle?: string
}

export default function GoalsCard({
  title,
  goals,
  icon: Icon,
  emptyStateText,
  emptyStateCta,
  emptyStateHref,
  subtitle
}: GoalsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {goals ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Revenue</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(goals.revenue)}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Gross Profit</p>
                <p className="text-lg font-semibold text-slate-800">{formatCurrency(goals.grossProfit)}</p>
                <p className="text-sm text-teal-600 font-medium">{formatPercent(goals.grossMargin)} margin</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Net Profit</p>
                <p className="text-lg font-semibold text-slate-800">{formatCurrency(goals.netProfit)}</p>
                <p className="text-sm text-teal-600 font-medium">{formatPercent(goals.netMargin)} margin</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
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
