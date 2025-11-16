'use client'

import { useState, useMemo } from 'react'
import {
  Target, Zap, Calendar, TrendingUp, CheckCircle, AlertCircle,
  Clock, Users, Plus, Trash2, Edit2, Flag, Link as LinkIcon,
  ChevronDown, ChevronUp, BarChart3, PlayCircle, Circle, CheckCircle2,
  XCircle, X
} from 'lucide-react'
import {
  StrategicInitiative,
  KPIData,
  FinancialData,
  CoreMetricsData,
  QuarterlyRock,
  Milestone,
  KeyAction,
  WeeklyCheckIn,
  ActionStatus,
  ActionPriority,
  RockStatus,
  YearType
} from '../types'
import { calculateQuarters } from '../utils/quarters'

interface Step6Props {
  annualPlanByQuarter: Record<string, StrategicInitiative[]>
  financialData: FinancialData
  coreMetrics: CoreMetricsData
  kpis: KPIData[]
  yearType: YearType
}

export default function Step690DaySprintV2({
  annualPlanByQuarter,
  financialData,
  coreMetrics,
  kpis,
  yearType
}: Step6Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rocks' | 'milestones' | 'weekly' | 'actions' | 'progress'>('overview')

  // Sprint data state
  const [rocks, setRocks] = useState<QuarterlyRock[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [keyActions, setKeyActions] = useState<KeyAction[]>([])
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([])
  const [focusInitiatives, setFocusInitiatives] = useState<string[]>([])

  // Calculate quarter info
  const today = new Date()
  const currentYear = today.getFullYear()
  const planYear = yearType === 'FY' && today.getMonth() >= 3 ? currentYear + 1 :
                   yearType === 'CY' && today.getMonth() >= 9 ? currentYear + 1 : currentYear

  const QUARTERS = calculateQuarters(yearType, planYear)
  const currentQuarter = QUARTERS.find(q => q.isCurrent) || QUARTERS[0]
  const sprintQuarter = currentQuarter

  // Get Q1 initiatives
  const q1Initiatives = annualPlanByQuarter['q1'] || []

  // Calculate quarterly targets from Annual Plan
  const quarterlyTargets = useMemo(() => {
    return {
      revenue: financialData.revenue?.year1 || 0,
      grossProfit: financialData.grossProfit?.year1 || 0,
      netProfit: financialData.netProfit?.year1 || 0,
      kpiTargets: kpis.reduce((acc, kpi) => {
        acc[kpi.id] = kpi.year1Target
        return acc
      }, {} as Record<string, number>)
    }
  }, [financialData, kpis])

  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    const totalRocks = rocks.length
    const completedRocks = rocks.filter(r => r.status === 'completed').length
    const rocksProgress = totalRocks > 0 ? (completedRocks / totalRocks) * 100 : 0

    const totalActions = keyActions.length
    const completedActions = keyActions.filter(a => a.status === 'completed').length
    const actionsProgress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

    const completedMilestones = milestones.filter(m => m.status === 'completed').length
    const milestonesProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0

    const overallProgress = (rocksProgress + actionsProgress + milestonesProgress) / 3

    return {
      totalRocks,
      completedRocks,
      rocksProgress,
      totalActions,
      completedActions,
      actionsProgress,
      completedMilestones,
      milestonesProgress,
      overallProgress
    }
  }, [rocks, keyActions, milestones])

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Sprint Overview', icon: Target },
    { id: 'rocks', label: 'Quarterly Rocks', icon: Flag, badge: rocks.length },
    { id: 'milestones', label: '30/60/90 Days', icon: Calendar, badge: milestones.length },
    { id: 'actions', label: 'Key Actions', icon: Zap, badge: keyActions.length },
    { id: 'weekly', label: 'Weekly Check-ins', icon: CheckCircle, badge: checkIns.length },
    { id: 'progress', label: 'Progress Dashboard', icon: BarChart3 }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-[#8E9AAF] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#3E3F57] mb-2">90-Day Sprint Execution</h2>
            <p className="text-gray-600">
              {sprintQuarter.label} • {sprintQuarter.months} • Week {Math.ceil((today.getTime() - new Date(sprintQuarter.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))} of 13
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
            <div className="text-3xl font-bold text-[#4C5D75]">{Math.round(progressMetrics.overallProgress)}%</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-[#8E9AAF]">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-[#4C5D75]" />
              <span className="text-xs font-medium text-gray-600">Rocks</span>
            </div>
            <div className="text-xl font-bold text-[#3E3F57]">{progressMetrics.completedRocks}/{progressMetrics.totalRocks}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#8E9AAF]">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#4C5D75]" />
              <span className="text-xs font-medium text-gray-600">Milestones</span>
            </div>
            <div className="text-xl font-bold text-[#3E3F57]">{progressMetrics.completedMilestones}/{milestones.length}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#8E9AAF]">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#4C5D75]" />
              <span className="text-xs font-medium text-gray-600">Actions</span>
            </div>
            <div className="text-xl font-bold text-[#3E3F57]">{progressMetrics.completedActions}/{progressMetrics.totalActions}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#8E9AAF]">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-[#4C5D75]" />
              <span className="text-xs font-medium text-gray-600">Check-ins</span>
            </div>
            <div className="text-xl font-bold text-[#3E3F57]">{checkIns.length}/13</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#4C5D75] text-[#4C5D75] bg-slate-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#4C5D75] text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <SprintOverviewTab
              sprintQuarter={sprintQuarter}
              q1Initiatives={q1Initiatives}
              focusInitiatives={focusInitiatives}
              setFocusInitiatives={setFocusInitiatives}
              quarterlyTargets={quarterlyTargets}
              progressMetrics={progressMetrics}
              rocks={rocks}
              keyActions={keyActions}
            />
          )}

          {activeTab === 'rocks' && (
            <QuarterlyRocksTab
              rocks={rocks}
              setRocks={setRocks}
              q1Initiatives={q1Initiatives}
              kpis={kpis}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesTab
              milestones={milestones}
              setMilestones={setMilestones}
              sprintQuarter={sprintQuarter}
              kpis={kpis}
            />
          )}

          {activeTab === 'actions' && (
            <KeyActionsTab
              keyActions={keyActions}
              setKeyActions={setKeyActions}
              rocks={rocks}
              kpis={kpis}
              q1Initiatives={q1Initiatives}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklyCheckInsTab
              checkIns={checkIns}
              setCheckIns={setCheckIns}
              keyActions={keyActions}
              sprintQuarter={sprintQuarter}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressDashboardTab
              rocks={rocks}
              milestones={milestones}
              keyActions={keyActions}
              checkIns={checkIns}
              progressMetrics={progressMetrics}
              quarterlyTargets={quarterlyTargets}
              sprintQuarter={sprintQuarter}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SPRINT OVERVIEW TAB
// =============================================================================

interface SprintOverviewTabProps {
  sprintQuarter: any
  q1Initiatives: StrategicInitiative[]
  focusInitiatives: string[]
  setFocusInitiatives: (ids: string[]) => void
  quarterlyTargets: any
  progressMetrics: any
  rocks: QuarterlyRock[]
  keyActions: KeyAction[]
}

function SprintOverviewTab({
  sprintQuarter,
  q1Initiatives,
  focusInitiatives,
  setFocusInitiatives,
  quarterlyTargets,
  progressMetrics,
  rocks,
  keyActions
}: SprintOverviewTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleToggleFocus = (initiativeId: string) => {
    if (focusInitiatives.includes(initiativeId)) {
      setFocusInitiatives(focusInitiatives.filter(id => id !== initiativeId))
    } else {
      setFocusInitiatives([...focusInitiatives, initiativeId])
    }
  }

  // Get priority actions (P1 only)
  const priorityActions = keyActions.filter(a => a.priority === 'p1' && a.status !== 'completed')

  return (
    <div className="space-y-6">
      {/* Sprint Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint Info */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Duration</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {new Date(sprintQuarter.startDate).toLocaleDateString()} - {new Date(sprintQuarter.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Time Remaining</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {Math.max(0, Math.ceil((new Date(sprintQuarter.endDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)))} days left
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Targets */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Targets</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">Revenue Target</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(quarterlyTargets.revenue)}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-900 mb-1">Net Profit Target</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(quarterlyTargets.netProfit)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Initiatives Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint Focus (Select 1-3 Initiatives)</h3>
        {q1Initiatives.length === 0 ? (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-amber-900 font-medium">No Q1 initiatives yet</p>
            <p className="text-xs text-amber-700 mt-1">Go back to Step 5 to add initiatives to Q1</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {q1Initiatives.map(initiative => {
              const isSelected = focusInitiatives.includes(initiative.id)
              return (
                <button
                  key={initiative.id}
                  onClick={() => handleToggleFocus(initiative.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-slate-50 border-[#4C5D75] shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 font-medium text-sm text-gray-900">{initiative.title}</div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[#4C5D75] border-[#4C5D75]' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  {initiative.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{initiative.description}</p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Priority Actions (P1)</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{priorityActions.length} active</span>
          </div>
          {priorityActions.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">No P1 actions yet. Add them in the Actions tab.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {priorityActions.slice(0, 5).map(action => (
                <div key={action.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">P1</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{action.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">👤 {action.owner}</span>
                        <span className="text-xs text-gray-600">📅 {new Date(action.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rocks Status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Quarterly Rocks</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{rocks.length} total</span>
          </div>
          {rocks.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">No rocks defined yet. Add them in the Rocks tab.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rocks.map(rock => (
                <div key={rock.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-900 flex-1">{rock.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      rock.status === 'completed' ? 'bg-green-100 text-green-700' :
                      rock.status === 'on_track' ? 'bg-blue-100 text-blue-700' :
                      rock.status === 'at_risk' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {rock.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        rock.status === 'at_risk' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${rock.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// QUARTERLY ROCKS TAB
// =============================================================================

interface QuarterlyRocksTabProps {
  rocks: QuarterlyRock[]
  setRocks: (rocks: QuarterlyRock[]) => void
  q1Initiatives: StrategicInitiative[]
  kpis: KPIData[]
}

function QuarterlyRocksTab({ rocks, setRocks, q1Initiatives, kpis }: QuarterlyRocksTabProps) {
  const [isAddingRock, setIsAddingRock] = useState(false)
  const [editingRock, setEditingRock] = useState<QuarterlyRock | null>(null)
  const [expandedRock, setExpandedRock] = useState<string | null>(null)

  const handleAddRock = (rock: QuarterlyRock) => {
    setRocks([...rocks, rock])
    setIsAddingRock(false)
  }

  const handleUpdateRock = (updatedRock: QuarterlyRock) => {
    setRocks(rocks.map(r => r.id === updatedRock.id ? updatedRock : r))
    setEditingRock(null)
  }

  const handleDeleteRock = (rockId: string) => {
    if (confirm('Are you sure you want to delete this rock?')) {
      setRocks(rocks.filter(r => r.id !== rockId))
      if (expandedRock === rockId) setExpandedRock(null)
    }
  }

  const getStatusColor = (status: RockStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'on_track': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'at_risk': return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'missed': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: RockStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'on_track': return <PlayCircle className="w-4 h-4" />
      case 'at_risk': return <AlertCircle className="w-4 h-4" />
      case 'missed': return <XCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Quarterly Rocks (3-7 Major Outcomes)</h3>
          <p className="text-sm text-gray-600">
            Rocks are your most important priorities for this quarter. Choose 3-7 outcomes that will move the needle.
          </p>
        </div>
        <button
          onClick={() => setIsAddingRock(true)}
          disabled={rocks.length >= 7}
          className="flex items-center gap-2 px-4 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Rock ({rocks.length}/7)
        </button>
      </div>

      {/* Rocks List */}
      {rocks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Flag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Rocks Yet</h4>
          <p className="text-sm text-gray-600 mb-4">Start by adding your first quarterly rock</p>
          <button
            onClick={() => setIsAddingRock(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Rock
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rocks.map((rock, index) => {
            const isExpanded = expandedRock === rock.id
            return (
              <div
                key={rock.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Rock Header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Rock Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#4C5D75] font-bold text-lg flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>

                    {/* Rock Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-base font-semibold text-gray-900 flex-1">{rock.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getStatusColor(rock.status)}`}>
                            {getStatusIcon(rock.status)}
                            {rock.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setEditingRock(rock)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRock(rock.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-gray-900">{rock.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${
                              rock.status === 'at_risk' ? 'bg-amber-500' :
                              rock.status === 'missed' ? 'bg-red-500' :
                              rock.status === 'completed' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${rock.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{rock.owner}</span>
                        </div>
                        {rock.targetDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due {new Date(rock.targetDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {rock.linkedInitiatives && rock.linkedInitiatives.length > 0 && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            <span>{rock.linkedInitiatives.length} initiative(s)</span>
                          </div>
                        )}
                        {rock.linkedKPIs && rock.linkedKPIs.length > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{rock.linkedKPIs.length} KPI(s)</span>
                          </div>
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => setExpandedRock(isExpanded ? null : rock.id)}
                        className="mt-3 flex items-center gap-1 text-xs text-[#4C5D75] hover:text-[#3E3F57] font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Show Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-3">
                    {rock.description && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Description</div>
                        <p className="text-sm text-gray-600">{rock.description}</p>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-1">Success Criteria</div>
                      <p className="text-sm text-gray-600">{rock.successCriteria}</p>
                    </div>

                    {rock.linkedInitiatives && rock.linkedInitiatives.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-2">Linked Initiatives</div>
                        <div className="flex flex-wrap gap-2">
                          {rock.linkedInitiatives.map(initId => {
                            const initiative = q1Initiatives.find(i => i.id === initId)
                            return initiative ? (
                              <span key={initId} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                {initiative.title}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    {rock.linkedKPIs && rock.linkedKPIs.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-2">Linked KPIs</div>
                        <div className="flex flex-wrap gap-2">
                          {rock.linkedKPIs.map(kpiId => {
                            const kpi = kpis.find(k => k.id === kpiId)
                            return kpi ? (
                              <span key={kpiId} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">
                                {kpi.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    {rock.notes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Notes</div>
                        <p className="text-sm text-gray-600 italic">{rock.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddingRock || editingRock) && (
        <RockFormModal
          rock={editingRock}
          onSave={editingRock ? handleUpdateRock : handleAddRock}
          onClose={() => {
            setIsAddingRock(false)
            setEditingRock(null)
          }}
          q1Initiatives={q1Initiatives}
          kpis={kpis}
        />
      )}
    </div>
  )
}

// =============================================================================
// ROCK FORM MODAL
// =============================================================================

interface RockFormModalProps {
  rock: QuarterlyRock | null
  onSave: (rock: QuarterlyRock) => void
  onClose: () => void
  q1Initiatives: StrategicInitiative[]
  kpis: KPIData[]
}

function RockFormModal({ rock, onSave, onClose, q1Initiatives, kpis }: RockFormModalProps) {
  const [formData, setFormData] = useState<Partial<QuarterlyRock>>(
    rock || {
      id: '',
      title: '',
      description: '',
      owner: '',
      status: 'not_started',
      progressPercentage: 0,
      linkedInitiatives: [],
      linkedKPIs: [],
      successCriteria: '',
      startDate: '',
      targetDate: '',
      notes: ''
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.owner || !formData.successCriteria) {
      alert('Please fill in all required fields')
      return
    }

    const rockData: QuarterlyRock = {
      id: formData.id || `rock-${Date.now()}`,
      title: formData.title,
      description: formData.description || '',
      owner: formData.owner,
      status: formData.status || 'not_started',
      progressPercentage: formData.progressPercentage || 0,
      linkedInitiatives: formData.linkedInitiatives || [],
      linkedKPIs: formData.linkedKPIs || [],
      successCriteria: formData.successCriteria,
      startDate: formData.startDate,
      targetDate: formData.targetDate,
      notes: formData.notes
    }

    onSave(rockData)
  }

  const toggleInitiative = (initiativeId: string) => {
    const current = formData.linkedInitiatives || []
    if (current.includes(initiativeId)) {
      setFormData({ ...formData, linkedInitiatives: current.filter(id => id !== initiativeId) })
    } else {
      setFormData({ ...formData, linkedInitiatives: [...current, initiativeId] })
    }
  }

  const toggleKPI = (kpiId: string) => {
    const current = formData.linkedKPIs || []
    if (current.includes(kpiId)) {
      setFormData({ ...formData, linkedKPIs: current.filter(id => id !== kpiId) })
    } else {
      setFormData({ ...formData, linkedKPIs: [...current, kpiId] })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {rock ? 'Edit Rock' : 'Add New Rock'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Rock Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Launch New Product Line, Increase Revenue by 25%"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context and details about this rock..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Success Criteria *
            </label>
            <textarea
              value={formData.successCriteria}
              onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
              placeholder="How will you know this rock is complete? Be specific..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Owner, Status, Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Owner *
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RockStatus })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="not_started">Not Started</option>
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Progress %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Linked Initiatives */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Linked Initiatives (Optional)
            </label>
            {q1Initiatives.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No Q1 initiatives available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {q1Initiatives.map(initiative => (
                  <label key={initiative.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.linkedInitiatives?.includes(initiative.id)}
                      onChange={() => toggleInitiative(initiative.id)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{initiative.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Linked KPIs */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Linked KPIs (Optional)
            </label>
            {kpis.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No KPIs available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {kpis.map(kpi => (
                  <label key={kpi.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.linkedKPIs?.includes(kpi.id)}
                      onChange={() => toggleKPI(kpi.id)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{kpi.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes, blockers, or context..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors"
            >
              {rock ? 'Update Rock' : 'Add Rock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =============================================================================
// 30/60/90 MILESTONES TAB
// =============================================================================

interface MilestonesTabProps {
  milestones: Milestone[]
  setMilestones: (milestones: Milestone[]) => void
  sprintQuarter: any
  kpis: KPIData[]
}

function MilestonesTab({ milestones, setMilestones, sprintQuarter, kpis }: MilestonesTabProps) {
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  // Initialize milestones if empty
  const initializeMilestones = () => {
    const sprintStart = new Date(sprintQuarter.startDate)

    const defaultMilestones: Milestone[] = [
      {
        id: 'milestone-30',
        day: 30,
        title: '30-Day Check-In',
        description: 'First progress checkpoint - quick wins and early momentum',
        targetDate: new Date(sprintStart.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        keyMetrics: [],
        wins: [],
        challenges: [],
        adjustments: []
      },
      {
        id: 'milestone-60',
        day: 60,
        title: '60-Day Check-In',
        description: 'Mid-point review - assess progress and make adjustments',
        targetDate: new Date(sprintStart.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        keyMetrics: [],
        wins: [],
        challenges: [],
        adjustments: []
      },
      {
        id: 'milestone-90',
        day: 90,
        title: '90-Day Review',
        description: 'Quarter end - final results and learnings',
        targetDate: new Date(sprintQuarter.endDate).toISOString().split('T')[0],
        status: 'pending',
        keyMetrics: [],
        wins: [],
        challenges: [],
        adjustments: []
      }
    ]

    setMilestones(defaultMilestones)
  }

  // Initialize on first render if empty
  if (milestones.length === 0) {
    initializeMilestones()
    return null
  }

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestones(milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m))
    setEditingMilestone(null)
  }

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'missed': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5" />
      case 'in_progress': return <PlayCircle className="w-5 h-5" />
      case 'missed': return <XCircle className="w-5 h-5" />
      default: return <Circle className="w-5 h-5" />
    }
  }

  const getMilestoneProgress = (milestone: Milestone) => {
    const today = new Date()
    const target = new Date(milestone.targetDate)

    if (milestone.status === 'completed') return 100
    if (milestone.status === 'missed') return 0
    if (today > target) return 100

    const start = new Date(sprintQuarter.startDate)
    const totalDays = (target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    const daysPassed = (today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)

    return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))
  }

  // Sort milestones by day
  const sortedMilestones = [...milestones].sort((a, b) => a.day - b.day)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">30/60/90 Day Milestones</h3>
        <p className="text-sm text-gray-600">
          Three strategic checkpoints to review progress, celebrate wins, and make course corrections
        </p>
      </div>

      {/* Timeline View */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 hidden md:block" />

        {/* Milestones */}
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => {
            const progress = getMilestoneProgress(milestone)
            const isPast = new Date() > new Date(milestone.targetDate)
            const isCurrent = !milestone.completionDate && !isPast

            return (
              <div key={milestone.id} className="relative">
                {/* Timeline Dot */}
                <div className="hidden md:flex absolute left-0 items-center justify-center">
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                    milestone.status === 'completed' ? 'bg-green-500 border-green-200' :
                    milestone.status === 'in_progress' ? 'bg-[#4C5D75] border-[#8E9AAF]' :
                    milestone.status === 'missed' ? 'bg-red-500 border-red-200' :
                    'bg-gray-400 border-gray-200'
                  }`}>
                    <span className="text-white font-bold text-sm">{milestone.day}</span>
                  </div>
                </div>

                {/* Milestone Card */}
                <div className="md:ml-20 bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className={`p-4 ${
                    milestone.status === 'completed' ? 'bg-green-50 border-b-2 border-green-200' :
                    milestone.status === 'in_progress' ? 'bg-slate-50 border-b-2 border-[#8E9AAF]' :
                    milestone.status === 'missed' ? 'bg-red-50 border-b-2 border-red-200' :
                    'bg-gray-50 border-b-2 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-bold text-gray-900">{milestone.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getStatusColor(milestone.status)}`}>
                            {getStatusIcon(milestone.status)}
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                          </div>
                          {milestone.completionDate && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed: {new Date(milestone.completionDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingMilestone(milestone)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {milestone.status !== 'completed' && milestone.status !== 'missed' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">Time Progress</span>
                          <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              progress >= 100 ? 'bg-[#948687]' : 'bg-[#4C5D75]'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Key Metrics */}
                    {milestone.keyMetrics && milestone.keyMetrics.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-2">Key Metrics</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {milestone.keyMetrics.map((metric, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                              <div className="text-xs font-medium text-gray-900">{metric.metric}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600">Target: {metric.target}</span>
                                {metric.actual && (
                                  <span className="text-xs text-green-600 font-semibold">Actual: {metric.actual}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wins */}
                    {milestone.wins && milestone.wins.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Wins
                        </div>
                        <ul className="space-y-1">
                          {milestone.wins.map((win, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-500 font-bold">✓</span>
                              <span>{win}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Challenges */}
                    {milestone.challenges && milestone.challenges.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Challenges
                        </div>
                        <ul className="space-y-1">
                          {milestone.challenges.map((challenge, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-amber-500 font-bold">⚠</span>
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Adjustments */}
                    {milestone.adjustments && milestone.adjustments.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Adjustments Made
                        </div>
                        <ul className="space-y-1">
                          {milestone.adjustments.map((adjustment, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-blue-500 font-bold">→</span>
                              <span>{adjustment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Review Notes */}
                    {milestone.reviewNotes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-2">Review Notes</div>
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded border border-gray-200">
                          {milestone.reviewNotes}
                        </p>
                      </div>
                    )}

                    {/* Empty State */}
                    {!milestone.keyMetrics?.length && !milestone.wins?.length && !milestone.challenges?.length && !milestone.adjustments?.length && !milestone.reviewNotes && (
                      <div className="text-center py-6 text-gray-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No review data yet. Click edit to add metrics and notes.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editingMilestone && (
        <MilestoneFormModal
          milestone={editingMilestone}
          onSave={handleUpdateMilestone}
          onClose={() => setEditingMilestone(null)}
          kpis={kpis}
        />
      )}
    </div>
  )
}

// =============================================================================
// MILESTONE FORM MODAL
// =============================================================================

interface MilestoneFormModalProps {
  milestone: Milestone
  onSave: (milestone: Milestone) => void
  onClose: () => void
  kpis: KPIData[]
}

function MilestoneFormModal({ milestone, onSave, onClose, kpis }: MilestoneFormModalProps) {
  const [formData, setFormData] = useState<Milestone>({ ...milestone })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addKeyMetric = () => {
    setFormData({
      ...formData,
      keyMetrics: [...(formData.keyMetrics || []), { metric: '', target: '', actual: '' }]
    })
  }

  const updateKeyMetric = (index: number, field: 'metric' | 'target' | 'actual', value: string | number) => {
    const updated = [...(formData.keyMetrics || [])]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, keyMetrics: updated })
  }

  const removeKeyMetric = (index: number) => {
    setFormData({
      ...formData,
      keyMetrics: formData.keyMetrics?.filter((_, i) => i !== index)
    })
  }

  const addItem = (field: 'wins' | 'challenges' | 'adjustments', value: string) => {
    if (!value.trim()) return
    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), value.trim()]
    })
  }

  const removeItem = (field: 'wins' | 'challenges' | 'adjustments', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field]?.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {milestone.title} Review
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status and Completion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Milestone['status'] })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completionDate || ''}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Key Metrics
              </label>
              <button
                type="button"
                onClick={addKeyMetric}
                className="text-xs text-[#4C5D75] hover:text-[#3E3F57] font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Metric
              </button>
            </div>
            <div className="space-y-2">
              {formData.keyMetrics?.map((metric, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={metric.metric}
                    onChange={(e) => updateKeyMetric(idx, 'metric', e.target.value)}
                    placeholder="Metric name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={metric.target}
                    onChange={(e) => updateKeyMetric(idx, 'target', e.target.value)}
                    placeholder="Target"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={metric.actual || ''}
                    onChange={(e) => updateKeyMetric(idx, 'actual', e.target.value)}
                    placeholder="Actual"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyMetric(idx)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Wins */}
          <ArrayInputField
            label="Wins"
            items={formData.wins || []}
            onAdd={(value) => addItem('wins', value)}
            onRemove={(idx) => removeItem('wins', idx)}
            placeholder="Describe a win..."
            icon="✓"
            iconColor="text-green-500"
          />

          {/* Challenges */}
          <ArrayInputField
            label="Challenges"
            items={formData.challenges || []}
            onAdd={(value) => addItem('challenges', value)}
            onRemove={(idx) => removeItem('challenges', idx)}
            placeholder="Describe a challenge..."
            icon="⚠"
            iconColor="text-amber-500"
          />

          {/* Adjustments */}
          <ArrayInputField
            label="Adjustments Made"
            items={formData.adjustments || []}
            onAdd={(value) => addItem('adjustments', value)}
            onRemove={(idx) => removeItem('adjustments', idx)}
            placeholder="Describe an adjustment..."
            icon="→"
            iconColor="text-blue-500"
          />

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Review Notes
            </label>
            <textarea
              value={formData.reviewNotes || ''}
              onChange={(e) => setFormData({ ...formData, reviewNotes: e.target.value })}
              placeholder="Overall reflections and notes from this milestone review..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper component for array input fields
interface ArrayInputFieldProps {
  label: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  placeholder: string
  icon: string
  iconColor: string
}

function ArrayInputField({ label, items, onAdd, onRemove, placeholder, icon, iconColor }: ArrayInputFieldProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <span className={`font-bold ${iconColor} flex-shrink-0 mt-0.5`}>{icon}</span>
              <span className="flex-1 text-sm text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-gray-400 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// KEY ACTIONS TAB
// =============================================================================

interface KeyActionsTabProps {
  keyActions: KeyAction[]
  setKeyActions: (actions: KeyAction[]) => void
  rocks: QuarterlyRock[]
  kpis: KPIData[]
  q1Initiatives: StrategicInitiative[]
}

function KeyActionsTab({ keyActions, setKeyActions, rocks, kpis, q1Initiatives }: KeyActionsTabProps) {
  const [isAddingAction, setIsAddingAction] = useState(false)
  const [editingAction, setEditingAction] = useState<KeyAction | null>(null)
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<ActionPriority | 'all'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('priority')

  const handleAddAction = (action: KeyAction) => {
    setKeyActions([...keyActions, action])
    setIsAddingAction(false)
  }

  const handleUpdateAction = (updatedAction: KeyAction) => {
    setKeyActions(keyActions.map(a => a.id === updatedAction.id ? updatedAction : a))
    setEditingAction(null)
  }

  const handleDeleteAction = (actionId: string) => {
    if (confirm('Are you sure you want to delete this action?')) {
      setKeyActions(keyActions.filter(a => a.id !== actionId))
    }
  }

  // Filter and sort actions
  const filteredActions = keyActions
    .filter(action => filterStatus === 'all' || action.status === filterStatus)
    .filter(action => filterPriority === 'all' || action.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { p1: 1, p2: 2, p3: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else {
        const statusOrder = { completed: 4, in_progress: 1, blocked: 2, not_started: 3, cancelled: 5 }
        return statusOrder[a.status] - statusOrder[b.status]
      }
    })

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'blocked': return 'bg-red-100 text-red-700 border-red-300'
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority: ActionPriority) => {
    switch (priority) {
      case 'p1': return 'bg-red-500 text-white'
      case 'p2': return 'bg-[#948687] text-white'
      case 'p3': return 'bg-[#8E9AAF] text-white'
    }
  }

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'in_progress': return <PlayCircle className="w-4 h-4" />
      case 'blocked': return <AlertCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  // Calculate stats
  const stats = {
    total: keyActions.length,
    completed: keyActions.filter(a => a.status === 'completed').length,
    inProgress: keyActions.filter(a => a.status === 'in_progress').length,
    blocked: keyActions.filter(a => a.status === 'blocked').length,
    p1: keyActions.filter(a => a.priority === 'p1').length
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Key Actions</h3>
            <p className="text-sm text-gray-600">
              Track and manage all action items for this sprint
            </p>
          </div>
          <button
            onClick={() => setIsAddingAction(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Action
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Total Actions</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-700 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-[#8E9AAF]">
            <div className="text-xs text-[#4C5D75] mb-1">In Progress</div>
            <div className="text-2xl font-bold text-[#4C5D75]">{stats.inProgress}</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-red-700 mb-1">Blocked</div>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-[#8E9AAF]">
            <div className="text-xs text-[#3E3F57] mb-1">P1 Actions</div>
            <div className="text-2xl font-bold text-[#3E3F57]">{stats.p1}</div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
          >
            <option value="all">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
          >
            <option value="all">All</option>
            <option value="p1">P1 - Must Do</option>
            <option value="p2">P2 - Should Do</option>
            <option value="p3">P3 - Nice to Have</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-gray-600">
          Showing {filteredActions.length} of {keyActions.length} actions
        </div>
      </div>

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {keyActions.length === 0 ? 'No Actions Yet' : 'No Actions Match Filters'}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {keyActions.length === 0 ? 'Start by adding your first action item' : 'Try adjusting your filters'}
          </p>
          {keyActions.length === 0 && (
            <button
              onClick={() => setIsAddingAction(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Action
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActions.map(action => {
            const dueDate = new Date(action.dueDate)
            const isOverdue = dueDate < new Date() && action.status !== 'completed'

            return (
              <div
                key={action.id}
                className={`bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                  action.status === 'blocked' ? 'border-red-300 bg-red-50' :
                  isOverdue ? 'border-amber-300 bg-amber-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg ${getPriorityColor(action.priority)} font-bold text-sm flex items-center justify-center`}>
                      {action.priority.toUpperCase()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-base font-semibold text-gray-900 flex-1">{action.action}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getStatusColor(action.status)}`}>
                          {getStatusIcon(action.status)}
                          {action.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setEditingAction(action)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAction(action.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {action.description && (
                      <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{action.owner}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        <span>Due {dueDate.toLocaleDateString()}</span>
                        {isOverdue && <span className="text-xs">(Overdue!)</span>}
                      </div>
                      {action.weekNumber && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Week {action.weekNumber}</span>
                        </div>
                      )}
                      {action.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{action.estimatedHours}h</span>
                        </div>
                      )}
                      {action.linkedRocks && action.linkedRocks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          <span>{action.linkedRocks.length} rock(s)</span>
                        </div>
                      )}
                      {action.linkedKPIs && action.linkedKPIs.length > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{action.linkedKPIs.length} KPI(s)</span>
                        </div>
                      )}
                    </div>

                    {/* Blockers */}
                    {action.blockers && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-red-700">Blocker: </span>
                            <span className="text-xs text-red-600">{action.blockers}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress Notes */}
                    {action.progressNotes && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-xs text-blue-700 italic">{action.progressNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddingAction || editingAction) && (
        <ActionFormModal
          action={editingAction}
          onSave={editingAction ? handleUpdateAction : handleAddAction}
          onClose={() => {
            setIsAddingAction(false)
            setEditingAction(null)
          }}
          rocks={rocks}
          kpis={kpis}
          q1Initiatives={q1Initiatives}
        />
      )}
    </div>
  )
}

// =============================================================================
// ACTION FORM MODAL
// =============================================================================

interface ActionFormModalProps {
  action: KeyAction | null
  onSave: (action: KeyAction) => void
  onClose: () => void
  rocks: QuarterlyRock[]
  kpis: KPIData[]
  q1Initiatives: StrategicInitiative[]
}

function ActionFormModal({ action, onSave, onClose, rocks, kpis, q1Initiatives }: ActionFormModalProps) {
  const [formData, setFormData] = useState<Partial<KeyAction>>(
    action || {
      id: '',
      action: '',
      description: '',
      owner: '',
      status: 'not_started',
      priority: 'p2',
      dueDate: '',
      estimatedHours: undefined,
      linkedRocks: [],
      linkedKPIs: [],
      linkedInitiatives: [],
      weekNumber: undefined,
      blockers: '',
      progressNotes: '',
      tags: []
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.action || !formData.owner || !formData.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    const actionData: KeyAction = {
      id: formData.id || `action-${Date.now()}`,
      action: formData.action,
      description: formData.description,
      owner: formData.owner,
      status: formData.status || 'not_started',
      priority: formData.priority || 'p2',
      dueDate: formData.dueDate,
      completionDate: formData.completionDate,
      estimatedHours: formData.estimatedHours,
      linkedRocks: formData.linkedRocks || [],
      linkedKPIs: formData.linkedKPIs || [],
      linkedInitiatives: formData.linkedInitiatives || [],
      weekNumber: formData.weekNumber,
      blockers: formData.blockers,
      progressNotes: formData.progressNotes,
      tags: formData.tags || []
    }

    onSave(actionData)
  }

  const toggleRock = (rockId: string) => {
    const current = formData.linkedRocks || []
    setFormData({
      ...formData,
      linkedRocks: current.includes(rockId) ? current.filter(id => id !== rockId) : [...current, rockId]
    })
  }

  const toggleKPI = (kpiId: string) => {
    const current = formData.linkedKPIs || []
    setFormData({
      ...formData,
      linkedKPIs: current.includes(kpiId) ? current.filter(id => id !== kpiId) : [...current, kpiId]
    })
  }

  const toggleInitiative = (initiativeId: string) => {
    const current = formData.linkedInitiatives || []
    setFormData({
      ...formData,
      linkedInitiatives: current.includes(initiativeId) ? current.filter(id => id !== initiativeId) : [...current, initiativeId]
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {action ? 'Edit Action' : 'Add New Action'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Action Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Action *
            </label>
            <input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="e.g., Launch email marketing campaign, Hire new developer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this action..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
            />
          </div>

          {/* Owner, Status, Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Owner *
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ActionStatus })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ActionPriority })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
                required
              >
                <option value="p1">P1 - Must Do</option>
                <option value="p2">P2 - Should Do</option>
                <option value="p3">P3 - Nice to Have</option>
              </select>
            </div>
          </div>

          {/* Due Date, Week, Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Week # (1-13)
              </label>
              <input
                type="number"
                min="1"
                max="13"
                value={formData.weekNumber || ''}
                onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Est. Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
              />
            </div>
          </div>

          {/* Linked Rocks */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Linked Rocks (Optional)
            </label>
            {rocks.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No rocks available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {rocks.map(rock => (
                  <label key={rock.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.linkedRocks?.includes(rock.id)}
                      onChange={() => toggleRock(rock.id)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{rock.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Linked KPIs */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Linked KPIs (Optional)
            </label>
            {kpis.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No KPIs available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {kpis.map(kpi => (
                  <label key={kpi.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.linkedKPIs?.includes(kpi.id)}
                      onChange={() => toggleKPI(kpi.id)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{kpi.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Blockers
            </label>
            <textarea
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              placeholder="What's blocking this action?"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
            />
          </div>

          {/* Progress Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Progress Notes
            </label>
            <textarea
              value={formData.progressNotes}
              onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value })}
              placeholder="Current progress, updates, or notes..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C5D75]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4C5D75] text-white rounded-lg hover:bg-[#3E3F57] transition-colors"
            >
              {action ? 'Update Action' : 'Add Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Placeholder components for remaining tabs
function WeeklyCheckInsTab({ checkIns, setCheckIns, keyActions, sprintQuarter }: any) {
  return <div className="text-center py-12 text-gray-600">Weekly Check-ins tab - coming next</div>
}

function ProgressDashboardTab({ rocks, milestones, keyActions, checkIns, progressMetrics, quarterlyTargets, sprintQuarter }: any) {
  return <div className="text-center py-12 text-gray-600">Progress Dashboard tab - coming next</div>
}
