// /app/goals/components/Step3Roadmap.tsx
'use client'

import { StrategicInitiative, InitiativeCategory } from '../types'
import { useState } from 'react'
import { WISDOM_ROADMAP_DATA, WisdomBuild } from '@/app/business-roadmap/wisdom-roadmap-data'
import { ChevronDown, ChevronUp, Plus, CheckCircle, Lightbulb, Sparkles, Eye, X } from 'lucide-react'

interface Step3Props {
  strategicIdeas: StrategicInitiative[]
  roadmapSuggestions: StrategicInitiative[]
  setRoadmapSuggestions: (suggestions: StrategicInitiative[]) => void
  currentRevenue?: number
}

// Stage definitions
type Stage = 'foundation' | 'traction'

interface StageInfo {
  key: Stage
  label: string
  range: string
  color: string
}

const STAGES: StageInfo[] = [
  { key: 'foundation', label: 'Foundation', range: '$0-250K', color: 'blue' },
  { key: 'traction', label: 'Traction', range: '$250K-1M', color: 'green' }
]

// Map revenue to stage
function getBusinessStage(revenue: number): Stage {
  if (revenue < 250000) return 'foundation'
  return 'traction'
}

function getNextStage(currentStage: Stage): Stage | null {
  if (currentStage === 'foundation') return 'traction'
  return null // No next stage after traction in current data
}

// Map engine to category
const ENGINE_TO_CATEGORY: Record<string, InitiativeCategory> = {
  'attract': 'marketing',
  'convert': 'marketing',
  'deliver': 'operations',
  'team': 'people',
  'money': 'finance',
  'process': 'systems',
  'strategy': 'other',
  'leader': 'people'
}

