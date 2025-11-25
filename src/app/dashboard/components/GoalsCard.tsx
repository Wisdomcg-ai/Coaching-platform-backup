'use client'

import Link from 'next/link'
import { Target, TrendingUp, type LucideIcon } from 'lucide-react'
import type { FinancialGoals } from '../types'
import { formatCurrency, formatPercent } from '../utils/formatters'

interface GoalsCardProps {
  title: string
  goals: FinancialGoals | null
  icon: LucideIcon
  emptyStateText: string
  emptyStateCta: string
  emptyStateHref: string
}

export default function GoalsCard({
  title,
  goals,
  icon: Icon,
  emptyStateText,
  emptyStateCta,
  emptyStateHref
}: GoalsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>

      {goals ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(goals.revenue)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Gross Profit</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(goals.grossProfit)}</p>
              <span className="text-sm font-semibold text-gray-600">
                {formatPercent(goals.grossMargin)}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Net Profit</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(goals.netProfit)}</p>
              <span className="text-sm font-semibold text-gray-600">
                {formatPercent(goals.netMargin)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Icon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-3">{emptyStateText}</p>
          <Link
            href={emptyStateHref}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            {emptyStateCta} →
          </Link>
        </div>
      )}
    </div>
  )
}
