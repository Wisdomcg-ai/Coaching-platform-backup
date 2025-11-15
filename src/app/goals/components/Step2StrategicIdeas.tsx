'use client'

import { StrategicInitiative, InitiativeCategory } from '../types'
import { Plus, X, ChevronDown, ChevronUp, CheckCircle, Square, CheckSquare } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRoadmapProgress } from '@/app/business-roadmap/hooks/useRoadmapProgress'
import { STAGES } from '@/app/business-roadmap/data'

interface Step2Props {
  strategicIdeas: StrategicInitiative[]
  setStrategicIdeas: (ideas: StrategicInitiative[]) => void
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

const generateId = () => `idea-${Date.now()}-${Math.random()}`

// Map roadmap engines to our category system - using company color palette
const ENGINES = [
  {
    id: 'marketing' as InitiativeCategory,
    name: 'Attract',
    subtitle: 'Marketing & Lead Generation',
    emoji: '📢',
    color: 'border-[#4C5D75] bg-[#4C5D75]/5'
  },
  {
    id: 'operations' as InitiativeCategory,
    name: 'Convert',
    subtitle: 'Sales & Closing',
    emoji: '🛒',
    color: 'border-[#8E9AAF] bg-[#8E9AAF]/5'
  },
  {
    id: 'customer_experience' as InitiativeCategory,
    name: 'Deliver',
    subtitle: 'Client Experience & Results',
    emoji: '❤️',
    color: 'border-[#948687] bg-[#948687]/5'
  },
  {
    id: 'people' as InitiativeCategory,
    name: 'People',
    subtitle: 'Team, Culture, Hiring',
    emoji: '👥',
    color: 'border-[#3E3F57] bg-[#3E3F57]/5'
  },
  {
    id: 'systems' as InitiativeCategory,
    name: 'Systems',
    subtitle: 'Operations, Process, Tech',
    emoji: '💻',
    color: 'border-[#4C5D75] bg-[#4C5D75]/5'
  },
  {
    id: 'finance' as InitiativeCategory,
    name: 'Finance',
    subtitle: 'Money, Metrics, Wealth',
    emoji: '💰',
    color: 'border-[#8E9AAF] bg-[#8E9AAF]/5'
  },
  {
    id: 'product' as InitiativeCategory,
    name: 'Leadership',
    subtitle: 'Vision, Strategy, You',
    emoji: '👑',
    color: 'border-[#948687] bg-[#948687]/5'
  },
  {
    id: 'other' as InitiativeCategory,
    name: 'Time',
    subtitle: 'Freedom, Productivity, Leverage',
    emoji: '⏱️',
    color: 'border-[#3E3F57] bg-[#3E3F57]/5'
  },
  {
    id: 'misc' as InitiativeCategory,
    name: 'Other',
    subtitle: 'Miscellaneous & Uncategorized',
    emoji: '📋',
    color: 'border-gray-400 bg-gray-50'
  }
]

export default function Step2StrategicIdeas({
  strategicIdeas = [],
  setStrategicIdeas,
  currentRevenue = 0
}: Step2Props) {
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newEngine, setNewEngine] = useState<InitiativeCategory>('marketing')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [validationError, setValidationError] = useState('')

  // Roadmap progress tracking
  const { completedBuilds, toggleBuild, isComplete } = useRoadmapProgress()

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

