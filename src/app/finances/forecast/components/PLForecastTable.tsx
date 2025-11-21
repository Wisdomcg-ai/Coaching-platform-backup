'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, ChevronDown, ChevronRight, Calculator, TrendingUp, Lock, Unlock, Eye, Settings } from 'lucide-react'
import type { FinancialForecast, PLLine, ForecastMethod } from '../types'
import ForecastService from '../services/forecast-service'
import { ForecastingEngine } from '../services/forecasting-engine'
import OpExBulkControls from './OpExBulkControls'
import OpExLineControls from './OpExLineControls'

interface PLForecastTableProps {
  forecast: FinancialForecast
  plLines: PLLine[]
  onSave: (lines: PLLine[]) => void
}

export default function PLForecastTable({ forecast, plLines, onSave }: PLForecastTableProps) {
  const [lines, setLines] = useState<PLLine[]>(plLines)
  const [monthColumns, setMonthColumns] = useState<Array<{
    key: string
    label: string
    isActual: boolean
    isForecast: boolean
  }>>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Revenue']))
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [historicalDataLocked, setHistoricalDataLocked] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<'view' | 'setup'>('setup') // Toggle between view and setup modes

  useEffect(() => {
    // Calculate analysis for lines that don't already have it
    const actualMonthKeys = monthColumns.filter(c => c.isActual).map(c => c.key)
    if (actualMonthKeys.length > 0) {
      const linesWithAnalysis = plLines.map(line => ({
        ...line,
        // Only recalculate analysis if it doesn't exist - preserve existing forecast_method and analysis
        analysis: line.analysis || ForecastingEngine.calculateAnalysis(line, plLines, actualMonthKeys)
      }))
      setLines(linesWithAnalysis)
    } else {
      setLines(plLines)
    }
  }, [plLines, monthColumns])

  useEffect(() => {
    const columns = ForecastService.generateMonthColumns(
      forecast.actual_start_month,
      forecast.actual_end_month,
      forecast.forecast_start_month,
      forecast.forecast_end_month
    )
    console.log('[PLForecastTable] Generated columns:', {
      count: columns.length,
      columnKeys: columns.map(c => c.key),
      actualColumns: columns.filter(c => c.isActual).map(c => c.key),
      forecastColumns: columns.filter(c => c.isForecast).map(c => c.key)
    })
    if (lines.length > 0) {
      console.log('[PLForecastTable] First line data keys:', Object.keys(lines[0].actual_months || {}))
    }
    setMonthColumns(columns)
  }, [forecast, lines])

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lines.length > 0 && lines !== plLines) {
        onSave(lines)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [lines])

  const categories = ['Revenue', 'Cost of Sales', 'Operating Expenses', 'Other Income', 'Other Expenses']

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const addLine = (category: string) => {
    const newLine: PLLine = {
      account_name: 'New Account',
      category,
      sort_order: lines.filter(l => l.category === category).length,
      actual_months: {},
      forecast_months: {},
      is_manual: true
    }

    setLines([...lines, newLine])
  }

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLineName = (index: number, name: string) => {
    const updatedLines = [...lines]
    updatedLines[index].account_name = name
    setLines(updatedLines)
  }

  const evaluateFormula = (formula: string): number => {
    // Remove = sign if present
    const expr = formula.trim().startsWith('=') ? formula.trim().substring(1) : formula.trim()

    try {
      // Evaluate the mathematical expression
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expr)()

      if (isNaN(result) || !isFinite(result)) {
        return 0
      }

      return result
    } catch (e) {
      return 0
    }
  }

  const updateLineValue = (index: number, monthKey: string, value: number | string, isForecast: boolean) => {
    const updatedLines = [...lines]

    // Check if value is a formula (starts with =)
    if (typeof value === 'string' && value.trim().startsWith('=')) {
      const result = evaluateFormula(value)
      if (isForecast) {
        updatedLines[index].forecast_months[monthKey] = result
      } else {
        updatedLines[index].actual_months[monthKey] = result
      }
    } else {
      // Regular number input
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
      if (isForecast) {
        updatedLines[index].forecast_months[monthKey] = numValue
      } else {
        updatedLines[index].actual_months[monthKey] = numValue
      }
    }
    setLines(updatedLines)
  }

  const calculateCategoryTotal = (category: string, monthKey: string, isForecast: boolean): number => {
    return lines
      .filter(line => line.category === category)
      .reduce((sum, line) => {
        const months = isForecast ? line.forecast_months : line.actual_months
        return sum + (months[monthKey] || 0)
      }, 0)
  }

  const calculateGrossProfit = (monthKey: string, isForecast: boolean): number => {
    const revenue = calculateCategoryTotal('Revenue', monthKey, isForecast)
    const cogs = calculateCategoryTotal('Cost of Sales', monthKey, isForecast)
    return revenue - cogs
  }

  const calculateNetProfit = (monthKey: string, isForecast: boolean): number => {
    const revenue = calculateCategoryTotal('Revenue', monthKey, isForecast)
    const cogs = calculateCategoryTotal('Cost of Sales', monthKey, isForecast)
    const opex = calculateCategoryTotal('Operating Expenses', monthKey, isForecast)
    const otherIncome = calculateCategoryTotal('Other Income', monthKey, isForecast)
    const otherExpenses = calculateCategoryTotal('Other Expenses', monthKey, isForecast)
    return revenue - cogs - opex + otherIncome - otherExpenses
  }

  const calculateLineFY25Total = (line: PLLine): number => {
    // Sum all actual months (FY25)
    return Object.values(line.actual_months || {}).reduce((sum, val) => sum + val, 0)
  }

  const calculateLineFY26Total = (line: PLLine): number => {
    // Sum all forecast months (FY26)
    return Object.values(line.forecast_months || {}).reduce((sum, val) => sum + val, 0)
  }

  const calculateCategoryFY25Total = (category: string): number => {
    return lines
      .filter(line => line.category === category)
      .reduce((sum, line) => sum + calculateLineFY25Total(line), 0)
  }

  const calculateCategoryFY26Total = (category: string): number => {
    return lines
      .filter(line => line.category === category)
      .reduce((sum, line) => sum + calculateLineFY26Total(line), 0)
  }

  const calculateGrossProfitFY25Total = (): number => {
    const revenue = calculateCategoryFY25Total('Revenue')
    const cogs = calculateCategoryFY25Total('Cost of Sales')
    return revenue - cogs
  }

  const calculateGrossProfitFY26Total = (): number => {
    const revenue = calculateCategoryFY26Total('Revenue')
    const cogs = calculateCategoryFY26Total('Cost of Sales')
    return revenue - cogs
  }

  const calculateNetProfitFY25Total = (): number => {
    const revenue = calculateCategoryFY25Total('Revenue')
    const cogs = calculateCategoryFY25Total('Cost of Sales')
    const opex = calculateCategoryFY25Total('Operating Expenses')
    const otherIncome = calculateCategoryFY25Total('Other Income')
    const otherExpenses = calculateCategoryFY25Total('Other Expenses')
    return revenue - cogs - opex + otherIncome - otherExpenses
  }

  const calculateNetProfitFY26Total = (): number => {
    const revenue = calculateCategoryFY26Total('Revenue')
    const cogs = calculateCategoryFY26Total('Cost of Sales')
    const opex = calculateCategoryFY26Total('Operating Expenses')
    const otherIncome = calculateCategoryFY26Total('Other Income')
    const otherExpenses = calculateCategoryFY26Total('Other Expenses')
    return revenue - cogs - opex + otherIncome - otherExpenses
  }

  const formatCurrency = (value: number) => {
    if (value === 0) return '-'
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatInputValue = (value: number) => {
    if (!value || value === 0) return ''
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatAnalysis = (line: PLLine): string => {
    const analysis = line.analysis
    if (!analysis) return 'Calculating...'

    const parts: string[] = []

    if (line.category === 'Revenue') {
      if (analysis.pct_of_total_revenue !== undefined) {
        parts.push(`${analysis.pct_of_total_revenue.toFixed(1)}% of Revenue`)
      }
      if (analysis.fy_average_per_month !== undefined) {
        parts.push(`Avg: ${formatCurrency(analysis.fy_average_per_month)}/mo`)
      }
    } else if (line.category === 'Cost of Sales') {
      if (analysis.pct_of_revenue !== undefined) {
        parts.push(`${analysis.pct_of_revenue.toFixed(1)}% of Revenue`)
      }
      if (analysis.fy_average_per_month !== undefined) {
        parts.push(`Avg: ${formatCurrency(analysis.fy_average_per_month)}/mo`)
      }
    } else if (line.category === 'Operating Expenses') {
      if (analysis.fy_average_per_month !== undefined) {
        parts.push(`Avg: ${formatCurrency(analysis.fy_average_per_month)}/mo`)
      }
      if (analysis.trend_direction && analysis.trend_percentage !== undefined) {
        const arrow = analysis.trend_direction === 'up' ? '↑' : analysis.trend_direction === 'down' ? '↓' : '→'
        parts.push(`Trend: ${arrow}${Math.abs(analysis.trend_percentage).toFixed(1)}%`)
      }
    }

    return parts.join(' | ') || 'No data'
  }

  const updateForecastMethod = async (index: number, method: ForecastMethod) => {
    const updatedLines = [...lines]
    const line = updatedLines[index]

    // Set forecast method config
    line.forecast_method = {
      method,
      ...(method === 'straight_line' && { base_amount: line.analysis?.fy_average_per_month || 0 }),
      ...(method === 'growth_rate' && { growth_rate: 0.05, growth_type: 'MoM' as 'MoM' | 'YoY' }),
      ...(method === 'driver_based' && { driver_percentage: 0.25 })
    }

    console.log('🔧 updateForecastMethod called:', {
      lineIndex: index,
      lineName: line.account_name,
      method,
      config: line.forecast_method,
      currentForecastMonths: Object.keys(line.forecast_months || {}).length
    })

    // Recalculate forecasts
    const actualMonthKeys = monthColumns.filter(c => c.isActual).map(c => c.key)
    const forecastMonthKeys = monthColumns.filter(c => c.isForecast).map(c => c.key)

    console.log('📊 Recalculating with:', {
      actualMonthCount: actualMonthKeys.length,
      forecastMonthCount: forecastMonthKeys.length,
      totalLines: updatedLines.length
    })

    const recalculatedLines = ForecastingEngine.recalculateAllForecasts(
      updatedLines,
      actualMonthKeys,
      forecastMonthKeys
    )

    console.log('✅ Recalculated line forecast:', {
      lineName: recalculatedLines[index].account_name,
      forecastMonths: recalculatedLines[index].forecast_months,
      totalForecast: Object.values(recalculatedLines[index].forecast_months || {}).reduce((s, v) => s + v, 0)
    })

    setLines(recalculatedLines)

    // Persist to database using the onSave callback
    onSave(recalculatedLines)
  }

  // Handler for bulk OpEx increase
  const handleBulkOpExIncrease = (percentageIncrease: number) => {
    const updatedLines = lines.map(line => {
      // Only apply to Operating Expenses lines
      if (line.category !== 'Operating Expenses') {
        return line
      }

      // Set to seasonal_pattern with the specified percentage increase
      return {
        ...line,
        forecast_method: {
          method: 'seasonal_pattern' as ForecastMethod,
          percentage_increase: percentageIncrease / 100, // Convert from 5 to 0.05
          base_amount: line.analysis?.fy_average_per_month || 0
        }
      }
    })

    // Recalculate forecasts
    const actualMonthKeys = monthColumns.filter(c => c.isActual).map(c => c.key)
    const forecastMonthKeys = monthColumns.filter(c => c.isForecast).map(c => c.key)

    const recalculatedLines = ForecastingEngine.recalculateAllForecasts(
      updatedLines,
      actualMonthKeys,
      forecastMonthKeys
    )

    setLines(recalculatedLines)
    onSave(recalculatedLines)
  }

  // Handler for per-line method change
  const handleLineMethodChange = (index: number, method: ForecastMethod) => {
    const updatedLines = [...lines]
    const line = updatedLines[index]

    // Keep existing percentage_increase if it exists
    const existingPercentage = line.forecast_method?.percentage_increase || 0

    line.forecast_method = {
      method,
      percentage_increase: existingPercentage,
      base_amount: line.analysis?.fy_average_per_month || 0,
      ...(method === 'driver_based' && { driver_percentage: 0.05 })
    }

    // Recalculate
    const actualMonthKeys = monthColumns.filter(c => c.isActual).map(c => c.key)
    const forecastMonthKeys = monthColumns.filter(c => c.isForecast).map(c => c.key)

    const recalculatedLines = ForecastingEngine.recalculateAllForecasts(
      updatedLines,
      actualMonthKeys,
      forecastMonthKeys
    )

    setLines(recalculatedLines)
    onSave(recalculatedLines)
  }

  // Handler for per-line percentage change
  const handleLinePercentageChange = (index: number, percentage: number) => {
    const updatedLines = [...lines]
    const line = updatedLines[index]

    if (line.forecast_method) {
      line.forecast_method.percentage_increase = percentage / 100 // Convert from 5 to 0.05
    }

    // Recalculate
    const actualMonthKeys = monthColumns.filter(c => c.isActual).map(c => c.key)
    const forecastMonthKeys = monthColumns.filter(c => c.isForecast).map(c => c.key)

    const recalculatedLines = ForecastingEngine.recalculateAllForecasts(
      updatedLines,
      actualMonthKeys,
      forecastMonthKeys
    )

    setLines(recalculatedLines)
    onSave(recalculatedLines)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profit & Loss Forecast</h2>
            <p className="text-sm text-gray-600 mt-1">
              {viewMode === 'view'
                ? 'Viewing forecast results - Switch to Setup Mode to make changes'
                : 'Setup Mode - Configure your forecast assumptions and methods'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View/Setup Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('view')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'view'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                View Mode
              </button>
              <button
                onClick={() => setViewMode('setup')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'setup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Setup Mode
              </button>
            </div>

            {/* Historical Data Lock */}
            <button
              onClick={() => setHistoricalDataLocked(!historicalDataLocked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                historicalDataLocked
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {historicalDataLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  FY25 Locked
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  FY25 Unlocked
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-gray-200">
              <th className="sticky left-0 top-0 z-40 bg-white px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-300 min-w-[250px] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                Account
              </th>
              {monthColumns.map((col, idx) => {
                const isLastActual = idx === 11; // June 25 is the 12th month (index 11)
                // In View mode, only show forecast columns
                if (viewMode === 'view' && col.isActual) return null

                return (
                  <React.Fragment key={col.key}>
                    <th
                      className={`sticky top-0 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider min-w-[140px] ${
                        col.isActual ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      } ${isLastActual ? 'border-r-2 border-gray-300' : ''}`}
                    >
                      {col.label}
                    </th>
                    {isLastActual && viewMode === 'setup' && (
                      <>
                        <th className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[160px] bg-blue-100">
                          FY25 Total
                        </th>
                        <th className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px] bg-amber-50">
                          % Revenue
                        </th>
                        <th className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[140px] bg-amber-50">
                          FY25 Avg/Mo
                        </th>
                        <th className="sticky top-0 px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider min-w-[180px] bg-slate-100 border-r-2 border-slate-300">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-600" />
                            Method
                          </div>
                        </th>
                      </>
                    )}
                  </React.Fragment>
                )
              })}
              <th className="sticky right-0 top-0 z-40 px-4 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider min-w-[160px] bg-green-100 border-l-2 border-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                FY26 Total
              </th>
            </tr>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 top-[52px] z-40 bg-gray-50 px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">

              </th>
              {monthColumns.map((col, idx) => {
                const isLastActual = idx === 11;
                // In View mode, only show forecast columns
                if (viewMode === 'view' && col.isActual) return null

                return (
                  <React.Fragment key={col.key}>
                    <th
                      className={`sticky top-[52px] px-4 py-2 text-right text-xs font-medium text-gray-500 ${
                        col.isActual ? 'bg-blue-50' : 'bg-green-50'
                      } ${isLastActual ? 'border-r-2 border-gray-300' : ''}`}
                    >
                      {col.isActual ? 'Actual' : 'Forecast'}
                    </th>
                    {isLastActual && viewMode === 'setup' && (
                      <>
                        <th className="sticky top-[52px] px-4 py-2 text-right text-xs font-medium text-gray-500 bg-blue-100">
                          Actual
                        </th>
                        <th className="sticky top-[52px] px-4 py-2 text-right text-xs font-medium text-gray-500 bg-amber-50">
                          Analysis
                        </th>
                        <th className="sticky top-[52px] px-4 py-2 text-right text-xs font-medium text-gray-500 bg-amber-50">
                          Analysis
                        </th>
                        <th className="sticky top-[52px] px-4 py-2 text-left text-xs font-medium text-gray-500 bg-slate-50 border-r-2 border-gray-400 min-w-[320px]">
                          Forecast Approach
                        </th>
                      </>
                    )}
                  </React.Fragment>
                )
              })}
              <th className="sticky right-0 top-[52px] z-40 px-4 py-2 text-right text-xs font-medium text-gray-500 bg-green-100 border-l-2 border-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Forecast
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => {
              const categoryLines = lines.filter(line => line.category === category)
              const isExpanded = expandedCategories.has(category)

              return (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-gray-100">
                    <td className="sticky left-0 z-20 bg-gray-100 px-6 py-3 border-r-2 border-gray-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-bold text-gray-900">{category}</span>
                      </button>
                    </td>
                    {monthColumns.map((col, idx) => {
                      const total = calculateCategoryTotal(category, col.key, col.isForecast)
                      const isLastActual = idx === 11;
                      // In View mode, only show forecast columns
                      if (viewMode === 'view' && col.isActual) return null

                      return (
                        <React.Fragment key={col.key}>
                          <td
                            className={`px-4 py-3 text-right text-sm font-semibold text-gray-900 ${
                              isLastActual ? 'border-r-2 border-gray-300' : ''
                            }`}
                          >
                            {formatCurrency(total)}
                          </td>
                          {isLastActual && viewMode === 'setup' && (
                            <>
                              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 bg-blue-100">
                                {formatCurrency(calculateCategoryFY25Total(category))}
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-gray-500 bg-amber-50">
                                —
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-gray-500 bg-amber-50">
                                —
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 bg-slate-50 border-r-2 border-gray-400">
                                —
                              </td>
                            </>
                          )}
                        </React.Fragment>
                      )
                    })}
                    <td className="sticky right-0 z-20 px-4 py-3 text-right text-sm font-bold text-gray-900 bg-green-100 border-l-2 border-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                      {formatCurrency(calculateCategoryFY26Total(category))}
                    </td>
                  </tr>

                  {/* Category Lines */}
                  {isExpanded && categoryLines.map((line) => {
                    const globalIdx = lines.findIndex(l => l === line)
                    return (
                      <tr key={globalIdx} className="hover:bg-gray-50 group">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-2 border-r-2 border-gray-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={line.account_name}
                              onChange={(e) => updateLineName(globalIdx, e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {line.is_manual && (
                              <button
                                onClick={() => removeLine(globalIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        {monthColumns.map((col, idx) => {
                          const months = col.isForecast ? line.forecast_months : line.actual_months
                          const value = months[col.key] || 0
                          const isLastActual = idx === 11;
                          const cellKey = `${globalIdx}-${col.key}`;
                          const isEditing = editingCell === cellKey;
                          const isDisabled = col.isActual && historicalDataLocked;
                          // In View mode, only show forecast columns
                          if (viewMode === 'view' && col.isActual) return null

                          return (
                            <React.Fragment key={col.key}>
                              <td className={`px-4 py-2 ${isLastActual ? 'border-r-2 border-gray-300' : ''}`}>
                                <input
                                  type="text"
                                  value={isEditing ? inputValue : formatInputValue(value)}
                                  disabled={isDisabled}
                                  onFocus={() => {
                                    if (!isDisabled) {
                                      setEditingCell(cellKey)
                                      setInputValue(String(value || ''))
                                    }
                                  }}
                                  onBlur={() => {
                                    const val = inputValue.trim()
                                    // Process the value when user leaves the cell
                                    if (val.startsWith('=')) {
                                      updateLineValue(globalIdx, col.key, val, col.isForecast)
                                    } else if (val) {
                                      const cleaned = val.replace(/[^0-9.-]/g, '')
                                      updateLineValue(globalIdx, col.key, parseFloat(cleaned) || 0, col.isForecast)
                                    }
                                    setEditingCell(null)
                                    setInputValue('')
                                  }}
                                  onChange={(e) => {
                                    setInputValue(e.target.value)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur()
                                    }
                                  }}
                                  className={`w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''
                                  }`}
                                  placeholder="$0 or =formula"
                                />
                              </td>
                              {isLastActual && viewMode === 'setup' && (
                                <>
                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-700 bg-blue-100">
                                    {formatCurrency(calculateLineFY25Total(line))}
                                  </td>
                                  <td className="px-4 py-2 text-right text-xs text-gray-600 bg-amber-50">
                                    {line.analysis?.pct_of_total_revenue !== undefined
                                      ? `${line.analysis.pct_of_total_revenue.toFixed(1)}%`
                                      : line.analysis?.pct_of_revenue !== undefined
                                      ? `${line.analysis.pct_of_revenue.toFixed(1)}%`
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-2 text-right text-xs text-gray-600 bg-amber-50">
                                    {line.analysis?.fy_average_per_month !== undefined
                                      ? formatCurrency(line.analysis.fy_average_per_month)
                                      : '—'}
                                  </td>
                                  {viewMode === 'setup' && (
                                    <td className="px-4 py-2 bg-slate-50 border-r-2 border-gray-400">
                                      {category === 'Operating Expenses' ? (
                                        <OpExLineControls
                                          forecastMethod={line.forecast_method}
                                          onMethodChange={(method) => handleLineMethodChange(globalIdx, method)}
                                          onPercentageChange={(percentage) => handleLinePercentageChange(globalIdx, percentage)}
                                        />
                                      ) : (
                                        <select
                                          value={line.forecast_method?.method || ''}
                                          onChange={(e) => updateForecastMethod(globalIdx, e.target.value as ForecastMethod)}
                                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                        >
                                          <option value="">Use Average</option>
                                          <option value="straight_line">Straight-line</option>
                                          <option value="growth_rate">Growth Rate</option>
                                          <option value="seasonal_pattern">Seasonal</option>
                                          <option value="driver_based">% of Revenue</option>
                                          <option value="manual">Manual</option>
                                        </select>
                                      )}
                                    </td>
                                  )}
                                </>
                              )}
                            </React.Fragment>
                          )
                        })}
                        <td className="sticky right-0 z-10 px-4 py-2 text-right text-sm font-medium text-gray-700 bg-green-100 group-hover:bg-green-100 border-l-2 border-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                          {formatCurrency(calculateLineFY26Total(line))}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Add Line Button */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={monthColumns.length + 3} className="px-6 py-2">
                        <button
                          onClick={() => addLine(category)}
                          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Line</span>
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Gross Profit after Cost of Sales */}
                  {category === 'Cost of Sales' && (
                    <tr className="bg-gray-50 font-bold border-t-2 border-b border-gray-400">
                      <td className="sticky left-0 z-10 bg-gray-50 px-6 py-3 border-r-2 border-gray-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                        <span className="text-gray-900">Gross Profit</span>
                      </td>
                      {monthColumns.map((col, idx) => {
                        const grossProfit = calculateGrossProfit(col.key, col.isForecast)
                        const isLastActual = idx === 11;
                        // In View mode, only show forecast columns
                        if (viewMode === 'view' && col.isActual) return null

                        return (
                          <React.Fragment key={col.key}>
                            <td
                              className={`px-4 py-3 text-right text-sm font-bold text-gray-900 ${
                                isLastActual ? 'border-r-2 border-gray-300' : ''
                              }`}
                            >
                              {formatCurrency(grossProfit)}
                            </td>
                            {isLastActual && viewMode === 'setup' && (
                              <>
                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 bg-blue-100">
                                  {formatCurrency(calculateGrossProfitFY25Total())}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-600 bg-amber-50">
                                  —
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-600 bg-amber-50">
                                  —
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 bg-slate-50 border-r-2 border-gray-400">
                                  Auto
                                </td>
                              </>
                            )}
                          </React.Fragment>
                        )
                      })}
                      <td className="sticky right-0 z-10 px-4 py-3 text-right text-sm font-bold text-gray-900 bg-green-100 border-l-2 border-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                        {formatCurrency(calculateGrossProfitFY26Total())}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}

            {/* Net Profit */}
            <tr className="bg-gray-100 font-bold border-t-2 border-b-2 border-gray-500">
              <td className="sticky left-0 z-10 bg-gray-100 px-6 py-3 border-r-2 border-gray-300 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                <span className="text-gray-900">Net Profit</span>
              </td>
              {monthColumns.map((col, idx) => {
                const netProfit = calculateNetProfit(col.key, col.isForecast)
                const isLastActual = idx === 11;
                // In View mode, only show forecast columns
                if (viewMode === 'view' && col.isActual) return null

                return (
                  <React.Fragment key={col.key}>
                    <td
                      className={`px-4 py-3 text-right text-sm font-bold ${
                        netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                      } ${isLastActual ? 'border-r-2 border-gray-300' : ''}`}
                    >
                      {formatCurrency(netProfit)}
                    </td>
                    {isLastActual && viewMode === 'setup' && (
                      <>
                        <td className={`px-4 py-3 text-right text-sm font-bold ${
                          calculateNetProfitFY25Total() >= 0 ? 'text-green-700' : 'text-red-700'
                        } bg-blue-100`}>
                          {formatCurrency(calculateNetProfitFY25Total())}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-600 bg-amber-50">
                          —
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-600 bg-amber-50">
                          —
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 bg-slate-50 border-r-2 border-gray-400">
                          Auto
                        </td>
                      </>
                    )}
                  </React.Fragment>
                )
              })}
              <td className={`sticky right-0 z-10 px-4 py-3 text-right text-sm font-bold ${
                calculateNetProfitFY26Total() >= 0 ? 'text-green-700' : 'text-red-700'
              } bg-green-100 border-l-2 border-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]`}>
                {formatCurrency(calculateNetProfitFY26Total())}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
