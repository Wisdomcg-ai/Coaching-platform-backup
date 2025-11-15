'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { WISDOM_ROADMAP_DATA } from './wisdom-roadmap-data'
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  Circle,
  Zap,
  Building2,
  Rocket,
  Crown,
  Trophy,
  Megaphone,
  ShoppingCart,
  Heart,
  Settings,
  Calculator,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  Lightbulb
} from 'lucide-react'

type Business = Database['public']['Tables']['businesses']['Row']

// Icon mapping for engines
const ENGINE_ICONS: Record<string, React.ElementType> = {
  attract: Megaphone,
  convert: ShoppingCart,
  'deliver-cx': Heart,
  'deliver-people': Users,
  'deliver-systems': Settings,
  finance: Calculator,
  leadership: Crown,
  time: Target
}

// Map Wisdom Roadmap data to format used by current page
const BUSINESS_ENGINES = WISDOM_ROADMAP_DATA.map(engine => ({
  id: engine.id,
  name: engine.name,
  subtitle: engine.subtitle,
  icon: ENGINE_ICONS[engine.id],
  color: `text-${engine.id === 'attract' ? 'blue' : engine.id === 'convert' ? 'green' : engine.id === 'deliver-cx' ? 'purple' : engine.id === 'deliver-people' ? 'orange' : engine.id === 'deliver-systems' ? 'indigo' : engine.id === 'finance' ? 'red' : engine.id === 'leadership' ? 'yellow' : 'teal'}-600`,
  bgColor: `bg-${engine.id === 'attract' ? 'blue' : engine.id === 'convert' ? 'green' : engine.id === 'deliver-cx' ? 'purple' : engine.id === 'deliver-people' ? 'orange' : engine.id === 'deliver-systems' ? 'indigo' : engine.id === 'finance' ? 'red' : engine.id === 'leadership' ? 'yellow' : 'teal'}-50`,
  borderColor: `border-${engine.id === 'attract' ? 'blue' : engine.id === 'convert' ? 'green' : engine.id === 'deliver-cx' ? 'purple' : engine.id === 'deliver-people' ? 'orange' : engine.id === 'deliver-systems' ? 'indigo' : engine.id === 'finance' ? 'red' : engine.id === 'leadership' ? 'yellow' : 'teal'}-200`,
  stages: {
    foundation: {
      priorities: (engine.stages.foundation || []).map(build => `"${build.name}" - ${build.description}`),
      metrics: engine.metrics,
      builds: engine.stages.foundation || []
    },
    traction: {
      priorities: (engine.stages.traction || []).map(build => `"${build.name}" - ${build.description}`),
      metrics: engine.metrics,
      builds: engine.stages.traction || []
    },
    scaling: {
      priorities: (engine.stages.scaling || []).map(build => `"${build.name}" - ${build.description}`),
      metrics: engine.metrics,
      builds: engine.stages.scaling || []
    },
    optimization: {
      priorities: (engine.stages.optimization || []).map(build => `"${build.name}" - ${build.description}`),
      metrics: engine.metrics,
      builds: engine.stages.optimization || []
    },
    leadership: {
      priorities: (engine.stages.leadership || []).map(build => `"${build.name}" - ${build.description}`),
      metrics: engine.metrics,
      builds: engine.stages.leadership || []
    },
    mastery: {
      priorities: (engine.stages.mastery || []).map(build => `"${build.name}" - ${build.description}`),
      metrics: engine.metrics,
      builds: engine.stages.mastery || []
    }
  }
}))

