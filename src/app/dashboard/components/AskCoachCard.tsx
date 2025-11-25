'use client'

import { MessageCircle } from 'lucide-react'

interface AskCoachCardProps {
  onOpenModal: () => void
}

export default function AskCoachCard({ onOpenModal }: AskCoachCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
      <div className="text-center py-4">
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          Ask Your Coach
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Your coach will respond within 24 hours
        </p>
      </div>
    </div>
  )
}
