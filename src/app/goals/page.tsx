'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStrategicPlanning } from './hooks/useStrategicPlanning'
import Step1GoalsAndKPIs from './components/Step1GoalsAndKPIs'
import Step2StrategicIdeas from './components/Step2StrategicIdeas'
import Step4RefineInitiatives from './components/Step4RefineInitiatives'
import Step5AnnualPlan from './components/Step5AnnualPlan'
import Step690DaySprintV3 from './components/Step690DaySprintV3'
import { FinancialData, KPIData, StrategicInitiative, YearType } from './types'
import { Target, ListChecks, Calendar, Zap, Brain, Rocket, ChevronLeft, ChevronRight, CheckCircle, Loader2, TrendingUp, AlertCircle, Info, HelpCircle, ChevronDown, Shield, AlertTriangle as AlertTriangleIcon, Lightbulb } from 'lucide-react'
import CoachNavbar from '@/components/coach/CoachNavbar'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

type StepNumber = 1 | 2 | 3 | 4 | 5

interface StepInfo {
  num: StepNumber
  label: string
  title: string
  icon: React.ElementType
  description: string
}

interface SwotItem {
  id: string
  category: 'strength' | 'weakness' | 'opportunity' | 'threat'
  title: string
  description: string | null
  impact_level: number
  likelihood?: number
}

const STEPS: StepInfo[] = [
  {
    num: 1,
    label: '3yr Goals & KPIs',
    title: 'Set Your 3-Year Goals & KPIs',
    icon: Target,
    description: 'Define financial targets and key performance indicators'
  },
  {
    num: 2,
    label: 'Strategic Ideas',
    title: 'Capture Strategic Ideas',
    icon: Brain,
    description: 'Capture ideas and review roadmap suggestions by business engine'
  },
  {
    num: 3,
    label: 'Prioritize',
    title: 'Prioritize Your Initiatives',
    icon: CheckCircle,
    description: 'Select and order your top 12-20 initiatives for the year'
  },
  {
    num: 4,
    label: 'Annual Plan',
    title: 'Distribute Across Quarters',
    icon: Calendar,
    description: 'Plan Q1, Q2, Q3, Q4 execution'
  },
  {
    num: 5,
    label: '90-Day Sprint',
    title: 'Define Your 90-Day Sprint',
    icon: Rocket,
    description: 'Focus on Q1 with specific actions'
  }
]

// Coaching help content for each step
const STEP_COACHING: Record<StepNumber, { questions: string[]; tips: string[] }> = {
  1: {
    questions: [
      "What does success look like 3 years from now? (Revenue, team size, lifestyle)",
      "Which metrics truly matter to your business model? (Not just vanity metrics)",
      "Are your goals aligned with your SWOT strengths and opportunities?",
      "What growth rate is ambitious yet achievable based on your current trajectory?"
    ],
    tips: [
      "Strong Goal: '$2M revenue, 15 employees, 4-day work week' - Specific, measurable, meaningful",
      "Weak Goal: 'Grow the business and be successful' - Too vague, not actionable",
      "Your 3-year vision should stretch you but not break you - aim for 3-5x growth, not 100x"
    ]
  },
  2: {
    questions: [
      "What initiatives would leverage your biggest strengths?",
      "What ideas directly address your critical weaknesses?",
      "Which opportunities have the highest potential ROI?",
      "What quick wins can build momentum while working on bigger initiatives?"
    ],
    tips: [
      "Capture everything first - don't filter yet. Prioritization comes in Step 3.",
      "Look at your SWOT: SO strategies (Strength+Opportunity) are often the highest value",
      "Consider both revenue-generating AND operational improvement initiatives"
    ]
  },
  3: {
    questions: [
      "Which 12-20 initiatives will move you closest to your 3-year goals?",
      "Are you balancing quick wins (Q1-Q2) with strategic bets (Q3-Q4)?",
      "Do you have the resources (time, money, people) to execute these?",
      "Which initiatives are dependencies for others? (Do those first)"
    ],
    tips: [
      "Aim for 12-20 initiatives total - more than that and you'll spread too thin",
      "80/20 rule: 20% of initiatives will drive 80% of your progress - prioritize ruthlessly",
      "It's okay to defer good ideas - focus creates results, spreading thin creates burnout"
    ]
  },
  4: {
    questions: [
      "Which initiatives must happen in Q1 to enable the rest?",
      "Are you front-loading too much? (Leave room for unexpected opportunities)",
      "Does each quarter have a clear theme or focus area?",
      "Have you scheduled time for quarterly reviews and course corrections?"
    ],
    tips: [
      "Q1 should be your most concrete - you're executing this immediately",
      "Q2-Q4 can be more flexible - adjust based on Q1 learnings",
      "Balance 'foundation-building' initiatives with 'revenue-generating' ones each quarter"
    ]
  },
  5: {
    questions: [
      "What are the 3-5 most critical actions that will define Q1 success?",
      "Who specifically is responsible for each key action?",
      "What's your weekly rhythm for reviewing progress and staying on track?",
      "What will you stop doing to create space for these priorities?"
    ],
    tips: [
      "90 days goes fast - focus is everything. Less is more.",
      "Strong action: 'Launch MVP to 10 pilot customers by Mar 15 (Sarah owns)'",
      "Weak action: 'Work on product development' - no deadline, no owner, not specific",
      "Schedule weekly 15-min check-ins with yourself or team to maintain momentum"
    ]
  }
}

