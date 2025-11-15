'use client'

import { ChevronDown, ChevronUp, DollarSign, Activity, Plus, Trash2, X, Search, AlertCircle, TrendingUp, Calculator, Sparkles } from 'lucide-react'
import { FinancialData, CoreMetricsData, KPIData, YearType } from '../types'
import { formatDollar, parseDollarInput } from '../utils/formatting'
import { useKPIs } from '../hooks/useKPIs'
import { useState, useMemo, useEffect } from 'react'
import { ProfitCalculatorModal } from './ProfitCalculatorModal'
import CreateCustomKPIModal from './CreateCustomKPIModal'
import { CustomKPIService, CustomKPI } from '../services/custom-kpi-service'
import { createClient } from '@/lib/supabase/client'

interface Step1Props {
  financialData: FinancialData
  updateFinancialValue: (metric: keyof FinancialData, period: 'current' | 'year1' | 'year2' | 'year3', value: number, isPercentage?: boolean) => void
  coreMetrics: CoreMetricsData
  updateCoreMetric: (metric: keyof CoreMetricsData, period: 'current' | 'year1' | 'year2' | 'year3', value: number) => void
  kpis: KPIData[]
  updateKPIValue: (kpiId: string, field: 'currentValue' | 'year1Target' | 'year2Target' | 'year3Target', value: number) => void
  addKPI?: (kpi: KPIData) => void
  deleteKPI: (kpiId: string) => void
  yearType: YearType
  setYearType: (type: YearType) => void
  collapsedSections: Set<string>
  toggleSection: (section: string) => void
  industry: string
  showKPIModal: boolean
  setShowKPIModal: (show: boolean) => void
  businessId?: string
}