export default function Step3Roadmap({
  strategicIdeas,
  roadmapSuggestions,
  setRoadmapSuggestions,
  currentRevenue = 0
}: Step3Props) {
  const [expandedEngine, setExpandedEngine] = useState<string | null>(null)
  const [expandedBuild, setExpandedBuild] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const currentStage = getBusinessStage(currentRevenue)
  const nextStage = getNextStage(currentStage)
  const currentStageInfo = STAGES.find(s => s.key === currentStage)!
  const nextStageInfo = nextStage ? STAGES.find(s => s.key === nextStage) : null

  const isAlreadyAdded = (title: string) => {
    return roadmapSuggestions.some(s => s.title === title) ||
           strategicIdeas.some(b => b.title === title)
  }

  const handleAddBuild = (build: WisdomBuild, engineId: string) => {
    console.log('[Step3] Adding build:', build.name)
    console.log('[Step3] Already added?', isAlreadyAdded(build.name))
    console.log('[Step3] Current suggestions:', roadmapSuggestions.length)

    if (!isAlreadyAdded(build.name)) {
      const newSuggestion: StrategicInitiative = {
        id: `roadmap-${Date.now()}-${Math.random()}`,
        title: build.name,
        description: build.description,
        notes: build.whatYoullHave,
        source: 'roadmap',
        category: ENGINE_TO_CATEGORY[engineId] || 'other',
        estimatedEffort: build.timeInvestment.includes('week') ? 'medium' : 'small',
        selected: false,
        order: roadmapSuggestions.length
      }

      console.log('[Step3] Creating suggestion:', newSuggestion)
      setRoadmapSuggestions([...roadmapSuggestions, newSuggestion])
      console.log('[Step3] ✅ Build added successfully')
    } else {
      console.log('[Step3] ⚠️ Build already added, skipping')
    }
  }

  const handleRemoveBuild = (id: string) => {
    console.log('[Step3] Removing build ID:', id)
    setRoadmapSuggestions(roadmapSuggestions.filter(s => s.id !== id))
    console.log('[Step3] ✅ Build removed successfully')
  }

  const addedCount = roadmapSuggestions.length

  // Component to render builds for a stage
  const RoadmapSection = ({ stage, isPreview = false }: { stage: Stage, isPreview?: boolean }) => {
    return (
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {WISDOM_ROADMAP_DATA.map((engine) => {
          const builds = engine.stages[stage] || []
          const displayBuilds = isPreview ? builds.slice(0, 1) : builds // Only show first build in preview
          const isExpanded = expandedEngine === `${stage}-${engine.id}`

          if (displayBuilds.length === 0) return null

          return (
            <div key={engine.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Engine Header */}
              <button
                onClick={() => setExpandedEngine(isExpanded ? null : `${stage}-${engine.id}`)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">{engine.name}</p>
                  <p className="text-xs text-gray-600">
                    {isPreview ? `Top priority (${displayBuilds.length})` : `${displayBuilds.length} builds`}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Builds List */}
              {isExpanded && (
                <div className="p-3 space-y-2 bg-white">
                  {displayBuilds.map((build, idx) => {
                    const buildId = `${stage}-${engine.id}-${idx}`
                    const isDetailExpanded = expandedBuild === buildId
                    const isAdded = isAlreadyAdded(build.name)

                    return (
                      <div
                        key={idx}
                        className={`border-2 rounded-lg transition-all ${
                          isAdded
                            ? 'bg-gray-50 border-gray-300'
                            : isPreview
                            ? 'bg-purple-50 border-purple-200 hover:border-purple-400'
                            : 'bg-green-50 border-green-200 hover:border-green-400'
                        }`}
                      >
                        {/* Build Header */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{build.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{build.description}</p>
                              <p className="text-xs text-purple-600 mt-1">⏱ {build.timeInvestment}</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setExpandedBuild(isDetailExpanded ? null : buildId)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View details"
                              >
                                {isDetailExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={() => handleAddBuild(build, engine.id)}
                                disabled={isAdded}
                                className={`p-1.5 rounded transition-colors ${
                                  isAdded
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : isPreview
                                    ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-100'
                                    : 'text-green-600 hover:text-green-700 hover:bg-green-100'
                                }`}
                                title={isAdded ? 'Already added' : 'Add to roadmap'}
                              >
                                {isAdded ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Build Details */}
                        {isDetailExpanded && (
                          <div className={`px-3 pb-3 pt-0 border-t space-y-2 ${
                            isPreview ? 'border-purple-200' : 'border-green-200'
                          }`}>
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">What You'll Have:</p>
                              <p className="text-xs text-gray-600">{build.whatYoullHave}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">How to Build:</p>
                              <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1">
                                {build.howToBuild.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Success Metric:</p>
                              <p className="text-xs text-gray-600">{build.successMetric}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Result:</p>
                              <p className="text-xs text-gray-600">{build.resultItProduces}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wisdom Roadmap: {currentStageInfo.label} Stage
            </h3>
            <p className="text-sm text-gray-600">
              Here are recommended builds for your stage. Compare with your ideas from Step 2 and add the most relevant ones to your 12-month plan.
            </p>
          </div>
          {addedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">{addedCount} added</span>
            </div>
          )}
        </div>

        {/* Revenue Context */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Current Revenue:</strong> ${currentRevenue.toLocaleString()} → <strong>{currentStageInfo.label} Stage ({currentStageInfo.range})</strong>
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Your Ideas + Added Roadmap Builds */}
        <div className="space-y-4">
          {/* Your Ideas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Your Strategic Ideas ({strategicIdeas.length})
            </h4>

            {strategicIdeas.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {strategicIdeas.map((idea) => (
                  <div key={idea.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{idea.title}</p>
                    {idea.category && (
                      <p className="text-xs text-blue-600 mt-1">
                        {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">No ideas yet</p>
                <p className="text-xs text-gray-400">Go back to Step 2 to add your ideas first</p>
              </div>
            )}
          </div>

          {/* Added Roadmap Builds */}
          {roadmapSuggestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-500 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Added from Roadmap ({roadmapSuggestions.length})
              </h4>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {roadmapSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {suggestion.category && (
                          <p className="text-xs text-green-600">
                            {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                          </p>
                        )}
                        {suggestion.estimatedEffort && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 border border-green-300 rounded">
                            {suggestion.estimatedEffort}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBuild(suggestion.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove from roadmap"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Wisdom Roadmap Builds */}
        <div className="space-y-4">
          {/* Current Stage Builds */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-green-500 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  Priority Builds for {currentStageInfo.label}
                </h4>
                <p className="text-xs text-gray-600">Your current stage - focus here</p>
              </div>
            </div>

            <RoadmapSection stage={currentStage} isPreview={false} />
          </div>

          {/* Next Stage Preview */}
          {nextStageInfo && (
            <div className="bg-white rounded-lg shadow-sm border-2 border-purple-300 p-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">
                      Preview: {nextStageInfo.label} Stage
                    </h4>
                    <p className="text-xs text-gray-600">Start thinking about these...</p>
                  </div>
                </div>
                {showPreview ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {showPreview && nextStage && (
                <>
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-900">
                      <strong>Coming Soon:</strong> When you reach {nextStageInfo.range}, these builds become your priority. Preview the top priority from each engine.
                    </p>
                  </div>
                  <RoadmapSection stage={nextStage} isPreview={true} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Next Step:</strong> In Step 4, you'll combine your ideas and selected builds to create your final 12-month plan (5-10 initiatives). Mix current stage builds (70%) with next stage prep (30%) for balanced growth.
        </p>
      </div>
    </div>
  )
}