export default function StrategicPlanningPage() {
  const searchParams = useSearchParams()

  // Hydration fix: ensure state matches between server and client
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)
  const [isSaving, setIsSaving] = useState(false)

  // Only render interactive content after mounting
  useEffect(() => {
    setMounted(true)

    // Check for step parameter in URL
    const stepParam = searchParams.get('step')
    if (stepParam) {
      const stepNum = parseInt(stepParam)
      if (stepNum >= 1 && stepNum <= 5) {
        setCurrentStep(stepNum as StepNumber)
      }
    }
  }, [searchParams])

  // Load all data using the hook
  const {
    isLoading,
    error,
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
    businessId,
    industry,
    strategicIdeas,
    setStrategicIdeas,
    roadmapSuggestions,
    setRoadmapSuggestions,
    twelveMonthInitiatives,
    setTwelveMonthInitiatives,
    annualPlanByQuarter,
    setAnnualPlanByQuarter,
    quarterlyTargets,
    setQuarterlyTargets,
    sprintFocus,
    setSprintFocus,
    sprintKeyActions,
    setSprintKeyActions,
    operationalActivities,
    setOperationalActivities,
    saveAllData
  } = useStrategicPlanning()

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showKPIModal, setShowKPIModal] = useState(false)
  const [showStepHelp, setShowStepHelp] = useState(false)
  const [showSwotSummary, setShowSwotSummary] = useState(false)
  const [swotItems, setSwotItems] = useState<SwotItem[]>([])
  const [loadingSwot, setLoadingSwot] = useState(false)

  // Auto-save whenever data changes
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (!isLoading && mounted && (
        financialData ||
        coreMetrics ||
        kpis ||
        strategicIdeas ||
        roadmapSuggestions ||
        twelveMonthInitiatives ||
        annualPlanByQuarter ||
        sprintFocus ||
        sprintKeyActions ||
        operationalActivities
      )) {
        setIsSaving(true)
        await saveAllData()
        setIsSaving(false)
      }
    }, 3000) // 3 seconds - better for user experience

    return () => clearTimeout(saveTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    mounted,
    financialData,
    coreMetrics,
    kpis,
    strategicIdeas,
    roadmapSuggestions,
    twelveMonthInitiatives,
    annualPlanByQuarter,
    sprintFocus,
    sprintKeyActions,
    operationalActivities
    // Note: saveAllData is intentionally excluded to prevent stale closure bugs
  ])

  // Load SWOT data for strategic context
  useEffect(() => {
    const loadSwotData = async () => {
      if (!businessId || !mounted) return

      try {
        setLoadingSwot(true)
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get the most recent SWOT analysis
        const { data: analysis, error: analysisError } = await supabase
          .from('swot_analyses')
          .select('id')
          .eq('business_id', businessId)
          .eq('type', 'quarterly')
          .order('year', { ascending: false })
          .order('quarter', { ascending: false })
          .limit(1)
          .single()

        if (analysisError || !analysis) {
          setSwotItems([])
          return
        }

        // Get SWOT items for this analysis
        const { data: items, error: itemsError } = await supabase
          .from('swot_items')
          .select('id, category, title, description, impact_level, likelihood')
          .eq('swot_analysis_id', analysis.id)
          .order('impact_level', { ascending: false })

        if (!itemsError && items) {
          setSwotItems(items)
        }
      } catch (err) {
        console.error('Error loading SWOT data:', err)
      } finally {
        setLoadingSwot(false)
      }
    }

    loadSwotData()
  }, [businessId, mounted])

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section)
    } else {
      newCollapsed.add(section)
    }
    setCollapsedSections(newCollapsed)
  }

  // Get top items by category
  const getTopItemsByCategory = (category: SwotItem['category'], limit = 3): SwotItem[] => {
    return swotItems
      .filter(item => item.category === category)
      .sort((a, b) => b.impact_level - a.impact_level)
      .slice(0, limit)
  }

  const topStrengths = getTopItemsByCategory('strength')
  const topWeaknesses = getTopItemsByCategory('weakness')
  const topOpportunities = getTopItemsByCategory('opportunity')
  const topThreats = getTopItemsByCategory('threat')

  // HYDRATION FIX: Show skeleton before mounting
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Strategic Planning Wizard</h1>
                <p className="text-base text-gray-600 mt-1">Build your 3-year roadmap, step by step</p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate progress with safe defaults
  const safeAnnualPlan = annualPlanByQuarter || { q1: [], q2: [], q3: [], q4: [] }
  const step1Complete = (financialData?.revenue?.year1 || 0) > 0 && (kpis?.length || 0) > 0
  const step2Complete = (strategicIdeas?.length || 0) > 0
  const step3Complete = (twelveMonthInitiatives?.length || 0) >= 12 && (twelveMonthInitiatives?.length || 0) <= 20
  const step4Complete = Object.values(safeAnnualPlan).some(q => (q?.length || 0) > 0)
  const step5Complete = (sprintFocus?.length || 0) > 0 && (sprintKeyActions?.length || 0) >= 3

  const stepCompletion = [step1Complete, step2Complete, step3Complete, step4Complete, step5Complete]
  const completedCount = stepCompletion.filter(Boolean).length
  const progressPercent = Math.round((completedCount / 5) * 100)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your strategic plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error loading data</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const currentStepInfo = STEPS.find(s => s.num === currentStep)!
  const canGoPrevious = currentStep > 1
  const canGoNext = currentStep < 5

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNavbar businessId={businessId} />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Strategic Planning Wizard</h1>
              <p className="text-base text-gray-600 mt-1">Build your 3-year roadmap, step by step</p>
            </div>
            <div className="flex items-center space-x-3">
              {isSaving && (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {!isSaving && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Auto-saved
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-blue-600">{completedCount}/5 steps</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Integration - Expandable Inline Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowSwotSummary(!showSwotSummary)}
            className="w-full py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">
                  Your Strategic Context {swotItems.length > 0 && `(${swotItems.length} SWOT items)`}
                </h3>
                <p className="text-sm text-gray-600">
                  {showSwotSummary ? 'Hide' : 'Show'} your top strengths, weaknesses, opportunities, and threats
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-blue-600 transition-transform ${showSwotSummary ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Expandable SWOT Summary */}
          {showSwotSummary && (
            <div className="pb-4">
              {loadingSwot ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading SWOT insights...</p>
                </div>
              ) : swotItems.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center border-2 border-dashed border-blue-200">
                  <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-gray-900 mb-2">No SWOT Analysis Yet</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your SWOT analysis first to see strategic insights here
                  </p>
                  <Link
                    href="/swot"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to SWOT Analysis →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {/* Top Strengths */}
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-sm text-green-900">
                          Top Strengths ({topStrengths.length})
                        </h4>
                      </div>
                      {topStrengths.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No strengths identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {topStrengths.map(item => (
                            <li key={item.id} className="flex items-start text-sm text-gray-700">
                              <span className="text-green-600 mr-2 mt-0.5">•</span>
                              <span>{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Top Weaknesses */}
                    <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangleIcon className="w-4 h-4 text-red-600" />
                        <h4 className="font-semibold text-sm text-red-900">
                          Top Weaknesses ({topWeaknesses.length})
                        </h4>
                      </div>
                      {topWeaknesses.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No weaknesses identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {topWeaknesses.map(item => (
                            <li key={item.id} className="flex items-start text-sm text-gray-700">
                              <span className="text-red-600 mr-2 mt-0.5">•</span>
                              <span>{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Top Opportunities */}
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-sm text-blue-900">
                          Top Opportunities ({topOpportunities.length})
                        </h4>
                      </div>
                      {topOpportunities.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No opportunities identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {topOpportunities.map(item => (
                            <li key={item.id} className="flex items-start text-sm text-gray-700">
                              <span className="text-blue-600 mr-2 mt-0.5">•</span>
                              <span>{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Top Threats */}
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-sm text-orange-900">
                          Top Threats ({topThreats.length})
                        </h4>
                      </div>
                      {topThreats.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No threats identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {topThreats.map(item => (
                            <li key={item.id} className="flex items-start text-sm text-gray-700">
                              <span className="text-orange-600 mr-2 mt-0.5">•</span>
                              <span>{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Link to full SWOT */}
                  <div className="text-center pt-2">
                    <a
                      href="/swot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View full SWOT analysis in new tab
                      <span className="ml-1">↗</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.num
              const isComplete = stepCompletion[step.num - 1]
              const Icon = step.icon

              return (
                <div key={step.num} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.num)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : isComplete
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">{step.label}</span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div className="hidden sm:block mx-2 w-8 h-0.5 bg-gray-300" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {currentStepInfo && (
                <>
                  <currentStepInfo.icon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Step {currentStep}: {currentStepInfo.title}
                  </h2>
                </>
              )}
            </div>
            <button
              onClick={() => setShowStepHelp(!showStepHelp)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              {showStepHelp ? 'Hide' : 'Show'} Coaching Tips
            </button>
          </div>
          <p className="text-base text-gray-600 ml-9">{currentStepInfo?.description}</p>
        </div>

        {/* Coaching Help Section */}
        {showStepHelp && STEP_COACHING[currentStep] && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-semibold text-amber-900">Strategic Coaching for This Step</h3>
            </div>

            {/* Questions */}
            <div className="mb-4">
              <p className="text-base font-medium text-amber-900 mb-3">💡 Key Questions to Consider:</p>
              <ul className="space-y-2">
                {STEP_COACHING[currentStep].questions.map((question, idx) => (
                  <li key={idx} className="flex items-start text-base text-amber-800">
                    <span className="text-amber-600 mr-2 mt-1">•</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="border-t border-amber-300 pt-4">
              <p className="text-base font-medium text-amber-900 mb-3">✓ Best Practices:</p>
              <ul className="space-y-2">
                {STEP_COACHING[currentStep].tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start text-base text-amber-800">
                    <span className="text-amber-600 mr-2 mt-1">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {currentStep === 1 && (
            <div className="p-6">
              <Step1GoalsAndKPIs
                financialData={financialData}
                updateFinancialValue={updateFinancialValue}
                coreMetrics={coreMetrics}
                updateCoreMetric={updateCoreMetric}
                kpis={kpis}
                updateKPIValue={updateKPIValue}
                addKPI={addKPI}
                deleteKPI={deleteKPI}
                yearType={yearType}
                setYearType={setYearType}
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                industry={industry}
                showKPIModal={showKPIModal}
                setShowKPIModal={setShowKPIModal}
                businessId={businessId}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-6">
              <Step2StrategicIdeas
                strategicIdeas={strategicIdeas}
                setStrategicIdeas={setStrategicIdeas}
                currentRevenue={financialData?.revenue?.current || 0}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-6">
              <Step4RefineInitiatives
                strategicIdeas={strategicIdeas}
                twelveMonthInitiatives={twelveMonthInitiatives}
                setTwelveMonthInitiatives={setTwelveMonthInitiatives}
                currentRevenue={financialData?.revenue?.current || 0}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="p-6">
              <Step5AnnualPlan
                twelveMonthInitiatives={twelveMonthInitiatives}
                annualPlanByQuarter={annualPlanByQuarter}
                setAnnualPlanByQuarter={setAnnualPlanByQuarter}
                quarterlyTargets={quarterlyTargets}
                setQuarterlyTargets={setQuarterlyTargets}
                financialData={financialData}
                coreMetrics={coreMetrics}
                kpis={kpis}
                yearType={yearType}
                businessId={businessId}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="p-6">
              <Step690DaySprintV3
                annualPlanByQuarter={annualPlanByQuarter}
                setAnnualPlanByQuarter={setAnnualPlanByQuarter}
                quarterlyTargets={quarterlyTargets}
                financialData={financialData}
                coreMetrics={coreMetrics}
                kpis={kpis}
                yearType={yearType}
                businessId={businessId}
                operationalActivities={operationalActivities}
                setOperationalActivities={setOperationalActivities}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as StepNumber)}
            disabled={!canGoPrevious}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              canGoPrevious
                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1) as StepNumber)}
            disabled={!canGoNext}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              canGoNext
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Completion Message */}
        {currentStep === 5 && step5Complete && (
          <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🎉 Your Strategic Plan is Ready!
                </h3>
                <p className="text-base text-green-800">
                  You've completed all 5 steps and have a clear roadmap for the next 90 days and beyond. Time to execute!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-12 py-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your coaching team or check our guidance resources
          </p>
        </div>
      </div>
    </div>
  )
}