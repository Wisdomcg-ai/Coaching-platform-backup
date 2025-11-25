'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, Calendar } from 'lucide-react'

interface WeeklyPrioritiesCardProps {
  weeklyGoals: string[]
}

export default function WeeklyPrioritiesCard({ weeklyGoals }: WeeklyPrioritiesCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">This Week's Focus</h3>
              <p className="text-xs text-slate-500">Your top priorities</p>
            </div>
          </div>
          {weeklyGoals.length > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {weeklyGoals.length} priorities
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {weeklyGoals.length > 0 ? (
          <div className="space-y-2">
            {weeklyGoals.map((goal, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <Circle className="h-5 w-5 text-slate-300 group-hover:hidden" />
                  <CheckCircle2 className="h-5 w-5 text-teal-500 hidden group-hover:block" />
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors flex-1">
                  {goal}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No weekly priorities set</p>
            <p className="text-sm text-slate-400 mb-4">Complete a weekly review to set your focus</p>
            <Link
              href="/reviews/weekly"
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Weekly Review
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
