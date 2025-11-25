import React from 'react'
import { X, CheckCircle } from 'lucide-react'
import { RoadmapBuild } from '../data/types'

interface BuildModalProps {
  build: RoadmapBuild | null
  isOpen: boolean
  onClose: () => void
  stageName: string
  engineName: string
  isComplete: boolean
  onToggleComplete: () => void
}

export function BuildModal({
  build,
  isOpen,
  onClose,
  stageName,
  engineName,
  isComplete,
  onToggleComplete
}: BuildModalProps) {
  if (!isOpen || !build) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
            <div className="flex-1 pr-8">
              <h2 className="text-2xl font-bold text-gray-900">{build.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{stageName}</span>
                <span>•</span>
                <span>{engineName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Outcome */}
            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-lg p-4">
              <div className="text-sm font-semibold text-teal-900 mb-2">Outcome</div>
              <div className="text-teal-800">{build.outcome}</div>
            </div>

            {/* To-Do List */}
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-3">To Do:</div>
              <ul className="space-y-3">
                {build.toDo.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isComplete
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              {isComplete ? 'Completed' : 'Mark as Complete'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
