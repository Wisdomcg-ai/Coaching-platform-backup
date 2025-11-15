'use client'

import React, { useState } from 'react'
import { ArrowLeft, Loader2, Megaphone, ShoppingCart, Heart, Users, Settings, Calculator, Crown, Target } from 'lucide-react'
import Link from 'next/link'
import { STAGES, ENGINES, getBuildsByEngine } from './data'
import { BuildModal } from './components/BuildModal'
import { BuildItem } from './components/BuildItem'
import { useRoadmapProgress } from './hooks/useRoadmapProgress'
import type { RoadmapBuild } from './data/types'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone,
  ShoppingCart,
  Heart,
  Users,
  Settings,
  Calculator,
  Crown,
  Target
}

export default function WisdomRoadmapTable() {
  const { completedBuilds, isLoading, isSaving, toggleBuild, isComplete, getStats } = useRoadmapProgress()
  const [selectedBuild, setSelectedBuild] = useState<{
    build: RoadmapBuild
    stageName: string
    engineName: string
  } | null>(null)

  const totalBuilds = STAGES.reduce((sum, stage) => sum + stage.builds.length, 0)
  const { completed: completedCount, percentage: completionPercentage } = getStats(totalBuilds)

  const handleBuildClick = (build: RoadmapBuild, stageName: string, engineName: string) => {
    setSelectedBuild({ build, stageName, engineName })
  }

  const handleToggleSelectedBuild = () => {
    if (selectedBuild) {
      toggleBuild(selectedBuild.build.name)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <div className="text-gray-600">Loading your roadmap...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">The Wisdom Roadmap</h1>
              <p className="text-sm text-gray-600 mt-1">Your stage-by-stage guide to business freedom</p>
            </div>

            {/* Progress Tracker */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg px-6 py-3">
              <div className="text-sm opacity-90 flex items-center justify-between">
                <span>Your Score</span>
                {isSaving && (
                  <span className="flex items-center gap-1 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold">
                {completedCount}/{totalBuilds}
              </div>
              <div className="text-xs opacity-75 mt-1">{completionPercentage}% Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                completionPercentage < 25 ? 'bg-red-500' :
                completionPercentage < 50 ? 'bg-yellow-500' :
                completionPercentage < 75 ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full border-collapse relative">
              {/* Header Row - Engine Names */}
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="sticky left-0 z-20 bg-gray-100 text-left p-3 font-bold text-gray-700 min-w-[140px] border-r-2 border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    STAGE
                  </th>
                  {ENGINES.map((engine) => {
                    const IconComponent = iconMap[engine.icon]
                    return (
                      <th
                        key={engine.id}
                        className="bg-gray-50 p-3 min-w-[180px] border-r border-gray-200"
                      >
                        <div className="text-center">
                          {IconComponent && (
                            <IconComponent className={`h-8 w-8 mx-auto mb-2 ${engine.color}`} />
                          )}
                          <div className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                            {engine.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 normal-case">
                            {engine.subtitle}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Body - Stages (Mastery at top) */}
              <tbody>
                {[...STAGES].reverse().map((stage, stageIndex) => (
                  <tr
                    key={stage.id}
                    className="border-b border-gray-200"
                  >
                    {/* Stage Name Column */}
                    <td className={`sticky left-0 z-10 p-3 border-r-2 border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${
                      stageIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{stage.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{stage.range}</div>
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          {stage.builds.filter(b => isComplete(b.name)).length}/{stage.builds.length} Complete
                        </div>
                      </div>
                    </td>

                    {/* Engine Cells */}
                    {ENGINES.map((engine) => {
                      const builds = getBuildsByEngine(stage.id, engine.id)

                      return (
                        <td
                          key={engine.id}
                          className={`p-2 border-r border-gray-200 align-top ${
                            stageIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          {builds.length > 0 ? (
                            <div className="space-y-1">
                              {builds.map((build) => (
                                <BuildItem
                                  key={build.name}
                                  build={build}
                                  isComplete={isComplete(build.name)}
                                  onClick={() => handleBuildClick(build, stage.name, engine.name)}
                                  onToggleComplete={(e) => {
                                    e.stopPropagation()
                                    toggleBuild(build.name)
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-xs py-4">—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Success Criteria - Below Table */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((stage) => {
            const stageCompletedCount = stage.builds.filter(b => isComplete(b.name)).length
            const stagePercentage = Math.round((stageCompletedCount / stage.builds.length) * 100)

            return (
              <div key={stage.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="font-bold text-gray-900 mb-2">{stage.name}</div>
                <div className="text-xs text-gray-600 mb-3">{stage.range}</div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{stagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${stagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Success Criteria */}
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Success Criteria:</div>
                  <ul className="space-y-1">
                    {stage.successCriteria.map((criteria, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Build Detail Modal */}
      <BuildModal
        build={selectedBuild?.build || null}
        isOpen={!!selectedBuild}
        onClose={() => setSelectedBuild(null)}
        stageName={selectedBuild?.stageName || ''}
        engineName={selectedBuild?.engineName || ''}
        isComplete={selectedBuild ? isComplete(selectedBuild.build.name) : false}
        onToggleComplete={handleToggleSelectedBuild}
      />
    </div>
  )
}
