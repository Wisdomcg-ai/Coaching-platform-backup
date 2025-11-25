'use client'

import { useState, useMemo } from 'react'
import { Clock, SkipForward, Lightbulb, RotateCcw, Plus, X } from 'lucide-react'

interface Step1TimeLogProps {
  onSkipStep: () => void
}

interface Activity {
  id: string
  label: string
  color: string
  lightColor: string
  isCustom?: boolean
}

// Default activity categories with colors
const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'email', label: 'Email', color: 'bg-blue-500', lightColor: 'bg-blue-100' },
  { id: 'meetings', label: 'Meetings', color: 'bg-purple-500', lightColor: 'bg-purple-100' },
  { id: 'admin', label: 'Admin', color: 'bg-gray-500', lightColor: 'bg-gray-200' },
  { id: 'client', label: 'Client Work', color: 'bg-green-500', lightColor: 'bg-green-100' },
  { id: 'sales', label: 'Sales', color: 'bg-amber-500', lightColor: 'bg-amber-100' },
  { id: 'marketing', label: 'Marketing', color: 'bg-pink-500', lightColor: 'bg-pink-100' },
  { id: 'team', label: 'Team', color: 'bg-indigo-500', lightColor: 'bg-indigo-100' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-500', lightColor: 'bg-emerald-100' },
  { id: 'planning', label: 'Planning', color: 'bg-teal-500', lightColor: 'bg-teal-100' },
  { id: 'break', label: 'Break', color: 'bg-slate-400', lightColor: 'bg-slate-100' },
]

