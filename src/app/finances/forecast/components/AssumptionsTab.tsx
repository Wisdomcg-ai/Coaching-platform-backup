'use client'

import React, { useState } from 'react'
import { Target, TrendingUp, Save, RefreshCw, AlertCircle, Sparkles } from 'lucide-react'
import type { FinancialForecast, DistributionMethod } from '../types'
import OpExBulkControls from './OpExBulkControls'

interface AssumptionsTabProps {
  forecast: FinancialForecast
  onSave: (data: {
    revenue_goal: number
    gross_profit_goal: number
    net_profit_goal: number
    revenue_distribution_method: DistributionMethod
    cogs_percentage: number
  }) => void
  onImportFromAnnualPlan: () => void
  onApplyBulkOpExIncrease: (percentageIncrease: number) => void
  isSaving: boolean
}

export default function AssumptionsTab({
  forecast,
  onSave,
  onImportFromAnnualPlan,
  onApplyBulkOpExIncrease,
  isSaving
}: AssumptionsTabProps) {
  const [goals, setGoals] = useState({
    revenue: forecast.revenue_goal || 0,
    grossProfit: forecast.gross_profit_goal || 0,
    netProfit: forecast.net_profit_goal || 0
  })

  const [distributionMethod, setDistributionMethod] = useState<DistributionMethod>(
    forecast.revenue_distribution_method || 'even'
  )

  const [cogsPercentage, setCogsPercentage] = useState<number>(() => {
    // Load from saved percentage first
    if (forecast.cogs_percentage !== undefined && forecast.cogs_percentage !== null) {
      return forecast.cogs_percentage * 100 // Convert from decimal (0.40) to percentage (40)
    }
    // Otherwise calculate from goals
    if (forecast.revenue_goal && forecast.gross_profit_goal) {
      const cogs = forecast.revenue_goal - forecast.gross_profit_goal
      return (cogs / forecast.revenue_goal) * 100
    }
    return 40
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Auto-calculate GP (NP will be calculated from actual OpEx lines in P&L table)
  const calculatedGP = goals.revenue * (1 - cogsPercentage / 100)

  const handleSave = () => {
    onSave({
      revenue_goal: goals.revenue,
      gross_profit_goal: calculatedGP,
      net_profit_goal: 0, // Will be calculated from P&L lines
      revenue_distribution_method: distributionMethod,
      cogs_percentage: cogsPercentage / 100
    })
  }

  const hasGoals = goals.revenue > 0

  return (
    <div className="p-6 space-y-8">
      {/* Annual Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">FY{forecast.fiscal_year} Annual Goals</h2>
              <p className="text-sm text-gray-500">Set your financial targets for the year</p>
            </div>
          </div>
          <button
            onClick={onImportFromAnnualPlan}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Import from Annual Plan
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Revenue Goal
            </label>
            <input
              type="number"
              value={goals.revenue || ''}
              onChange={(e) => setGoals({ ...goals, revenue: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-lg font-bold text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gross Profit Goal
            </label>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculatedGP)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Auto-calculated: {(100 - cogsPercentage).toFixed(1)}% margin
            </div>
          </div>
        </div>
      </div>

      {hasGoals && (
        <>
          {/* Revenue Distribution Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Revenue Distribution</h2>
                <p className="text-sm text-gray-500">How should revenue be spread across the year?</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setDistributionMethod('even')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  distributionMethod === 'even'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`text-sm font-bold mb-1 ${
                  distributionMethod === 'even' ? 'text-green-900' : 'text-gray-900'
                }`}>
                  Even Split
                </div>
                <div className="text-xs text-gray-500">
                  Equal amount each month ({formatCurrency(goals.revenue / 12)}/mo)
                </div>
              </button>

              <button
                onClick={() => setDistributionMethod('seasonal_pattern')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  distributionMethod === 'seasonal_pattern'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`text-sm font-bold mb-1 ${
                  distributionMethod === 'seasonal_pattern' ? 'text-green-900' : 'text-gray-900'
                }`}>
                  Seasonal Pattern
                </div>
                <div className="text-xs text-gray-500">
                  Repeat FY25 monthly pattern, scaled to goal
                </div>
              </button>

              <button
                onClick={() => setDistributionMethod('custom')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  distributionMethod === 'custom'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`text-sm font-bold mb-1 ${
                  distributionMethod === 'custom' ? 'text-green-900' : 'text-gray-900'
                }`}>
                  Custom
                </div>
                <div className="text-xs text-gray-500">
                  Set custom amounts in P&L table
                </div>
              </button>
            </div>
          </div>

          {/* Cost Assumptions Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Cost Assumptions</h2>
              <p className="text-sm text-gray-500">Set your cost structure</p>
            </div>

            {/* COGS */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost of Sales (COGS) %
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={cogsPercentage}
                  onChange={(e) => setCogsPercentage(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={cogsPercentage}
                  onChange={(e) => setCogsPercentage(parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2 text-sm font-bold text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-600">%</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                COGS: {formatCurrency(goals.revenue * (cogsPercentage / 100))} |
                GP Margin: {(100 - cogsPercentage).toFixed(1)}%
              </div>
            </div>

            {/* OpEx Quick Setup */}
            <div className="mt-4">
              <OpExBulkControls onApplyBulkIncrease={onApplyBulkOpExIncrease} />
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-900 mb-2">Forecast Summary</h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <div className="text-blue-700 mb-1">Revenue Goal</div>
                      <div className="font-bold text-blue-900 text-lg">{formatCurrency(goals.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-blue-700 mb-1">Gross Profit</div>
                      <div className="font-bold text-blue-900 text-lg">{formatCurrency(calculatedGP)}</div>
                      <div className="text-xs text-blue-600">{(100 - cogsPercentage).toFixed(1)}% margin</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-700">
                    💡 Operating expenses and net profit will be calculated line-by-line in the P&L Forecast tab
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || goals.revenue === 0}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save & Generate Forecast'}
            </button>
          </div>
        </>
      )}

      {!hasGoals && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Set Your Annual Revenue Goal</h3>
          <p className="text-sm text-gray-500">
            Enter your revenue target above to start building your forecast
          </p>
        </div>
      )}
    </div>
  )
}
