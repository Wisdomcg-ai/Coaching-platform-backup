'use client'

import { MessageCircle, Lightbulb } from 'lucide-react'

interface AskCoachCardProps {
  onOpenModal: () => void
  lastQuestionDate?: string
}

// Rotating coaching tips
const coachingTips = [
  "Focus on leading indicators, not just lagging results.",
  "The constraint isn't usually what you think it is.",
  "Delegation doesn't mean abdication - stay engaged.",
  "What got you here won't get you there.",
  "Systems create freedom. Build them relentlessly.",
  "Your calendar reflects your real priorities."
]

function getRandomTip(): string {
  // Use day of year to rotate tips predictably
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return coachingTips[dayOfYear % coachingTips.length]
}

export default function AskCoachCard({ onOpenModal, lastQuestionDate }: AskCoachCardProps) {
  const tip = getRandomTip()

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Your Coach</h3>
            <p className="text-xs text-slate-500">
              {lastQuestionDate ? `Last chat: ${lastQuestionDate}` : 'Here to help you grow'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Coaching Insight */}
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-teal-700 uppercase tracking-wide mb-1">
                Today's Insight
              </p>
              <p className="text-sm text-teal-800 italic">
                "{tip}"
              </p>
            </div>
          </div>
        </div>

        {/* Ask Button */}
        <button
          type="button"
          onClick={onOpenModal}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
        >
          <MessageCircle className="h-5 w-5" />
          Ask Your Coach
        </button>

        {/* Help text */}
        <p className="text-xs text-slate-400 text-center mt-3">
          Strategy, challenges, growth plans - ask anything
        </p>
      </div>
    </div>
  )
}
