'use client'

import React, { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { STAGES, ENGINES } from './data'
import {
  Megaphone,
  ShoppingCart,
  Heart,
  Users,
  Settings,
  Calculator,
  Crown,
  Target
} from 'lucide-react'

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  Megaphone,
  ShoppingCart,
  Heart,
  Users,
  Settings,
  Calculator,
  Crown,
  Target
}

export default function Roadmap2025() {
  const [selectedStage, setSelectedStage] = useState('foundation')
  const [expandedBuilds, setExpandedBuilds] = useState<Set<string>>(new Set())

  const currentStage = STAGES.find(s => s.id === selectedStage)

  const toggleBuild = (buildName: string) => {
    const newExpanded = new Set(expandedBuilds)
    if (newExpanded.has(buildName)) {
      newExpanded.delete(buildName)
    } else {
      newExpanded.add(buildName)
    }
    setExpandedBuilds(newExpanded)
  }

  // Group builds by engine
  const buildsByEngine = ENGINES.map(engine => ({
    engine,
    builds: currentStage?.builds.filter(b => b.engine === engine.id) || []
  })).filter(group => group.builds.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">The Wisdom Roadmap</h1>
          <p className="mt-2 text-gray-600">Your stage-by-stage guide to building a business that creates freedom</p>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-5 gap-4">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${selectedStage === stage.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="text-sm font-semibold text-gray-900">{stage.name}</div>
                <div className="text-xs text-gray-600 mt-1">{stage.range}</div>
                {selectedStage === stage.id && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 bg-blue-500 rotate-45 border-b-2 border-r-2 border-blue-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Overview */}
      {currentStage && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{currentStage.name} Stage</h2>
                <p className="mt-2 text-blue-100 text-lg">{currentStage.range}</p>
                <p className="mt-3 text-white max-w-3xl">{currentStage.description}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Stage Focus</div>
                <div className="mt-1 font-semibold">{currentStage.focus}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Builds by Engine */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {buildsByEngine.map(({ engine, builds }) => {
            const IconComponent = ICON_MAP[engine.icon]

            return (
              <div key={engine.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Engine Header */}
                <div className={`${engine.bgColor} text-white px-6 py-4 rounded-t-lg`}>
                  <div className="flex items-center">
                    {IconComponent && <IconComponent className="h-6 w-6 mr-3" />}
                    <div>
                      <h3 className="text-lg font-semibold">{engine.name}</h3>
                      <p className="text-sm opacity-90">{engine.subtitle}</p>
                    </div>
                    <div className="ml-auto bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                      {builds.length} {builds.length === 1 ? 'Build' : 'Builds'}
                    </div>
                  </div>
                </div>

                {/* Builds */}
                <div className="divide-y divide-gray-200">
                  {builds.map((build, idx) => {
                    const isExpanded = expandedBuilds.has(build.name)

                    return (
                      <div key={idx} className="p-6">
                        <button
                          onClick={() => toggleBuild(build.name)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                {build.name}
                                {isExpanded && <CheckCircle className="h-5 w-5 text-green-500 ml-2" />}
                              </h4>
                              <div className="mt-2 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                                <div className="text-sm font-medium text-blue-900">Outcome</div>
                                <div className="mt-1 text-blue-800">{build.outcome}</div>
                              </div>
                            </div>
                            <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </button>

                        {/* Expanded To-Do List */}
                        {isExpanded && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <div className="text-sm font-semibold text-gray-900 mb-3">To Do:</div>
                            <ul className="space-y-2">
                              {build.toDo.map((item, todoIdx) => (
                                <li key={todoIdx} className="flex items-start text-gray-700">
                                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">{currentStage?.builds.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Builds</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{buildsByEngine.length}</div>
              <div className="text-sm text-gray-600 mt-1">Engines Activated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{expandedBuilds.size}</div>
              <div className="text-sm text-gray-600 mt-1">Builds Explored</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