// Colors available for custom activities
const CUSTOM_COLORS = [
  { color: 'bg-red-500', lightColor: 'bg-red-100' },
  { color: 'bg-orange-500', lightColor: 'bg-orange-100' },
  { color: 'bg-yellow-500', lightColor: 'bg-yellow-100' },
  { color: 'bg-lime-500', lightColor: 'bg-lime-100' },
  { color: 'bg-cyan-500', lightColor: 'bg-cyan-100' },
  { color: 'bg-sky-500', lightColor: 'bg-sky-100' },
  { color: 'bg-violet-500', lightColor: 'bg-violet-100' },
  { color: 'bg-fuchsia-500', lightColor: 'bg-fuchsia-100' },
  { color: 'bg-rose-500', lightColor: 'bg-rose-100' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Generate 15-min slots from 6am to 8pm
const TIME_SLOTS: string[] = []
for (let hour = 6; hour <= 20; hour++) {
  for (let min = 0; min < 60; min += 15) {
    if (hour === 20 && min > 0) break // Stop at 8pm
    TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
  }
}

type TimeGrid = Record<string, Record<string, string>> // day -> slot -> activityId

export default function Step1TimeLog({ onSkipStep }: Step1TimeLogProps) {
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES)
  const [selectedActivity, setSelectedActivity] = useState<string>('email')
  const [timeGrid, setTimeGrid] = useState<TimeGrid>({})
  const [isDragging, setIsDragging] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityColor, setNewActivityColor] = useState(CUSTOM_COLORS[0])

  // Add custom activity
  const addCustomActivity = () => {
    if (!newActivityName.trim()) return

    const id = `custom-${Date.now()}`
    const newActivity: Activity = {
      id,
      label: newActivityName.trim(),
      color: newActivityColor.color,
      lightColor: newActivityColor.lightColor,
      isCustom: true
    }

    setActivities(prev => [...prev, newActivity])
    setSelectedActivity(id)
    setNewActivityName('')
    setShowAddForm(false)
  }

  // Remove custom activity
  const removeCustomActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
    if (selectedActivity === id) {
      setSelectedActivity('email')
    }
    // Also remove from grid
    setTimeGrid(prev => {
      const newGrid: TimeGrid = {}
      Object.entries(prev).forEach(([day, slots]) => {
        newGrid[day] = {}
        Object.entries(slots).forEach(([slot, actId]) => {
          if (actId !== id) {
            newGrid[day][slot] = actId
          }
        })
      })
      return newGrid
    })
  }

  // Handle cell click
  const handleCellClick = (day: string, slot: string) => {
    setTimeGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: prev[day]?.[slot] === selectedActivity ? '' : selectedActivity
      }
    }))
  }

  // Handle drag fill
  const handleCellEnter = (day: string, slot: string) => {
    if (isDragging && selectedActivity) {
      setTimeGrid(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: selectedActivity
        }
      }))
    }
  }

  // Get activity for a cell
  const getCellActivity = (day: string, slot: string) => {
    return timeGrid[day]?.[slot] || ''
  }

  // Get activity style
  const getActivityStyle = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId)
    return activity || null
  }

  // Calculate hours by activity (each slot = 15 mins = 0.25 hours)
  const hoursByActivity = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.values(timeGrid).forEach(dayData => {
      Object.values(dayData).forEach(activityId => {
        if (activityId) {
          counts[activityId] = (counts[activityId] || 0) + 0.25
        }
      })
    })
    return activities.map(a => ({
      ...a,
      hours: Math.round((counts[a.id] || 0) * 10) / 10
    })).filter(a => a.hours > 0).sort((a, b) => b.hours - a.hours)
  }, [timeGrid, activities])

  // Total hours logged
  const totalHours = Math.round(hoursByActivity.reduce((sum, a) => sum + a.hours, 0) * 10) / 10

  // Clear all
  const clearAll = () => {
    setTimeGrid({})
  }

  // Format slot for display (only show on hour marks)
  const formatSlot = (slot: string) => {
    const [hourStr, minStr] = slot.split(':')
    const hour = parseInt(hourStr)
    const min = parseInt(minStr)

    // Only show label on the hour
    if (min !== 0) return ''

    if (hour === 12) return '12pm'
    if (hour > 12) return `${hour - 12}pm`
    return `${hour}am`
  }

  // Check if slot is on the hour (for border styling)
  const isHourMark = (slot: string) => slot.endsWith(':00')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Log</h2>
          <p className="text-gray-600 mt-1">
            Click or drag to log how you spend your time. This helps identify patterns.
          </p>
        </div>
        <button
          onClick={onSkipStep}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
      </div>

      {/* Activity Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Select activity, then click/drag on grid:</span>
          {totalHours > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.map(activity => (
            <div key={activity.id} className="relative group">
              <button
                onClick={() => setSelectedActivity(activity.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedActivity === activity.id
                    ? `${activity.color} text-white shadow-md scale-105`
                    : `${activity.lightColor} text-gray-700 hover:scale-102`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activity.color}`} />
                {activity.label}
              </button>
              {activity.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCustomActivity(activity.id)
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add Custom Activity Button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-dashed border-gray-300 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2">
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomActivity()}
                placeholder="Task name..."
                className="w-28 px-2 py-1 text-sm border-none focus:outline-none"
                autoFocus
              />
              <div className="flex gap-1">
                {CUSTOM_COLORS.slice(0, 5).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setNewActivityColor(c)}
                    className={`w-5 h-5 rounded-full ${c.color} ${newActivityColor.color === c.color ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  />
                ))}
              </div>
              <button
                onClick={addCustomActivity}
                disabled={!newActivityName.trim()}
                className="p-1 bg-teal-600 text-white rounded disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewActivityName('')
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Time Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div
          className="overflow-x-auto"
          onMouseLeave={() => setIsDragging(false)}
        >
          <table className="w-full text-sm select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600 w-16 border-r border-gray-200">
                  <Clock className="w-4 h-4" />
                </th>
                {DAYS.map(day => (
                  <th key={day} className="px-2 py-2 text-center font-medium text-gray-600 min-w-[80px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => {
                const showLabel = isHourMark(slot)
                return (
                  <tr key={slot} className={`${isHourMark(slot) ? 'border-t border-gray-200' : ''}`}>
                    <td className={`sticky left-0 bg-white px-2 py-0 text-xs text-gray-500 border-r border-gray-200 font-medium ${showLabel ? '' : 'text-transparent'}`}>
                      {formatSlot(slot) || '·'}
                    </td>
                    {DAYS.map(day => {
                      const activityId = getCellActivity(day, slot)
                      const activityStyle = getActivityStyle(activityId)

                      return (
                        <td
                          key={`${day}-${slot}`}
                          onMouseDown={() => {
                            setIsDragging(true)
                            handleCellClick(day, slot)
                          }}
                          onMouseUp={() => setIsDragging(false)}
                          onMouseEnter={() => handleCellEnter(day, slot)}
                          className={`p-0.5 cursor-pointer transition-colors ${
                            !activityId ? 'hover:bg-gray-100' : ''
                          }`}
                        >
                          <div
                            className={`h-4 rounded-sm ${
                              activityStyle
                                ? `${activityStyle.color}`
                                : 'bg-gray-50'
                            }`}
                            title={activityStyle?.label || `${slot} - Click to log`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {totalHours > 0 ? (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-100 text-sm mb-1">Total Hours Logged</p>
              <p className="text-3xl font-bold">{totalHours}h</p>
            </div>
            <div className="text-right">
              <p className="text-teal-100 text-sm mb-2">Breakdown</p>
              <div className="space-y-1">
                {hoursByActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-center justify-end gap-2 text-sm">
                    <span>{activity.label}</span>
                    <span className="font-semibold">{activity.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-medium">Tip</p>
              <p className="text-amber-800 text-sm mt-1">
                Log a typical week to see where your time really goes.
                Click and drag to quickly fill in blocks of time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
