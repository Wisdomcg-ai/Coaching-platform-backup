'use client'

import { useState, useEffect } from 'react'
import { useStrategicPlanning } from './hooks/useStrategicPlanning'
import Step1GoalsAndKPIs from './components/Step1GoalsAndKPIs'
import Step2StrategicIdeas from './components/Step2StrategicIdeas'
import Step4RefineInitiatives from './components/Step4RefineInitiatives'
import Step5AnnualPlan from './components/Step5AnnualPlan'
import Step690DaySprintV3 from './components/Step690DaySprintV3'
import { FinancialData, KPIData, StrategicInitiative, YearType } from './types'
import { Target, ListChecks, Calendar, Zap, Brain, Rocket, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'

type StepNumber = 1 | 2 | 3 | 4 | 5

interface StepInfo {
  num: StepNumber
  label: string
  title: string
  icon: React.ElementType
  description: string
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

export default function StrategicPlanningPage() {
  // Hydration fix: ensure state matches between server and client
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)
  const [isSaving, setIsSaving] = useState(false)

  // Only render interactive content after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

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
    saveAllData
  } = useStrategicPlanning()

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showKPIModal, setShowKPIModal] = useState(false)

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
        sprintKeyActions
      )) {
        setIsSaving(true)
        await saveAllData()
        setIsSaving(false)
      }
    }, 1000)

    return () => clearTimeout(saveTimer)
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
    saveAllData
  ])

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section)
    } else {
      newCollapsed.add(section)
    }
    setCollapsedSections(newCollapsed)
  }

  // HYDRATION FIX: Show skeleton before mounting
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Strategic Planning Wizard</h1>
                <p className="text-gray-600 mt-1">Build your 3-year roadmap, step by step</p>
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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Strategic Planning Wizard</h1>
              <p className="text-gray-600 mt-1">Build your 3-year roadmap, step by step</p>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {currentStepInfo && (
              <>
                <currentStepInfo.icon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Step {currentStep}: {currentStepInfo.title}
                </h2>
              </>
            )}
          </div>
          <p className="text-gray-600 ml-9">{currentStepInfo?.description}</p>
        </div>

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
                <p className="text-green-800 mb-4">
                  You've completed all 5 steps and have a clear roadmap for the next 90 days and beyond. Time to execute!
                </p>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                    📥 Export as PDF
                  </button>
                  <button className="px-4 py-2 bg-white text-green-600 border border-green-300 rounded-lg hover:bg-green-50 font-medium">
                    👥 Share with Team
                  </button>
                </div>
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