  // Generate roadmap suggestions dynamically from STAGES data
  const roadmapSuggestions = useMemo(() => {
    const suggestions: StrategicInitiative[] = []

    // Get current stage and all lower stages
    const stagesToInclude = STAGES.slice(0, currentStageIndex + 1)

    stagesToInclude.forEach((stage, stageIdx) => {
      stage.builds.forEach(build => {
        // Skip if completed (except current stage - show all current stage items)
        const completed = isComplete(build.name)
        if (completed && stageIdx < currentStageIndex) {
          return // Skip completed items from lower stages
        }

        // Skip if already in user's ideas
        const alreadyAdded = strategicIdeas.some(idea => idea.title === build.name)
        if (alreadyAdded) return

        // Convert to StrategicInitiative format
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

  // Group ideas and roadmap suggestions by engine
  const idesByEngine = useMemo(() => {
    const grouped: Record<InitiativeCategory, {
      userIdeas: StrategicInitiative[]
      roadmapSuggestions: StrategicInitiative[]
    }> = {
      marketing: { userIdeas: [], roadmapSuggestions: [] },
      operations: { userIdeas: [], roadmapSuggestions: [] },
      finance: { userIdeas: [], roadmapSuggestions: [] },
      people: { userIdeas: [], roadmapSuggestions: [] },
      systems: { userIdeas: [], roadmapSuggestions: [] },
      product: { userIdeas: [], roadmapSuggestions: [] },
      customer_experience: { userIdeas: [], roadmapSuggestions: [] },
      other: { userIdeas: [], roadmapSuggestions: [] },
      misc: { userIdeas: [], roadmapSuggestions: [] }
    }

    // Group user ideas
    strategicIdeas.forEach(idea => {
      const category = idea.category || 'misc'
      grouped[category].userIdeas.push(idea)
    })

    // Filter roadmap suggestions: current stage + uncompleted from lower stages
    const filteredRoadmap = roadmapSuggestions.filter(suggestion => {
      // Already added to user ideas?
      const isAlreadyAdded = strategicIdeas.some(idea => idea.id === suggestion.id)
      if (isAlreadyAdded) return false

      // Is it completed?
      const completed = isComplete(suggestion.title)

      // Include if: (current stage OR lower stage AND not completed)
      // We'd need stage info on the suggestion - for now include all uncompleted
      return !completed
    })

    // Group filtered roadmap suggestions
    filteredRoadmap.forEach(suggestion => {
      const category = suggestion.category || 'misc'
      grouped[category].roadmapSuggestions.push(suggestion)
    })

    return grouped
  }, [strategicIdeas, roadmapSuggestions, completedBuilds, isComplete])

  const handleAddIdea = () => {
    if (!newTitle.trim()) {
      setValidationError('Please enter a title for your idea')
      return
    }

    if (newTitle.length > 200) {
      setValidationError('Title must be 200 characters or less')
      return
    }

    const isDuplicate = strategicIdeas.some(
      idea => idea.title.toLowerCase().trim() === newTitle.toLowerCase().trim()
    )

    if (isDuplicate) {
      setValidationError('This idea already exists')
      return
    }

    const newIdea: StrategicInitiative = {
      id: generateId(),
      title: newTitle.trim(),
      description: newNotes.trim() || undefined,
      category: newEngine,
      source: 'strategic_ideas',
      order: strategicIdeas.length
    }

    setStrategicIdeas([...strategicIdeas, newIdea])
    setNewTitle('')
    setNewNotes('')
    setValidationError('')
  }

  const handleRemoveIdea = (ideaId: string) => {
    setStrategicIdeas(strategicIdeas.filter(idea => idea.id !== ideaId))
  }

  const toggleCardExpanded = (cardId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId)
    } else {
      newExpanded.add(cardId)
    }
    setExpandedCards(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Add New Idea Form */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Strategic Idea</h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value)
                setValidationError('')
              }}
              placeholder="What strategic initiative do you want to implement?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{newTitle.length}/200 characters</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Add context, rationale, or details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Engine Selection + Add Button */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Engine <span className="text-red-500">*</span>
              </label>
              <select
                value={newEngine}
                onChange={(e) => setNewEngine(e.target.value as InitiativeCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {ENGINES.map(engine => (
                  <option key={engine.id} value={engine.id}>
                    {engine.emoji} {engine.name} - {engine.subtitle}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddIdea}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Idea
            </button>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Total Ideas: <span className="text-lg text-blue-600">{strategicIdeas.length}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Organize your strategic initiatives by business engine
            </p>
          </div>
        </div>
      </div>

      {/* 9-Grid Layout by Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENGINES.map(engine => {
          const { userIdeas, roadmapSuggestions: suggestions } = idesByEngine[engine.id]
          const totalCount = userIdeas.length + suggestions.length

          return (
            <div
              key={engine.id}
              className={`border-2 rounded-lg overflow-hidden min-h-[500px] flex flex-col ${engine.color}`}
            >
              {/* Engine Header */}
              <div className="p-4 bg-white border-b-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{engine.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{engine.name}</h4>
                    <p className="text-xs text-gray-600">{engine.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {userIdeas.length} ideas • {suggestions.length} suggestions
                    </p>
                  </div>
                </div>
              </div>

              {/* Ideas and Suggestions List */}
              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto bg-white">
                {totalCount === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-400">No ideas yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add ideas above or select from roadmap</p>
                  </div>
                ) : (
                  <>
                    {/* User Ideas - Warm Dusk background + Cool Navy badge */}
                    {userIdeas.map(idea => (
                      <div
                        key={idea.id}
                        className="p-4 bg-[#948687]/30 border-2 border-[#948687]/80 rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-gray-900 leading-snug">{idea.title}</p>
                            {idea.description && (
                              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{idea.description}</p>
                            )}
                            <span className="inline-block mt-3 px-2.5 py-1 bg-[#3E3F57] text-white text-xs rounded-md font-semibold shadow-sm">
                              YOUR IDEA
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveIdea(idea.id)}
                            className="text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Remove idea"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Roadmap Suggestions - Bold Steel Blue background + White text */}
                    {suggestions.map(suggestion => {
                      const isExpanded = expandedCards.has(suggestion.id)
                      const completed = isComplete(suggestion.title)

                      return (
                        <div
                          key={suggestion.id}
                          className="border-2 border-[#4C5D75] rounded-lg overflow-hidden bg-[#4C5D75] shadow-lg"
                        >
                          {/* Suggestion Header */}
                          <div className="p-4">
                            <div className="flex items-start gap-2">
                              {/* Completion Checkbox */}
                              <button
                                onClick={() => toggleBuild(suggestion.title)}
                                className="mt-0.5 flex-shrink-0"
                                title={completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {completed ? (
                                  <CheckSquare className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Square className="w-5 h-5 text-white/60 hover:text-white" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-white leading-snug">{suggestion.title}</p>
                                {suggestion.description && (
                                  <p className="text-sm text-white/90 mt-2 line-clamp-2 leading-relaxed">{suggestion.description}</p>
                                )}
                                <span className="inline-block mt-3 px-2.5 py-1 bg-[#948687] text-white text-xs rounded-md font-semibold shadow-sm">
                                  ROADMAP
                                </span>
                              </div>
                            </div>

                            {/* Expand Button Only */}
                            {suggestion.notes && (
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  onClick={() => toggleCardExpanded(suggestion.id)}
                                  className="text-xs text-white/80 hover:text-white font-semibold flex items-center gap-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" /> Hide Details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" /> Show Details
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && suggestion.notes && (
                            <div className="px-3 pb-3 pt-0 border-t border-gray-200 bg-gray-50">
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Implementation Steps:</p>
                                <div className="text-xs text-gray-600 whitespace-pre-wrap">
                                  {suggestion.notes}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