export default function Step1GoalsAndKPIs({
  financialData,
  updateFinancialValue,
  coreMetrics,
  updateCoreMetric,
  kpis,
  updateKPIValue,
  addKPI,
  deleteKPI,
  yearType,
  setYearType,
  collapsedSections,
  toggleSection,
  industry,
  showKPIModal,
  setShowKPIModal,
  businessId
}: Step1Props) {
  const currentYear = new Date().getFullYear()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  // Custom KPI state
  const [showCustomKPIModal, setShowCustomKPIModal] = useState(false)
  const [customKPIs, setCustomKPIs] = useState<CustomKPI[]>([])
  const [userId, setUserId] = useState<string>('')
  const [customCategories, setCustomCategories] = useState<string[]>([])

  // Use KPI hook for complete KPI management
  const {
    unselectedKPIs,
    categories,
    loading: kpisLoading,
    error: kpisError,
    searchKPIs,
    getByCategory
  } = useKPIs({
    businessId,
    autoLoad: true,
    autoSync: true
  })

  // Load user ID and custom KPIs
  useEffect(() => {
    const loadCustomKPIs = async () => {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)

        // Load custom KPIs if businessId is available
        if (businessId) {
          const customKPIsList = await CustomKPIService.getAvailableCustomKPIs(user.id, businessId)
          setCustomKPIs(customKPIsList)

          // Extract unique categories from custom KPIs
          const cats = [...new Set(customKPIsList.map(k => k.category))].sort()
          setCustomCategories(cats)
        }
      }
    }

    loadCustomKPIs()
  }, [businessId])

  const getYearLabel = (idx: number) => {
    if (idx === 0) return { main: 'Current', subtitle: null }

    const today = new Date()
    const currentMonth = today.getMonth() // 0-11 (0=Jan, 11=Dec)

    if (yearType === 'FY') {
      let fyYear = currentYear

      // If we're within 3 months of June 30 (April onwards) or past it, plan for next FY
      if (currentMonth >= 3) { // April = month 3
        fyYear += 1
      }

      const year = fyYear + idx - 1
      return {
        main: `FY${year.toString().slice(-2)}`,
        subtitle: `Ending 30 June ${year}`
      }
    }

    // CY logic
    let cyYear = currentYear

    // If we're within 3 months of Dec 31 (October onwards), plan for next CY
    if (currentMonth >= 9) { // October = month 9
      cyYear += 1
    }

    const year = cyYear + idx - 1
    return {
      main: `CY${year.toString().slice(-2)}`,
      subtitle: `Ending 31 Dec ${year}`
    }
  }

  // Handler for calculator modal
  const handleApplyCalculator = (calculatedFinancialData: FinancialData, calculatedCoreMetrics: CoreMetricsData) => {
    // Apply all financial data
    Object.entries(calculatedFinancialData).forEach(([metric, values]) => {
      Object.entries(values).forEach(([period, value]) => {
        if (period === 'current' || period === 'year1' || period === 'year2' || period === 'year3') {
          const isPercentage = metric === 'grossMargin' || metric === 'netMargin'
          updateFinancialValue(metric as keyof FinancialData, period, value, isPercentage)
        }
      })
    })

    // Apply core metrics
    Object.entries(calculatedCoreMetrics).forEach(([metric, values]) => {
      Object.entries(values).forEach(([period, value]) => {
        if (period === 'current' || period === 'year1' || period === 'year2' || period === 'year3') {
          updateCoreMetric(metric as keyof CoreMetricsData, period, value)
        }
      })
    })
  }

  const financialMetrics = [
    { label: 'Revenue ($)', key: 'revenue', isPercentage: false },
    { label: 'Gross Profit ($)', key: 'grossProfit', isPercentage: false },
    { label: 'Gross Margin (%)', key: 'grossMargin', isPercentage: true },
    { label: 'Net Profit ($)', key: 'netProfit', isPercentage: false },
    { label: 'Net Margin (%)', key: 'netMargin', isPercentage: true }
  ]

  // Merge custom KPIs with standard KPIs (convert custom KPIs to KPIData format)
  const allAvailableKPIs = useMemo(() => {
    const customKPIsAsKPIData: KPIData[] = customKPIs.map(ck => ({
      id: ck.id || `custom-${ck.name}`,
      name: ck.name,
      friendlyName: ck.friendlyName || ck.name,
      category: ck.category,
      unit: ck.unit,
      frequency: ck.frequency,
      description: ck.description,
      isCustom: true,
      currentValue: 0,
      year1Target: 0,
      year2Target: 0,
      year3Target: 0
    }))

    // Merge and remove duplicates (in case a custom KPI is already selected)
    const selectedKPIIds = new Set(kpis?.map(k => k.id) || [])
    const unselectedCustomKPIs = customKPIsAsKPIData.filter(ck => !selectedKPIIds.has(ck.id))

    return [...unselectedKPIs, ...unselectedCustomKPIs]
  }, [unselectedKPIs, customKPIs, kpis])

  // Merge all categories (standard + custom)
  const allCategories = useMemo(() => {
    const standardCats = categories || []
    const mergedCats = [...new Set([...standardCats, ...customCategories])].sort()
    return mergedCats
  }, [categories, customCategories])

  // Filter KPIs based on search and category
  const filteredKPIs = useMemo(() => {
    let results = allAvailableKPIs

    if (selectedCategory) {
      results = results.filter(kpi => kpi.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(kpi =>
        kpi.name.toLowerCase().includes(query) ||
        kpi.friendlyName?.toLowerCase().includes(query) ||
        (kpi.description && kpi.description.toLowerCase().includes(query))
      )
    }

    return results
  }, [allAvailableKPIs, searchQuery, selectedCategory])

  // Group KPIs by category
  const groupedKPIs = useMemo(() => {
    const groups: Record<string, KPIData[]> = {}
    filteredKPIs.forEach(kpi => {
      const category = kpi.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(kpi)
    })
    return groups
  }, [filteredKPIs])

  const handleAddKPI = (kpi: KPIData) => {
    if (addKPI) {
      const newKPI = {
        ...kpi,
        currentValue: 0,
        year1Target: 0,
        year2Target: 0,
        year3Target: 0
      }
      addKPI(newKPI)
    }
  }

  // Handler for custom KPI creation
  const handleCustomKPISuccess = async (customKPI: CustomKPI) => {
    // Reload custom KPIs to include the new one
    if (userId && businessId) {
      const customKPIsList = await CustomKPIService.getAvailableCustomKPIs(userId, businessId)
      setCustomKPIs(customKPIsList)

      // Update categories
      const cats = [...new Set(customKPIsList.map(k => k.category))].sort()
      setCustomCategories(cats)

      // Convert custom KPI to KPIData format and add to selected KPIs
      const kpiData: KPIData = {
        id: customKPI.id || `custom-${Date.now()}`,
        name: customKPI.name,
        friendlyName: customKPI.friendlyName || customKPI.name,
        category: customKPI.category,
        unit: customKPI.unit,
        frequency: customKPI.frequency,
        description: customKPI.description,
        isCustom: true,
        currentValue: 0,
        year1Target: 0,
        year2Target: 0,
        year3Target: 0
      }

      if (addKPI) {
        addKPI(kpiData)
      }

      // Track usage
      if (customKPI.id) {
        await CustomKPIService.trackUsage(customKPI.id)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Year Type & Industry Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700 mr-3">Period Type:</span>
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
              {['FY', 'CY'].map(type => (
                <button
                  key={type}
                  onClick={() => setYearType(type as YearType)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    yearType === type 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type === 'FY' ? 'Fiscal Year' : 'Calendar Year'}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-600 block mb-1">INDUSTRY</span>
            <span className="text-sm text-blue-700 font-semibold capitalize">
              {industry?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div
            onClick={() => toggleSection('financial')}
            className="cursor-pointer flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
              <p className="text-sm text-gray-600">3-year revenue and profit targets</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowCalculator(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium text-sm"
            >
              <Calculator className="w-4 h-4" />
              Quick Start Calculator
            </button>
            <button
              onClick={() => toggleSection('financial')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {collapsedSections.has('financial') ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {!collapsedSections.has('financial') && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                    <th className="text-left p-3 text-sm font-bold text-gray-700 sticky left-0 bg-blue-50 z-10 w-[250px]">
                      Financial Metric
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(0).main}</div>
                      {getYearLabel(0).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(0).subtitle}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(1).main}</div>
                      {getYearLabel(1).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(1).subtitle}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(2).main}</div>
                      {getYearLabel(2).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(2).subtitle}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(3).main}</div>
                      {getYearLabel(3).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(3).subtitle}
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {financialMetrics.map((metric, index) => (
                    <tr
                      key={metric.key}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {/* Metric Name Column */}
                      <td className="p-3 sticky left-0 z-10 bg-inherit">
                        <span className="font-semibold text-gray-900 text-sm">
                          {metric.label}
                        </span>
                      </td>

                      {/* Current Value */}
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          value={metric.isPercentage
                            ? `${(financialData as any)[metric.key]?.current || 0}%`
                            : formatDollar((financialData as any)[metric.key]?.current || 0)
                          }
                          onChange={(e) => {
                            const numValue = metric.isPercentage
                              ? parseFloat(e.target.value.replace('%', '')) || 0
                              : parseDollarInput(e.target.value)
                            updateFinancialValue(metric.key as keyof FinancialData, 'current', numValue, metric.isPercentage)
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                          placeholder={metric.isPercentage ? '0%' : '$0'}
                        />
                      </td>

                      {/* Year 1 */}
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          value={metric.isPercentage
                            ? `${(financialData as any)[metric.key]?.year1 || 0}%`
                            : formatDollar((financialData as any)[metric.key]?.year1 || 0)
                          }
                          onChange={(e) => {
                            const numValue = metric.isPercentage
                              ? parseFloat(e.target.value.replace('%', '')) || 0
                              : parseDollarInput(e.target.value)
                            updateFinancialValue(metric.key as keyof FinancialData, 'year1', numValue, metric.isPercentage)
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                          placeholder={metric.isPercentage ? '0%' : '$0'}
                        />
                      </td>

                      {/* Year 2 */}
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          value={metric.isPercentage
                            ? `${(financialData as any)[metric.key]?.year2 || 0}%`
                            : formatDollar((financialData as any)[metric.key]?.year2 || 0)
                          }
                          onChange={(e) => {
                            const numValue = metric.isPercentage
                              ? parseFloat(e.target.value.replace('%', '')) || 0
                              : parseDollarInput(e.target.value)
                            updateFinancialValue(metric.key as keyof FinancialData, 'year2', numValue, metric.isPercentage)
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                          placeholder={metric.isPercentage ? '0%' : '$0'}
                        />
                      </td>

                      {/* Year 3 */}
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          value={metric.isPercentage
                            ? `${(financialData as any)[metric.key]?.year3 || 0}%`
                            : formatDollar((financialData as any)[metric.key]?.year3 || 0)
                          }
                          onChange={(e) => {
                            const numValue = metric.isPercentage
                              ? parseFloat(e.target.value.replace('%', '')) || 0
                              : parseDollarInput(e.target.value)
                            updateFinancialValue(metric.key as keyof FinancialData, 'year3', numValue, metric.isPercentage)
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-colors"
                          placeholder={metric.isPercentage ? '0%' : '$0'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Core Business Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          onClick={() => toggleSection('core-metrics')}
          className="cursor-pointer p-5 flex items-center justify-between hover:bg-teal-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Core Business Metrics</h3>
              <p className="text-sm text-gray-600">Essential metrics that drive your revenue and growth</p>
            </div>
          </div>
          {collapsedSections.has('core-metrics') ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {!collapsedSections.has('core-metrics') && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-50 to-teal-100 border-b-2 border-teal-200">
                    <th className="text-left p-3 text-sm font-bold text-gray-700 sticky left-0 bg-teal-50 z-10 w-[250px]">
                      Core Metric
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(0).main}</div>
                      {getYearLabel(0).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(0).subtitle}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(1).main}</div>
                      {getYearLabel(1).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(1).subtitle}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(2).main}</div>
                      {getYearLabel(2).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(2).subtitle}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                      <div>{getYearLabel(3).main}</div>
                      {getYearLabel(3).subtitle && (
                        <div className="text-xs font-normal text-gray-500 mt-1">
                          {getYearLabel(3).subtitle}
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Leads Per Month */}
                  <tr className="border-b border-gray-200 hover:bg-teal-50 transition-colors bg-white">
                    <td className="p-3 sticky left-0 z-10 bg-inherit">
                      <span className="font-semibold text-gray-900 text-sm">Leads per Month</span>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.leadsPerMonth.current || 0}
                        onChange={(e) => updateCoreMetric('leadsPerMonth', 'current', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.leadsPerMonth.year1 || 0}
                        onChange={(e) => updateCoreMetric('leadsPerMonth', 'year1', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.leadsPerMonth.year2 || 0}
                        onChange={(e) => updateCoreMetric('leadsPerMonth', 'year2', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.leadsPerMonth.year3 || 0}
                        onChange={(e) => updateCoreMetric('leadsPerMonth', 'year3', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                  </tr>

                  {/* Conversion Rate */}
                  <tr className="border-b border-gray-200 hover:bg-teal-50 transition-colors bg-gray-50">
                    <td className="p-3 sticky left-0 z-10 bg-inherit">
                      <span className="font-semibold text-gray-900 text-sm">Conversion Rate (%)</span>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={`${coreMetrics.conversionRate.current || 0}%`}
                        onChange={(e) => updateCoreMetric('conversionRate', 'current', parseFloat(e.target.value.replace('%', '')) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0%"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={`${coreMetrics.conversionRate.year1 || 0}%`}
                        onChange={(e) => updateCoreMetric('conversionRate', 'year1', parseFloat(e.target.value.replace('%', '')) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0%"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={`${coreMetrics.conversionRate.year2 || 0}%`}
                        onChange={(e) => updateCoreMetric('conversionRate', 'year2', parseFloat(e.target.value.replace('%', '')) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0%"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={`${coreMetrics.conversionRate.year3 || 0}%`}
                        onChange={(e) => updateCoreMetric('conversionRate', 'year3', parseFloat(e.target.value.replace('%', '')) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0%"
                      />
                    </td>
                  </tr>

                  {/* Average Transaction Value */}
                  <tr className="border-b border-gray-200 hover:bg-teal-50 transition-colors bg-white">
                    <td className="p-3 sticky left-0 z-10 bg-inherit">
                      <span className="font-semibold text-gray-900 text-sm">Avg Transaction Value ($)</span>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={formatDollar(coreMetrics.avgTransactionValue.current || 0)}
                        onChange={(e) => updateCoreMetric('avgTransactionValue', 'current', parseDollarInput(e.target.value))}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="$0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={formatDollar(coreMetrics.avgTransactionValue.year1 || 0)}
                        onChange={(e) => updateCoreMetric('avgTransactionValue', 'year1', parseDollarInput(e.target.value))}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="$0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={formatDollar(coreMetrics.avgTransactionValue.year2 || 0)}
                        onChange={(e) => updateCoreMetric('avgTransactionValue', 'year2', parseDollarInput(e.target.value))}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="$0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={formatDollar(coreMetrics.avgTransactionValue.year3 || 0)}
                        onChange={(e) => updateCoreMetric('avgTransactionValue', 'year3', parseDollarInput(e.target.value))}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="$0"
                      />
                    </td>
                  </tr>

                  {/* Team Headcount */}
                  <tr className="border-b border-gray-200 hover:bg-teal-50 transition-colors bg-gray-50">
                    <td className="p-3 sticky left-0 z-10 bg-inherit">
                      <span className="font-semibold text-gray-900 text-sm">Team Headcount (FTE)</span>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={coreMetrics.teamHeadcount.current || 0}
                        onChange={(e) => updateCoreMetric('teamHeadcount', 'current', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={coreMetrics.teamHeadcount.year1 || 0}
                        onChange={(e) => updateCoreMetric('teamHeadcount', 'year1', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={coreMetrics.teamHeadcount.year2 || 0}
                        onChange={(e) => updateCoreMetric('teamHeadcount', 'year2', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={coreMetrics.teamHeadcount.year3 || 0}
                        onChange={(e) => updateCoreMetric('teamHeadcount', 'year3', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                  </tr>

                  {/* Revenue per Employee (Auto-Calculated) */}
                  <tr className="border-b border-gray-200 bg-teal-50/50">
                    <td className="p-3 sticky left-0 z-10 bg-teal-50/50">
                      <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        Revenue per Employee ($)
                        <span className="text-xs text-gray-500 font-normal italic">(calculated)</span>
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <div className="px-2 py-2 bg-gray-100 rounded-md text-sm text-center font-medium text-gray-700 border border-gray-200">
                        {coreMetrics.teamHeadcount.current > 0
                          ? formatDollar(Math.round(financialData.revenue.current / coreMetrics.teamHeadcount.current))
                          : '$0'}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="px-2 py-2 bg-gray-100 rounded-md text-sm text-center font-medium text-gray-700 border border-gray-200">
                        {coreMetrics.teamHeadcount.year1 > 0
                          ? formatDollar(Math.round(financialData.revenue.year1 / coreMetrics.teamHeadcount.year1))
                          : '$0'}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="px-2 py-2 bg-gray-100 rounded-md text-sm text-center font-medium text-gray-700 border border-gray-200">
                        {coreMetrics.teamHeadcount.year2 > 0
                          ? formatDollar(Math.round(financialData.revenue.year2 / coreMetrics.teamHeadcount.year2))
                          : '$0'}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="px-2 py-2 bg-gray-100 rounded-md text-sm text-center font-medium text-gray-700 border border-gray-200">
                        {coreMetrics.teamHeadcount.year3 > 0
                          ? formatDollar(Math.round(financialData.revenue.year3 / coreMetrics.teamHeadcount.year3))
                          : '$0'}
                      </div>
                    </td>
                  </tr>

                  {/* Owner Hours Per Week */}
                  <tr className="border-b border-gray-200 hover:bg-teal-50 transition-colors bg-white">
                    <td className="p-3 sticky left-0 z-10 bg-inherit">
                      <span className="font-semibold text-gray-900 text-sm">Owner Hours per Week</span>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.ownerHoursPerWeek.current || 0}
                        onChange={(e) => updateCoreMetric('ownerHoursPerWeek', 'current', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.ownerHoursPerWeek.year1 || 0}
                        onChange={(e) => updateCoreMetric('ownerHoursPerWeek', 'year1', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.ownerHoursPerWeek.year2 || 0}
                        onChange={(e) => updateCoreMetric('ownerHoursPerWeek', 'year2', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={coreMetrics.ownerHoursPerWeek.year3 || 0}
                        onChange={(e) => updateCoreMetric('ownerHoursPerWeek', 'year3', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-300 transition-colors"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          onClick={() => toggleSection('kpis')}
          className="cursor-pointer p-5 flex items-center justify-between hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
              <p className="text-sm text-gray-600">Select from 200+ metrics across all business functions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(kpis || []).length > 0 && (
              <span className="text-xs font-bold text-white bg-green-600 px-2.5 py-1 rounded-full">
                {(kpis || []).length}
              </span>
            )}
            {collapsedSections.has('kpis') ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {!collapsedSections.has('kpis') && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
            {(kpis || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-2">No KPIs selected yet</p>
                <p className="text-sm text-gray-600 mb-6">Add KPIs from our library of 200+ metrics to track your business health</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                    setShowKPIModal(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First KPI
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                        <th className="text-left p-3 text-sm font-bold text-gray-700 sticky left-0 bg-green-50 z-10 w-[250px]">
                          KPI / Category
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                          <div>{getYearLabel(0).main}</div>
                          {getYearLabel(0).subtitle && (
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {getYearLabel(0).subtitle}
                            </div>
                          )}
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                          <div>{getYearLabel(1).main}</div>
                          {getYearLabel(1).subtitle && (
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {getYearLabel(1).subtitle}
                            </div>
                          )}
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                          <div>{getYearLabel(2).main}</div>
                          {getYearLabel(2).subtitle && (
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {getYearLabel(2).subtitle}
                            </div>
                          )}
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-gray-700 w-[150px]">
                          <div>{getYearLabel(3).main}</div>
                          {getYearLabel(3).subtitle && (
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {getYearLabel(3).subtitle}
                            </div>
                          )}
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-gray-700 w-[80px]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(kpis || []).map((kpi, index) => (
                        <tr
                          key={kpi.id}
                          className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          {/* KPI Name & Category Column */}
                          <td className="p-3 sticky left-0 z-10 bg-inherit">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm leading-tight">
                                  {kpi.name}
                                </span>
                                {kpi.isCustom && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-500 text-white rounded font-bold">
                                    CUSTOM
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600 leading-tight">
                                {kpi.friendlyName}
                              </span>
                              {kpi.category && (
                                <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 w-fit">
                                  {kpi.category}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Current Value */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={kpi.currentValue || 0}
                              onChange={(e) => updateKPIValue(kpi.id, 'currentValue', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-300 transition-colors"
                              placeholder="0"
                            />
                          </td>

                          {/* Year 1 Target */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={kpi.year1Target || 0}
                              onChange={(e) => updateKPIValue(kpi.id, 'year1Target', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-300 transition-colors"
                              placeholder="0"
                            />
                          </td>

                          {/* Year 2 Target */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={kpi.year2Target || 0}
                              onChange={(e) => updateKPIValue(kpi.id, 'year2Target', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-300 transition-colors"
                              placeholder="0"
                            />
                          </td>

                          {/* Year 3 Target */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={kpi.year3Target || 0}
                              onChange={(e) => updateKPIValue(kpi.id, 'year3Target', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-green-300 transition-colors"
                              placeholder="0"
                            />
                          </td>

                          {/* Delete Button */}
                          <td className="p-2 text-center">
                            <button
                              onClick={() => deleteKPI(kpi.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded inline-flex items-center justify-center"
                              title="Delete KPI"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Another KPI Button */}
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                    setShowKPIModal(true)
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-green-300 text-green-700 rounded-lg hover:bg-green-50 hover:border-green-400 font-medium text-sm transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Add Another KPI
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Selection Modal */}
      {showKPIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select KPIs to Track</h3>
                <p className="text-sm text-gray-600 mt-1">Choose from 200+ KPIs across all business functions</p>
              </div>
              <button
                onClick={() => setShowKPIModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="border-b border-gray-200 p-4 bg-white space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  autoFocus
                />
              </div>

              {allCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      selectedCategory === null
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({allAvailableKPIs.length})
                  </button>
                  {allCategories.map(cat => {
                    const count = allAvailableKPIs.filter(k => k.category === cat).length
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          selectedCategory === cat
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {kpisError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{kpisError}</p>
                </div>
              )}

              {kpisLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading KPI library...</p>
                </div>
              ) : filteredKPIs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-medium">
                    {allAvailableKPIs.length === 0
                      ? 'All available KPIs already selected'
                      : `No KPIs match your search`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{category} ({categoryKPIs.length})</h4>
                      <div className="space-y-2">
                        {categoryKPIs.map((kpi) => (
                          <button
                            key={kpi.id}
                            onClick={() => {
                              handleAddKPI(kpi)
                              setShowKPIModal(false)
                            }}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 group-hover:text-green-700">{kpi.name}</p>
                                  {kpi.isCustom && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-purple-500 text-white rounded font-bold">
                                      CUSTOM
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">{kpi.friendlyName}</p>
                                {kpi.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{kpi.description}</p>
                                )}
                              </div>
                              <Plus className="w-4 h-4 text-gray-400 group-hover:text-green-600 flex-shrink-0 ml-2" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {allAvailableKPIs.length > 0 && `${allAvailableKPIs.length} available`}
                </p>
                <button
                  onClick={() => {
                    setShowKPIModal(false)
                    setShowCustomKPIModal(true)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-xs transition-colors shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  Create Custom KPI
                </button>
              </div>
              <button
                onClick={() => setShowKPIModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Set realistic targets based on your current performance. These will drive your annual and 90-day plans.
        </p>
      </div>

      {/* Profit Calculator Modal */}
      <ProfitCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        industry={industry}
        onApply={handleApplyCalculator}
      />

      {/* Create Custom KPI Modal */}
      {businessId && userId && (
        <CreateCustomKPIModal
          isOpen={showCustomKPIModal}
          onClose={() => setShowCustomKPIModal(false)}
          onSuccess={handleCustomKPISuccess}
          userId={userId}
          businessId={businessId}
          existingCategories={allCategories}
          allAvailableKPIs={allAvailableKPIs}
        />
      )}
    </div>
  )
}