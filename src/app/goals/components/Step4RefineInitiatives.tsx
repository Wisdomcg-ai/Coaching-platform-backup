'use client'

import { StrategicInitiative, InitiativeCategory } from '../types'
import { AlertCircle, Check, GripVertical, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRoadmapProgress } from '@/app/business-roadmap/hooks/useRoadmapProgress'
import { STAGES } from '@/app/business-roadmap/data'

interface Step4Props {
  strategicIdeas: StrategicInitiative[]
  twelveMonthInitiatives: StrategicInitiative[]
  setTwelveMonthInitiatives: (initiatives: StrategicInitiative[]) => void
  currentRevenue?: number
}

// Map roadmap engines to our category system
const ENGINE_TO_CATEGORY: Record<string, InitiativeCategory> = {
  'attract': 'marketing',
  'convert': 'operations',
  'deliver': 'customer_experience',
  'people': 'people',
  'systems': 'systems',
  'finance': 'finance',
  'leadership': 'product',
  'time': 'other'
}

const CATEGORY_INFO: Record<InitiativeCategory, { label: string; emoji: string; color: string; bgColor: string }> = {
  'marketing': { label: 'Attract - Marketing & Lead Generation', emoji: '📢', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  'operations': { label: 'Convert - Sales & Closing', emoji: '🛒', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  'customer_experience': { label: 'Deliver - Client Experience & Results', emoji: '❤️', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  'people': { label: 'People - Team, Culture, Hiring', emoji: '👥', color: 'text-pink-700', bgColor: 'bg-pink-50 border-pink-200' },
  'systems': { label: 'Systems - Operations, Process, Tech', emoji: '💻', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
  'finance': { label: 'Finance - Money, Metrics, Wealth', emoji: '💰', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  'product': { label: 'Leadership - Vision, Strategy, You', emoji: '👑', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
  'other': { label: 'Time - Freedom, Productivity, Leverage', emoji: '⏱️', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200' },
  'misc': { label: 'Other - Miscellaneous & Uncategorized', emoji: '📋', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200' }
}

const CATEGORIES: InitiativeCategory[] = [
  'marketing',
  'operations',
  'finance',
  'people',
  'systems',
  'product',
  'customer_experience',
  'other',
  'misc'
]

export default function Step4RefineInitiatives({
  strategicIdeas,
  twelveMonthInitiatives,
  setTwelveMonthInitiatives,
  currentRevenue = 0
}: Step4Props) {
  const [draggedInitiative, setDraggedInitiative] = useState<StrategicInitiative | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showBalance, setShowBalance] = useState(false)

  // Roadmap progress tracking
  const { completedBuilds, isComplete } = useRoadmapProgress()

  // Determine current stage based on revenue
  const getCurrentStage = () => {
    if (currentRevenue < 500000) return 'foundation'
    if (currentRevenue < 1000000) return 'traction'
    if (currentRevenue < 5000000) return 'growth'
    if (currentRevenue < 10000000) return 'scale'
    return 'mastery'
  }

  const currentStageId = getCurrentStage()
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStageId)

  // Generate roadmap suggestions dynamically from STAGES data (same as Step 2)
  const roadmapSuggestions = useMemo(() => {
    const suggestions: StrategicInitiative[] = []
    const stagesToInclude = STAGES.slice(0, currentStageIndex + 1)

    stagesToInclude.forEach((stage, stageIdx) => {
      stage.builds.forEach(build => {
        const completed = isComplete(build.name)
        if (completed && stageIdx < currentStageIndex) return

        // Skip if already in strategic ideas (user manually added it)
        const alreadyInIdeas = strategicIdeas.some(idea => idea.title === build.name)
        if (alreadyInIdeas) return

        const category = ENGINE_TO_CATEGORY[build.engine] || 'misc'
        suggestions.push({
          id: `roadmap-${build.name.replace(/\s+/g, '-').toLowerCase()}`,
          title: build.name,
          description: build.outcome,
          notes: build.toDo.join('\n'),
          source: 'roadmap',
          category,
          order: suggestions.length
        })
      })
    })

    return suggestions
  }, [currentRevenue, currentStageIndex, completedBuilds, strategicIdeas, isComplete])

  // All available initiatives from Step 2 (user ideas + roadmap suggestions)
  const allAvailableInitiatives = useMemo(() => {
    return [...strategicIdeas, ...roadmapSuggestions]
  }, [strategicIdeas, roadmapSuggestions])

  const selectedCount = twelveMonthInitiatives.length
  const isOverLimit = selectedCount > 20
  const isInRange = selectedCount >= 12 && selectedCount <= 20

  // Available initiatives (exclude already selected)
  const availableInitiatives = useMemo(() => {
    return allAvailableInitiatives.filter(
      init => !twelveMonthInitiatives.some(selected => selected.id === init.id)
    )
  }, [allAvailableInitiatives, twelveMonthInitiatives])

  // Group available initiatives by category
  const initiativesByCategory = useMemo(() => {
    const grouped: Record<InitiativeCategory, StrategicInitiative[]> = {
      marketing: [],
      operations: [],
      finance: [],
      people: [],
      systems: [],
      product: [],
      customer_experience: [],
      other: [],
      misc: []
    }

    availableInitiatives.forEach(init => {
      const category = init.category || 'misc'
      grouped[category].push(init)
    })

    return grouped
  }, [availableInitiatives])

  // Calculate balance stats
  const balanceStats = useMemo(() => {
    const categoryCount: Partial<Record<InitiativeCategory, number>> = {}
    const sourceCount: { strategic_ideas: number; roadmap: number } = { strategic_ideas: 0, roadmap: 0 }

    twelveMonthInitiatives.forEach(init => {
      if (init.category) {
        categoryCount[init.category] = (categoryCount[init.category] || 0) + 1
      }
      if (init.source) {
        sourceCount[init.source] = (sourceCount[init.source] || 0) + 1
      }
    })

    const categoryDiversity = Object.keys(categoryCount).length

    return {
      categoryCount,
      sourceCount,
      categoryDiversity
    }
  }, [twelveMonthInitiatives])

  // Drag from category list to priority list
  const handleDragStartFromList = (initiative: StrategicInitiative) => {
    setDraggedInitiative(initiative)
  }

  const handleDragStartFromPriority = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Drop on priority list to add
  const handleDropOnPriority = () => {
    if (draggedInitiative && !twelveMonthInitiatives.some(i => i.id === draggedInitiative.id)) {
      setTwelveMonthInitiatives([
        ...twelveMonthInitiatives,
        { ...draggedInitiative, selected: true, order: twelveMonthInitiatives.length }
      ])
    }
    setDraggedInitiative(null)
  }

  // Reorder within priority list
  const handleDragOverInPriority = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === targetIndex) return

    const reordered = [...twelveMonthInitiatives]
    const draggedItem = reordered[draggedIndex]
    reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedItem)

    const updated = reordered.map((init, idx) => ({ ...init, order: idx }))
    setTwelveMonthInitiatives(updated)
    setDraggedIndex(targetIndex)
  }

  const handleDragEnd = () => {
    setDraggedInitiative(null)
    setDraggedIndex(null)
  }

  const handleRemoveInitiative = (initiativeId: string) => {
    const updated = twelveMonthInitiatives
      .filter(item => item.id !== initiativeId)
      .map((init, idx) => ({ ...init, order: idx }))
    setTwelveMonthInitiatives(updated)
  }

  const handleClearAll = () => {
    setTwelveMonthInitiatives([])
  }

  return (
    <div className="space-y-6">
      {/* Header with Selection Status */}
      <div className="bg-gradient-to-r from-[#4C5D75]/10 to-[#948687]/10 border-2 border-[#4C5D75]/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Selected: <span className={`text-lg ${selectedCount === 0 ? 'text-gray-500' : isInRange ? 'text-green-600' : isOverLimit ? 'text-red-600' : 'text-amber-600'}`}>{selectedCount}</span> <span className="text-gray-600">of 12-20 initiatives</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Aim for 12-20 strategic initiatives for Year 1
              </p>
            </div>
            {isInRange && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                <Check className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">Good selection!</span>
              </div>
            )}
            {isOverLimit && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
                <AlertCircle className="w-4 h-4 text-red-700" />
                <span className="text-sm font-medium text-red-700">Remove {selectedCount - 20}</span>
              </div>
            )}
            {selectedCount > 0 && selectedCount < 12 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-medium text-amber-700">Add {12 - selectedCount} more</span>
              </div>
            )}
          </div>

          {selectedCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Category List (Left) | Priority List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Single Column Category List */}
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
            <h3 className="text-sm font-bold text-gray-900">
              Available Initiatives ({availableInitiatives.length})
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">Drag initiatives to the priority list →</p>
          </div>

          {allAvailableInitiatives.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-600">
                No initiatives yet. Go back to Step 2 to add strategic ideas and roadmap suggestions.
              </p>
            </div>
          ) : (
            <div className="max-h-[700px] overflow-y-auto">
              {CATEGORIES.map(category => {
                const initiatives = initiativesByCategory[category]
                const info = CATEGORY_INFO[category]
                const count = initiatives.length

                return (
                  <div key={category} className="border-b border-gray-200 last:border-b-0">
                    {/* Category Header */}
                    <div className={`px-4 py-2.5 ${count > 0 ? info.bgColor : 'bg-gray-50/50'} border-b border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{info.emoji}</span>
                          <h4 className={`text-sm font-bold ${info.color}`}>{info.label}</h4>
                        </div>
                        {count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-[#3E3F57] text-white text-xs font-bold rounded-full">
                            {count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Initiatives List */}
                    <div className="px-3 py-2">
                      {count === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2 text-center">No initiatives in this category</p>
                      ) : (
                        <div className="space-y-2">
                          {initiatives.map(initiative => {
                            const isUserIdea = initiative.source === 'strategic_ideas'
                            const isDragging = draggedInitiative?.id === initiative.id

                            return (
                              <div
                                key={initiative.id}
                                draggable
                                onDragStart={() => handleDragStartFromList(initiative)}
                                onDragEnd={handleDragEnd}
                                className={`group flex items-start gap-2 p-3 rounded-lg border-2 cursor-move transition-all ${
                                  isDragging
                                    ? 'opacity-30'
                                    : isUserIdea
                                    ? 'bg-[#948687]/30 border-[#948687]/80 hover:bg-[#948687]/40 hover:shadow-md'
                                    : 'bg-[#4C5D75] border-[#4C5D75] shadow-md'
                                }`}
                              >
                                <GripVertical className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                  isUserIdea ? 'text-gray-500' : 'text-white/60'
                                } group-hover:${isUserIdea ? 'text-gray-700' : 'text-white'}`} />

                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold leading-tight ${
                                    isUserIdea ? 'text-gray-900' : 'text-white'
                                  }`}>
                                    {initiative.title}
                                  </p>
                                  {initiative.description && (
                                    <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${
                                      isUserIdea ? 'text-gray-700' : 'text-white/90'
                                    }`}>
                                      {initiative.description}
                                    </p>
                                  )}
                                  <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] rounded font-semibold ${
                                    isUserIdea
                                      ? 'bg-[#3E3F57] text-white'
                                      : 'bg-[#948687] text-white'
                                  }`}>
                                    {isUserIdea ? 'YOUR IDEA' : 'ROADMAP'}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Priority List */}
        <div className="space-y-4">
          <div
            className="bg-white border-2 border-[#4C5D75]/40 rounded-lg overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDropOnPriority}
          >
            <div className="px-4 py-3 bg-[#4C5D75]/10 border-b-2 border-[#4C5D75]/30 sticky top-0 z-10">
              <h3 className="text-sm font-bold text-gray-900">
                Your Year 1 Priorities ({selectedCount}/20)
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">Drag to reorder by priority</p>
            </div>

            <div className="p-4">
              {selectedCount === 0 ? (
                <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-[#4C5D75]/30 rounded-lg bg-[#4C5D75]/5">
                  <div className="text-center text-gray-400">
                    <GripVertical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Drag initiatives here</p>
                    <p className="text-xs mt-1">from the category list on the left</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {twelveMonthInitiatives
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((initiative, index) => {
                      const categoryInfo = initiative.category ? CATEGORY_INFO[initiative.category] : CATEGORY_INFO.misc
                      const isUserIdea = initiative.source === 'strategic_ideas'

                      return (
                        <div
                          key={initiative.id}
                          draggable
                          onDragStart={() => handleDragStartFromPriority(index)}
                          onDragOver={(e) => handleDragOverInPriority(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-start gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-[#4C5D75]/5 hover:border-[#4C5D75]/40 transition-all cursor-move ${
                            draggedIndex === index ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Drag Handle */}
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />

                          {/* Priority Number */}
                          <div className="flex items-center justify-center w-7 h-7 bg-[#4C5D75] text-white rounded-full text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>

                          {/* Category Emoji */}
                          <span className="text-lg flex-shrink-0" title={categoryInfo.label}>
                            {categoryInfo.emoji}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{initiative.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-semibold ${
                                isUserIdea
                                  ? 'bg-[#3E3F57] text-white'
                                  : 'bg-[#4C5D75]/85 text-white'
                              }`}>
                                {isUserIdea ? 'YOUR IDEA' : 'ROADMAP'}
                              </span>
                              <span className={`text-xs ${categoryInfo.color} font-medium`}>
                                {categoryInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveInitiative(initiative.id)
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Remove from priority list"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Balance Stats - Collapsible */}
          {selectedCount > 0 && (
            <div className="bg-white border-2 border-[#4C5D75]/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="w-full px-4 py-3 bg-[#4C5D75]/10 border-b-2 border-[#4C5D75]/20 flex items-center justify-between hover:bg-[#4C5D75]/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-gray-900">Balance & Distribution</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{balanceStats.categoryDiversity}</span>
                      <span>categories</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{balanceStats.sourceCount.strategic_ideas}</span>
                      <span>your ideas</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{balanceStats.sourceCount.roadmap}</span>
                      <span>roadmap</span>
                    </div>
                  </div>
                </div>
                {showBalance ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
              </button>

              {showBalance && (
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Category Distribution */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2 uppercase">Category Distribution</p>
                      <div className="space-y-1.5">
                        {Object.entries(balanceStats.categoryCount).map(([category, count]) => {
                          const info = CATEGORY_INFO[category as InitiativeCategory]
                          return (
                            <div key={category} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{info.emoji}</span>
                                <span className="text-xs text-gray-700">{info.label}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Balance Assessment */}
                    <div className="pt-3 border-t border-gray-200">
                      {balanceStats.categoryDiversity >= 4 ? (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ Well balanced across {balanceStats.categoryDiversity} business areas
                        </p>
                      ) : balanceStats.categoryDiversity >= 2 ? (
                        <p className="text-sm text-amber-600 font-medium">
                          ⚠ Consider adding diversity across more categories (currently {balanceStats.categoryDiversity})
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 font-medium">
                          ⚠ Too concentrated - spread initiatives across multiple categories
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
