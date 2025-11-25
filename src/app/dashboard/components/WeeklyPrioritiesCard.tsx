'use client'

import Link from 'next/link'
import { CheckSquare } from 'lucide-react'

interface WeeklyPrioritiesCardProps {
  weeklyGoals: string[]
}

export default function WeeklyPrioritiesCard({ weeklyGoals }: WeeklyPrioritiesCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Priorities</h3>

      {weeklyGoals.length > 0 ? (
        <div className="space-y-2">
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{goal}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-3">No weekly goals set</p>
          <Link
            href="/reviews/weekly"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Complete Weekly Review →
          </Link>
        </div>
      )}
    </div>
  )
}