// Revenue stages with their characteristics - matching your methodology
const REVENUE_STAGES = [
  {
    id: 'foundation',
    name: 'Foundation',
    range: '$0-250K',
    min: 0,
    max: 250000,
    icon: Building2,
    color: 'from-gray-500 to-gray-600',
    borderColor: 'border-gray-500',
    bgColor: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    focus: 'Prove concept & reach breakeven',
    keyChallenge: 'Finding product-market fit',
    primaryGoal: 'Consistent revenue + breakeven',
    profitTarget: 'Breakeven to 5%',
    successDisciplines: ['Time Management', 'Financial Acumen', 'Decision-Making'],
  },
  {
    id: 'traction',
    name: 'Traction',
    range: '$250K-1M',
    min: 250000,
    max: 1000000,
    icon: Rocket,
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    focus: 'Scale & systematize + pay owner',
    keyChallenge: 'Building repeatable systems',
    primaryGoal: 'Owner salary + 10-15% profit',
    profitTarget: '10-15% net profit',
    successDisciplines: ['Operational Excellence', 'Strategic Marketing', 'Leadership Development'],
  },
  {
    id: 'scaling',
    name: 'Scaling',
    range: '$1M-3M',
    min: 1000000,
    max: 3000000,
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    focus: 'Optimize & grow + healthy margins',
    keyChallenge: 'Managing complexity',
    primaryGoal: 'Scalable operations + 15-20% profit',
    profitTarget: '15-20% net profit',
    successDisciplines: ['Leadership Development', 'Accountability', 'Technology & AI'],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    range: '$3M-5M',
    min: 3000000,
    max: 5000000,
    icon: Zap,
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
    focus: 'Perfect & expand + maximize profit',
    keyChallenge: 'System efficiency',
    primaryGoal: 'Excellence + 20%+ profit',
    profitTarget: '20%+ net profit',
    successDisciplines: ['Strategic Excellence', 'Growth Mindset', 'Systems Thinking'],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    range: '$5M-10M',
    min: 5000000,
    max: 10000000,
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    focus: 'Lead & innovate + strategic profit',
    keyChallenge: 'Market positioning',
    primaryGoal: 'Market leadership + strategic growth',
    profitTarget: 'Strategic profit optimization',
    successDisciplines: ['Visionary Leadership', 'Strategic Partnerships', 'Market Innovation'],
  },
  {
    id: 'mastery',
    name: 'Mastery',
    range: '$10M+',
    min: 10000000,
    max: Infinity,
    icon: Trophy,
    color: 'from-red-500 to-red-600',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    iconBg: 'bg-red-100',
    focus: 'Empire building + wealth creation',
    keyChallenge: 'Building lasting value',
    primaryGoal: 'Legacy + diversification',
    profitTarget: 'Maximum profitability + wealth',
    successDisciplines: ['Strategic Acquisitions', 'Enterprise Leadership', 'Wealth Creation'],
  },
]


