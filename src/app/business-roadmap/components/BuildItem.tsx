import React from 'react'
import { RoadmapBuild } from '../data/types'

interface BuildItemProps {
  build: RoadmapBuild
  isComplete: boolean
  onClick: () => void
  onToggleComplete: (e: React.MouseEvent) => void
}

export function BuildItem({ build, isComplete, onClick, onToggleComplete }: BuildItemProps) {
  return (
    <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded transition-colors group">
      <input
        type="checkbox"
        checked={isComplete}
        onChange={() => {}}
        onClick={onToggleComplete}
        className="mt-1 w-4 h-4 accent-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer flex-shrink-0"
      />
      <button
        onClick={onClick}
        className="text-left flex-1 text-sm text-gray-700 hover:text-teal-600 transition-colors"
      >
        <span className={isComplete ? 'line-through text-gray-500' : ''}>{build.name}</span>
      </button>
    </div>
  )
}
