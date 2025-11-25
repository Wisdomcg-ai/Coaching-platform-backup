'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Lightbulb } from 'lucide-react'
import type { Activity, Zone, FocusFunnelOutcome, Frequency } from '../types'
import {
  ZONE_OPTIONS,
  FOCUS_FUNNEL_OPTIONS,
  FREQUENCY_OPTIONS,
  ACTIVITY_PROMPT_TRIGGERS,
  calculateMonthlyHours
} from '../types'

interface Step3ActivityInventoryProps {
  activities: Activity[]
  onAddActivity: (activity: Partial<Activity>) => Promise<Activity | null>
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void
  onDeleteActivity: (id: string) => void
}

export default function Step3ActivityInventory({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity
}: Step3ActivityInventoryProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New activity form state
  const [newActivityName, setNewActivityName] = useState('')
  const [newFrequency, setNewFrequency] = useState<Frequency>('weekly')
  const [newDuration, setNewDuration] = useState<number>(30)
  const [newZone, setNewZone] = useState<Zone>('competence')
  const [newFocusFunnel, setNewFocusFunnel] = useState<FocusFunnelOutcome | ''>('')

  // Reset form
  const resetForm = () => {
    setNewActivityName('')
    setNewFrequency('weekly')
    setNewDuration(30)
    setNewZone('competence')
    setNewFocusFunnel('')
    setIsAdding(false)
  }

  // Add new activity
  const handleAddActivity = async () => {
    if (!newActivityName.trim()) return

    await onAddActivity({
      activity_name: newActivityName.trim(),
      frequency: newFrequency,
      duration_minutes: newDuration,
      zone: newZone,
      focus_funnel_outcome: newFocusFunnel || null
    })

    resetForm()
  }

  // Quick add from prompt trigger
  const handleQuickAdd = async (triggerWord: string) => {
    const activityName = prompt(`What ${triggerWord.toLowerCase()} activity do you do?`)
    if (activityName) {
      await onAddActivity({
        activity_name: activityName,
        frequency: 'weekly',
        duration_minutes: 30,
        zone: 'competence'
      })
    }
  }

  // Get zone style
  const getZoneStyle = (zone: Zone) => {
    const option = ZONE_OPTIONS.find(z => z.zone === zone)
    return option || ZONE_OPTIONS[2] // Default to competence
  }

  // Calculate monthly hours display
  const getMonthlyHours = (activity: Activity) => {
    const hours = calculateMonthlyHours(activity.duration_minutes, activity.frequency)
    return Math.round(hours * 10) / 10
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Inventory</h2>
        <p className="text-gray-600 mt-1">
          List everything you do in your business. Be thorough - the more activities you list, the more opportunities to free up time.
        </p>
      </div>

      {/* Prompt Triggers */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 font-medium">Think about...</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {ACTIVITY_PROMPT_TRIGGERS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => handleQuickAdd(trigger)}
                  className="px-3 py-1 bg-white border border-amber-300 rounded-full text-sm text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Form */}
      {isAdding ? (
        <div className="bg-white border-2 border-teal-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Add New Activity</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Activity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              placeholder="e.g., Responding to client emails"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as Frequency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)}
                min={5}
                step={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <select
                value={newZone}
                onChange={(e) => setNewZone(e.target.value as Zone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {ZONE_OPTIONS.map((opt) => (
                  <option key={opt.zone} value={opt.zone}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Focus Funnel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Funnel Outcome
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_FUNNEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNewFocusFunnel(newFocusFunnel === opt.value ? '' : opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    newFocusFunnel === opt.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddActivity}
              disabled={!newActivityName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4" />
              Add Activity
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Your Activities ({activities.length})</h3>
          {activities.length > 0 && (
            <span className="text-sm text-gray-500">
              Total: {Math.round(activities.reduce((sum, a) => sum + getMonthlyHours(a), 0))} hours/month
            </span>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No activities yet. Start adding your tasks above!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activities.map((activity) => {
              const zoneStyle = getZoneStyle(activity.zone)
              const isEditing = editingId === activity.id

              return (
                <div
                  key={activity.id}
                  className={`bg-white border rounded-lg p-4 ${zoneStyle.borderColor} ${zoneStyle.bgColor}`}
                >
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={activity.activity_name}
                        onChange={(e) => onUpdateActivity(activity.id, { activity_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={activity.frequency}
                          onChange={(e) => onUpdateActivity(activity.id, { frequency: e.target.value as Frequency })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {FREQUENCY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={activity.duration_minutes}
                          onChange={(e) => onUpdateActivity(activity.id, { duration_minutes: parseInt(e.target.value) || 0 })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <select
                          value={activity.zone}
                          onChange={(e) => onUpdateActivity(activity.id, { zone: e.target.value as Zone })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {ZONE_OPTIONS.map((opt) => (
                            <option key={opt.zone} value={opt.zone}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-teal-600 text-white rounded text-sm"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${zoneStyle.color}`}>
                            {activity.activity_name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${zoneStyle.bgColor} ${zoneStyle.color} border ${zoneStyle.borderColor}`}>
                            {zoneStyle.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{FREQUENCY_OPTIONS.find(f => f.value === activity.frequency)?.label}</span>
                          <span>{activity.duration_minutes} min</span>
                          <span className="font-medium">{getMonthlyHours(activity)}h/month</span>
                          {activity.focus_funnel_outcome && (
                            <span className="flex items-center gap-1">
                              {FOCUS_FUNNEL_OPTIONS.find(f => f.value === activity.focus_funnel_outcome)?.icon}
                              {FOCUS_FUNNEL_OPTIONS.find(f => f.value === activity.focus_funnel_outcome)?.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(activity.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this activity?')) {
                              onDeleteActivity(activity.id)
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Zone Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Zone Guide</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ZONE_OPTIONS.map((option) => (
            <div key={option.zone} className={`p-3 rounded-lg ${option.bgColor} border ${option.borderColor}`}>
              <p className={`font-medium text-sm ${option.color}`}>{option.label}</p>
              <p className="text-xs text-gray-600 mt-1">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