export default function RevenueRoadmap() {
  const router = useRouter()
  const supabase = createClient()
  const [business, setBusiness] = useState<Business | null>(null)
  const [currentStage, setCurrentStage] = useState<typeof REVENUE_STAGES[0] | null>(null)
  const [expandedEngines, setExpandedEngines] = useState<string[]>(['attract'])
  const [expandedStages, setExpandedStages] = useState<string[]>([])
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (data) {
        setBusiness(data)
        
        // Determine current stage based on revenue
        const revenue = data.annual_revenue || 0
        const stage = REVENUE_STAGES.find(s => revenue >= s.min && revenue < s.max) || REVENUE_STAGES[0]
        setCurrentStage(stage)
      }
    } catch (error) {
      console.error('Error loading business:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress to next stage
  const calculateProgress = () => {
    if (!business || !currentStage) return 0
    const revenue = business.annual_revenue || 0
    
    if (currentStage.max === Infinity) return 100
    
    const stageProgress = ((revenue - currentStage.min) / (currentStage.max - currentStage.min)) * 100
    return Math.min(100, Math.max(0, stageProgress))
  }

  // Get next stage
  const getNextStage = () => {
    if (!currentStage) return null
    const currentIndex = REVENUE_STAGES.findIndex(s => s.id === currentStage.id)
    return REVENUE_STAGES[currentIndex + 1] || null
  }

  // Toggle engine expansion
  const toggleEngine = (engineId: string) => {
    setExpandedEngines(prev =>
      prev.includes(engineId)
        ? prev.filter(id => id !== engineId)
        : [...prev, engineId]
    )
  }

  // Toggle stage expansion in journey table
  const toggleStage = (stageId: string) => {
    setExpandedStages(prev =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    )
  }

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading revenue roadmap...</div>
      </div>
    )
  }

  const nextStage = getNextStage()
  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Stage Roadmap</h1>
              <p className="text-gray-600 mt-2">
                Your comprehensive growth path with stage-specific priorities
              </p>
            </div>
            
            {business && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(business.annual_revenue || 0).toLocaleString()}
                </div>
                {business.net_margin && (
                  <div className="text-sm text-gray-600 mt-1">
                    Net Margin: <span className={`font-medium ${
                      business.net_margin >= 15 ? 'text-green-600' : 
                      business.net_margin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{business.net_margin}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stage Progress Visual */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {REVENUE_STAGES.map((stage, index) => {
              const Icon = stage.icon
              const isCurrent = currentStage?.id === stage.id
              const isPast = (business?.annual_revenue || 0) > stage.max
              const isFuture = (business?.annual_revenue || 0) < stage.min
              
              return (
                <div key={stage.id} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCurrent 
                          ? `bg-gradient-to-r ${stage.color} text-white shadow-lg scale-110` 
                          : isPast 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium ${
                        isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage.name}
                      </div>
                      <div className={`text-xs ${
                        isCurrent ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {stage.range}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection line */}
                  {index < REVENUE_STAGES.length - 1 && (
                    <div 
                      className={`absolute top-6 left-1/2 w-full h-0.5 ${
                        isPast ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Stage Details - Redesigned */}
        {currentStage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Current Stage Card - More Compact */}
            <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${currentStage.borderColor}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${currentStage.iconBg} flex-shrink-0`}>
                  <currentStage.icon className={`w-6 h-6 text-${currentStage.id}-600`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Current Stage</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${currentStage.color} bg-clip-text text-transparent mb-3`}>
                    {currentStage.name}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{currentStage.focus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-green-600">{currentStage.profitTarget}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Top Success Disciplines</div>
                    <div className="flex flex-wrap gap-1">
                      {currentStage.successDisciplines.map((discipline, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {discipline}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Stage Info - Compact */}
            {nextStage ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Path to {nextStage.name}</h3>
                  <span className="text-2xl font-bold text-gray-900">
                    ${(nextStage.min - (business?.annual_revenue || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${nextStage.color} h-2 rounded-full transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Target Margin</span>
                    <span className="text-sm font-medium text-green-600">{nextStage.profitTarget}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
                <Trophy className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Mastery Achieved!</h3>
                <p className="text-sm opacity-90">
                  Focus on empire building, strategic acquisitions, and wealth creation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Journey to Mastery Table */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🏔️ Journey to Mastery</h2>
            <p className="text-gray-600">See your complete path across all business engines - click any stage to expand</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header Row - Engine Names */}
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-10 min-w-[150px]">
                    STAGE
                  </th>
                  {BUSINESS_ENGINES.map((engine) => {
                    const Icon = engine.icon
                    return (
                      <th key={engine.id} className={`text-center p-3 ${engine.bgColor} min-w-[160px]`}>
                        <div className="flex flex-col items-center gap-1">
                          <Icon className={`w-5 h-5 ${engine.color}`} />
                          <div className="font-semibold text-gray-900 text-sm">{engine.name.replace(' Engine', '')}</div>
                          <div className="text-xs text-gray-600">{engine.subtitle}</div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Body - Stages in reverse order (Mastery at top) */}
              <tbody>
                {[...REVENUE_STAGES].reverse().map((stage) => {
                  const Icon = stage.icon
                  const isCurrent = currentStage?.id === stage.id
                  const isPast = (business?.annual_revenue || 0) > stage.max
                  const isExpanded = expandedStages.includes(stage.id)

                  return (
                    <React.Fragment key={stage.id}>
                      {/* Stage Row - Clickable */}
                      <tr
                        className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isCurrent ? 'bg-blue-50' : isPast ? 'bg-green-50' : ''
                        }`}
                        onClick={() => toggleStage(stage.id)}
                      >
                        {/* Stage Name Column */}
                        <td className="p-3 sticky left-0 z-10 bg-inherit">
                          <div className="flex items-center gap-2">
                            <div>
                              {isCurrent ? (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              ) : isPast ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                            <div className={`p-2 rounded-lg ${stage.iconBg} flex-shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className={`font-semibold text-sm ${isCurrent ? 'text-blue-700' : isPast ? 'text-green-700' : 'text-gray-700'}`}>
                                {stage.name}
                              </div>
                              <div className="text-xs text-gray-600">{stage.range}</div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                            )}
                          </div>
                        </td>

                        {/* Engine Cells - Summary */}
                        {BUSINESS_ENGINES.map((engine) => {
                          const stageData = engine.stages[stage.id as keyof typeof engine.stages]
                          return (
                            <td key={engine.id} className={`p-3 text-center ${isCurrent ? 'font-medium' : isPast ? '' : 'text-gray-500'}`}>
                              <div className="text-xs">
                                {stageData.priorities[0]}
                              </div>
                              {isExpanded && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{stageData.priorities.length - 1} more
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className={`border-b border-gray-200 ${isCurrent ? 'bg-blue-25' : isPast ? 'bg-green-25' : 'bg-gray-25'}`}>
                          <td colSpan={BUSINESS_ENGINES.length + 1} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {BUSINESS_ENGINES.map((engine) => {
                                const Icon = engine.icon
                                const stageData = engine.stages[stage.id as keyof typeof engine.stages]

                                return (
                                  <div key={engine.id} className={`border ${engine.borderColor} rounded-lg p-4 ${engine.bgColor}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Icon className={`w-4 h-4 ${engine.color}`} />
                                      <h4 className="font-semibold text-sm text-gray-900">{engine.name.replace(' Engine', '')}</h4>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                      <div className="text-xs font-medium text-gray-700">Priorities:</div>
                                      <ul className="text-xs text-gray-600 space-y-1">
                                        {stageData.priorities.slice(0, 4).map((priority, idx) => (
                                          <li key={idx} className="flex items-start gap-1">
                                            <span className="text-gray-400">•</span>
                                            <span>{priority}</span>
                                          </li>
                                        ))}
                                        {stageData.priorities.length > 4 && (
                                          <li className="text-gray-400 italic">+{stageData.priorities.length - 4} more...</li>
                                        )}
                                      </ul>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="text-xs font-medium text-gray-700">Key Metrics:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {stageData.metrics.slice(0, 3).map((metric, idx) => (
                                          <span key={idx} className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                                            {metric}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Current Stage</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-gray-300" />
              <span>Future</span>
            </div>
          </div>
        </div>

        {/* Business Engines Section - With Checklists */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Stage Action Checklist</h2>
            <p className="text-gray-600">Track your progress by checking off completed priorities</p>
          </div>
          
          {/* All Engines Accordion with Checklists */}
          <div className="space-y-3">
            {BUSINESS_ENGINES.map((engine) => {
              const Icon = engine.icon
              const isExpanded = expandedEngines.includes(engine.id)
              const stageData = currentStage ? engine.stages[currentStage.id as keyof typeof engine.stages] : null
              
              return (
                <div key={engine.id} className={`border ${engine.borderColor} rounded-lg overflow-hidden`}>
                  <button
                    onClick={() => toggleEngine(engine.id)}
                    className={`w-full px-6 py-4 ${engine.bgColor} hover:opacity-90 transition-all flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${engine.color}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{engine.name}</h3>
                        <p className="text-sm text-gray-600">{engine.subtitle}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && stageData && (
                    <div className="p-6 bg-white border-t">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Priorities as Checklist */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Priorities Checklist</h4>
                          <div className="space-y-2">
                            {stageData.priorities.map((priority, index) => {
                              const taskId = `${engine.id}-${index}`
                              return (
                                <label key={index} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={completedTasks[taskId] || false}
                                    onChange={() => toggleTask(taskId)}
                                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className={`text-sm ${completedTasks[taskId] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {priority}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Metrics */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Key Metrics to Track</h4>
                          <div className="flex flex-wrap gap-2">
                            {stageData.metrics.map((metric, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/assessment')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Take Full Assessment
          </button>
          <button
            onClick={() => router.push('/swot')}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            SWOT Analysis
          </button>
        </div>
      </div>
    </div>
  )
}