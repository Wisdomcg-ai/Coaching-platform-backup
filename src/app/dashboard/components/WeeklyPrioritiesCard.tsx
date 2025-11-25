'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, Calendar, ArrowRight } from 'lucide-react'

interface WeeklyPrioritiesCardProps {
  weeklyGoals: string[]
}

export default function WeeklyPrioritiesCard({ weeklyGoals }: WeeklyPrioritiesCardProps) {
  const completedCount = 0
  const totalCount = weeklyGoals.length

  return (
    <div className="bg-white rounded-xl border-l-4 border-l-teal-500 border-t border-r border-b border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">This Week's Focus</h3>
              <p className="text-xs text-slate-500">Your top priorities</p>
            </div>
          </div>
          {totalCount > 0 && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {completedCount}/{totalCount} done
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {weeklyGoals.length > 0 ? (
          <div className="space-y-1">
            {weeklyGoals.map((goal, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <Circle className="h-5 w-5 text-slate-300 group-hover:hidden" />
                  <CheckCircle2 className="h-5 w-5 text-teal-500 hidden group-hover:block" />
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-800 transition-colors flex-1">
                  {goal}
                </span>
              </div>
            ))}

            <Link
              href="/reviews/weekly"
              className="flex items-center justify-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 pt-3 mt-2 border-t border-slate-100"
            >
              Weekly review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No weekly priorities set</p>
            <p className="text-sm text-slate-400 mb-4">Complete a weekly review to set your focus</p>
            <Link
              href="/reviews/weekly"
              className="inline-flex items-center px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
            >
              Start Weekly Review
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
