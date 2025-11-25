'use client'

import { MessageCircle, Clock } from 'lucide-react'

interface AskCoachCardProps {
  onOpenModal: () => void
}

export default function AskCoachCard({ onOpenModal }: AskCoachCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Need Guidance?</h3>
            <p className="text-xs text-slate-500">Your coach is here to help</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Ask anything about your business strategy, challenges, or growth plans.
            </p>

            <button
              type="button"
              onClick={onOpenModal}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              Ask Your Coach
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <p className="text-xs">Typical response within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Coaching tip */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-600">Tip:</span> Be specific about your challenge for the best guidance
          </p>
        </div>
      </div>
    </div>
  )
}
