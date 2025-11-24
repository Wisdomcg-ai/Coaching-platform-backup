'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BusinessProfileService } from './services/business-profile-service'
import toast, { Toaster } from 'react-hot-toast'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Building2,
  User,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  X,
  Loader2
} from 'lucide-react'
import type { BusinessProfile, SaveStatus, ValidationError } from './types'

const STEPS = [
  { id: 1, name: 'Company Information', icon: Building2 },
  { id: 2, name: 'Owner Info', icon: User },
  { id: 3, name: 'Financial Snapshot', icon: DollarSign },
  { id: 4, name: 'Team & Organisation', icon: Users },
  { id: 5, name: 'Current Situation', icon: Target },
]

// Industry list organized by category
const INDUSTRIES = [
  // Professional Services (expanded)
  'Professional Services - Bookkeeping',
  'Professional Services - Accounting',
  'Professional Services - Recruitment',
  'Professional Services - HR Consulting',
  'Professional Services - Engineering',
  'Professional Services - Financial Advisory',
  'Professional Services - Business Consulting',
  'Professional Services - IT Consulting',
  'Professional Services - Marketing Agency',
  'Professional Services - Legal Services',
  'Professional Services - Other',

  // Building, Construction & Trades
  'Building & Construction - General Builder',
  'Building & Construction - Residential',
  'Building & Construction - Commercial',
  'Trades - Plumbing',
  'Trades - Electrical',
  'Trades - HVAC',
  'Trades - Carpentry',
  'Trades - Landscaping',
  'Trades - Painting',
  'Trades - Other',

  // Allied Health & Wellness
  'Allied Health - Physiotherapy',
  'Allied Health - Occupational Therapy',
  'Allied Health - Chiropractic',
  'Allied Health - Psychology',
  'Allied Health - Dietetics/Nutrition',
  'Allied Health - Podiatry',
  'Health & Fitness - Gym/Fitness Studio',
  'Health & Fitness - Personal Training',
  'Health & Fitness - Yoga/Pilates',
  'Medical & Healthcare - General Practice',
  'Medical & Healthcare - Dental',
  'Medical & Healthcare - Specialist',

  // E-commerce & Retail
  'E-commerce - Product-based',
  'E-commerce - Dropshipping',
  'E-commerce - Amazon FBA',
  'Retail - Bricks & Mortar',
  'Retail - Online + Physical',

  // Other Industries
  'Technology & Software',
  'Real Estate',
  'Hospitality & Tourism',
  'Education & Training',
  'Transport & Logistics',
  'Agriculture & Farming',
  'Mining & Resources',
  'Manufacturing',
  'Wholesale & Distribution',
  'Non-Profit',
  'Government',
  'Other',
]

const BUSINESS_MODELS = [
  'B2B (Business to Business)',
  'B2C (Business to Consumer)',
  'B2B2C (Both)',
  'Marketplace',
  'SaaS (Software as a Service)',
  'Subscription',
  'E-commerce',
  'Professional Services',
  'Manufacturing',
  'Retail',
  'Wholesale',
  'Franchise',
]

export default function EnhancedBusinessProfile() {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [business, setBusiness] = useState<Partial<BusinessProfile>>({})
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  // Load business data on mount
  useEffect(() => {
    loadBusiness()
  }, [])

  // Validation function
  const validateBusinessProfile = (): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!business.name || business.name.trim() === '') {
      errors.push({ field: 'name', message: 'Business name is required' })
    }

    if (!business.industry || business.industry.trim() === '') {
      errors.push({ field: 'industry', message: 'Industry is required' })
    }

    if (business.annual_revenue === undefined || business.annual_revenue === null) {
      errors.push({ field: 'annual_revenue', message: 'Annual revenue is required' })
    }

    if (business.employee_count === undefined || business.employee_count === null) {
      errors.push({ field: 'employee_count', message: 'Employee count is required' })
    }

    if (business.years_in_operation === undefined || business.years_in_operation === null) {
      errors.push({ field: 'years_in_operation', message: 'Years in operation is required' })
    }

    return errors
  }

  // Helper to check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return validationErrors.some(err => err.field === fieldName)
  }

  // Helper to get field error message
  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(err => err.field === fieldName)?.message
  }

  // Consistent input styling
  const getInputClassName = (fieldName?: string) => {
    const hasError = fieldName ? hasFieldError(fieldName) : false
    return `w-full h-11 px-4 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
    }`
  }

  const getSelectClassName = (fieldName?: string) => {
    const hasError = fieldName ? hasFieldError(fieldName) : false
    return `w-full h-11 pl-4 pr-10 border rounded-lg focus:ring-2 focus:outline-none transition-colors appearance-none bg-white cursor-pointer ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
    } bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[center_right_12px] bg-no-repeat`
  }

  const getTextareaClassName = () => {
    return 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-colors resize-none'
  }

  const loadBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Use Business Profile Service to get or create both records
      const { data, businessId: bizId, profileId: profId, error } =
        await BusinessProfileService.loadBusinessProfile(user.id)

      if (error) {
        console.error('❌ Error loading business profile:', error)
        toast.error('Failed to load business profile: ' + error)
        setSaveStatus('error')
      } else if (data) {
        console.log('✅ Loaded business profile:', {
          businessId: bizId,
          profileId: profId,
          hasData: !!data,
          dataKeys: Object.keys(data),
          name: data.name,
          industry: data.industry,
          employee_count: data.employee_count
        })
        setBusiness(data)
        setBusinessId(bizId)
        setProfileId(profId)

        if (data.profile_updated_at) {
          setLastSaved(new Date(data.profile_updated_at))
        }

        // Initialize empty key_roles if not present
        if (!data.key_roles || (data.key_roles as any[]).length === 0) {
          setBusiness((prev: any) => ({
            ...prev,
            key_roles: [
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' }
            ]
          }))
        }
      }
    } catch (error) {
      console.error('Error loading business:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!businessId || !profileId) return

    setSaveStatus('saving')

    try {
      const profileData = {
        ...business,
        profile_completed: calculateCompletion() >= 80
      }

      const { success, error } = await BusinessProfileService.saveBusinessProfile(
        businessId,
        profileId,
        profileData
      )

      if (error) {
        console.error('❌ Error saving business profile:', error)
        toast.error('Auto-save failed: ' + error)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else if (success) {
        setLastSaved(new Date())
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Unexpected error during auto-save')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [business, businessId, profileId])

  // Handle field changes with debounced auto-save
  const handleFieldChange = (field: string, value: any) => {
    setBusiness((prev: any) => ({ ...prev, [field]: value }))
    
    // Clear existing timer
    if (saveTimer) clearTimeout(saveTimer)
    
    // Set new timer for auto-save (2 seconds after user stops typing)
    const newTimer = setTimeout(() => {
      autoSave()
    }, 2000)
    
    setSaveTimer(newTimer)
  }

  // Handle array field changes
  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    const currentArray = (business[field] as string[]) || []
    const newArray = [...currentArray]
    newArray[index] = value
    handleFieldChange(field, newArray)
  }

  // Add item to array field
  const addArrayItem = (field: string) => {
    const currentArray = (business[field] as string[]) || []
    handleFieldChange(field, [...currentArray, ''])
  }

  // Remove item from array field
  const removeArrayItem = (field: string, index: number) => {
    const currentArray = (business[field] as string[]) || []
    const newArray = currentArray.filter((_, i) => i !== index)
    handleFieldChange(field, newArray)
  }

  // Handle JSON field changes
  const handleJsonFieldChange = (field: string, data: any) => {
    handleFieldChange(field, data)
  }

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    let totalFields = 0
    let filledFields = 0

    // Required fields check
    const requiredFields = [
      'name', 'industry', 'annual_revenue',
      'employee_count', 'years_in_operation'
    ]

    totalFields += requiredFields.length
    filledFields += requiredFields.filter(field => business[field]).length

    // Optional but important fields
    if (business.locations && business.locations.length > 0) filledFields++
    if (business.gross_profit_margin) filledFields++
    if (business.net_profit_margin) filledFields++

    const ownerInfo = business.owner_info || {}
    if (ownerInfo.owner_name) filledFields++
    if (ownerInfo.primary_goal) filledFields++

    if (business.top_challenges && business.top_challenges.length > 0) filledFields++
    if (business.growth_opportunities && business.growth_opportunities.length > 0) filledFields++

    totalFields += 7

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  // Calculate revenue stage
  const getRevenueStage = (revenue?: number | null): string => {
    if (!revenue) return 'Foundation'
    if (revenue < 250000) return 'Foundation ($0-250K)'
    if (revenue < 1000000) return 'Traction ($250K-1M)'
    if (revenue < 3000000) return 'Scaling ($1M-3M)'
    if (revenue < 5000000) return 'Optimization ($3M-5M)'
    if (revenue < 10000000) return 'Leadership ($5M-10M)'
    return 'Mastery ($10M+)'
  }

  // Manual save function with validation
  const manualSave = async () => {
    if (saveTimer) clearTimeout(saveTimer)

    // Validate before saving
    const errors = validateBusinessProfile()
    setValidationErrors(errors)

    if (errors.length > 0) {
      toast.error(`Please fix ${errors.length} validation error${errors.length > 1 ? 's' : ''} before saving`)
      return
    }

    setIsSaving(true)
    try {
      await autoSave()
      toast.success('Business profile saved successfully!')
    } catch (error) {
      toast.error('Failed to save business profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading business profile...</div>
      </div>
    )
  }

  // Get social media data or initialize empty
  const socialMedia = business?.social_media || {}
  const ownerInfo = business?.owner_info || {}
  const partners = ownerInfo.partners || []

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h1>
              <p className="text-gray-600 text-base">
                Build your comprehensive business context to power personalized insights
              </p>
            </div>

            <div className="text-right bg-white px-6 py-4 rounded-lg border border-gray-200 shadow-sm">
              <div className={`text-3xl font-bold ${
                calculateCompletion() >= 80 ? 'text-blue-600' :
                calculateCompletion() >= 50 ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {calculateCompletion()}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Complete</div>
              {lastSaved && (
                <div className="text-xs text-gray-500 mt-2">
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = step.id < currentStep

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-full ${
                      isActive
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium text-center transition-colors ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 w-full mx-2 transition-colors ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 relative">
          {/* Save Status Indicator */}
          <div className="absolute top-6 right-6">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
                <Save className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
            )}
          </div>

          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                <p className="text-gray-600 mt-1">Tell us about your business</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={business.name || ''}
                    onChange={(e) => {
                      handleFieldChange('name', e.target.value)
                      setValidationErrors(errors => errors.filter(e => e.field !== 'name'))
                    }}
                    className={getInputClassName('name')}
                    placeholder="Enter business name"
                  />
                  {hasFieldError('name') && (
                    <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError('name')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={business.industry || ''}
                    onChange={(e) => {
                      handleFieldChange('industry', e.target.value)
                      setValidationErrors(errors => errors.filter(e => e.field !== 'industry'))
                    }}
                    className={getSelectClassName('industry')}
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  {hasFieldError('industry') && (
                    <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError('industry')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years in Business <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={business.years_in_operation || ''}
                    onChange={(e) => {
                      handleFieldChange('years_in_operation', parseInt(e.target.value) || 0)
                      setValidationErrors(errors => errors.filter(e => e.field !== 'years_in_operation'))
                    }}
                    className={getInputClassName('years_in_operation')}
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                  {hasFieldError('years_in_operation') && (
                    <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError('years_in_operation')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Model
                  </label>
                  <select
                    value={business.business_model || ''}
                    onChange={(e) => handleFieldChange('business_model', e.target.value)}
                    className={getSelectClassName()}
                  >
                    <option value="">Select model...</option>
                    {BUSINESS_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Online Presence */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Presence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="inline w-4 h-4 mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={socialMedia.website || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, website: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Linkedin className="inline w-4 h-4 mr-1" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={socialMedia.linkedin || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, linkedin: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Facebook className="inline w-4 h-4 mr-1" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={socialMedia.facebook || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, facebook: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Instagram className="inline w-4 h-4 mr-1" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={socialMedia.instagram || ''}
                      onChange={(e) => {
                        const updated = { ...socialMedia, instagram: e.target.value }
                        handleJsonFieldChange('social_media', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations / Service Areas
                </label>
                <div className="space-y-2">
                  {(business.locations || ['']).map((location: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => handleArrayFieldChange('locations', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Sydney, Melbourne, Australia-wide"
                      />
                      {(business.locations?.length || 0) > 1 && (
                        <button
                          onClick={() => removeArrayItem('locations', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('locations')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Owner Info */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Owner Info</h2>
                <p className="text-gray-600 mt-1">Tell us about yourself and your goals</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  Understanding your personal goals and ownership structure helps us provide coaching tailored to what YOU want.
                </p>
              </div>

              {/* Primary Owner Information */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Primary Owner / Founder</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Owner/Founder Name
                    </label>
                    <input
                      type="text"
                      value={ownerInfo.owner_name || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, owner_name: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className={getInputClassName()}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ownership %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={ownerInfo.ownership_percentage || ''}
                        onChange={(e) => {
                          const updated = { ...ownerInfo, ownership_percentage: parseFloat(e.target.value) || 0 }
                          handleJsonFieldChange('owner_info', updated)
                        }}
                        className={getInputClassName()}
                        min="0"
                        max="100"
                        placeholder="100"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Years in Business (Any Business)
                    </label>
                    <input
                      type="number"
                      value={ownerInfo.total_years_business || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, total_years_business: parseInt(e.target.value) || 0 }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in THIS Business
                    </label>
                    <input
                      type="number"
                      value={ownerInfo.years_this_business || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, years_this_business: parseInt(e.target.value) || 0 }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How Did You Start This Business?
                    </label>
                    <select
                      value={ownerInfo.business_origin || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, business_origin: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Started from scratch">Started from scratch</option>
                      <option value="Bought existing business">Bought existing business</option>
                      <option value="Inherited/Family business">Inherited/Family business</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Franchise">Franchise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Range
                    </label>
                    <select
                      value={ownerInfo.age_range || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, age_range: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="20s">20s</option>
                      <option value="30s">30s</option>
                      <option value="40s">40s</option>
                      <option value="50s">50s</option>
                      <option value="60+">60+</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Key Strengths/Expertise
                    </label>
                    <textarea
                      value={ownerInfo.key_expertise || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, key_expertise: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="e.g., Sales, Operations, Technical expertise, Finance..."
                    />
                  </div>
                </div>
              </div>

              {/* Business Partners */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Business Partners</h3>
                    <p className="text-sm text-gray-600">Additional owners or partners in the business</p>
                  </div>
                </div>

                {partners.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No business partners added yet</p>
                    <button
                      onClick={() => {
                        const updated = { 
                          ...ownerInfo, 
                          partners: [{ 
                            name: '', 
                            ownership_percentage: 0, 
                            role: '', 
                            involvement: '',
                            years_with_business: 0,
                            responsibilities: ''
                          }] 
                        }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Add First Partner
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {partners.map((partner: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Partner {index + 1}</h4>
                          <button
                            onClick={() => {
                              const updatedPartners = partners.filter((_: any, i: number) => i !== index)
                              const updated = { ...ownerInfo, partners: updatedPartners }
                              handleJsonFieldChange('owner_info', updated)
                            }}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Partner Name
                            </label>
                            <input
                              type="text"
                              value={partner.name || ''}
                              onChange={(e) => {
                                const updatedPartners = [...partners]
                                updatedPartners[index] = { ...partner, name: e.target.value }
                                const updated = { ...ownerInfo, partners: updatedPartners }
                                handleJsonFieldChange('owner_info', updated)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Partner's name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ownership %
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={partner.ownership_percentage || ''}
                                onChange={(e) => {
                                  const updatedPartners = [...partners]
                                  updatedPartners[index] = { ...partner, ownership_percentage: parseFloat(e.target.value) || 0 }
                                  const updated = { ...ownerInfo, partners: updatedPartners }
                                  handleJsonFieldChange('owner_info', updated)
                                }}
                                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                                placeholder="0"
                              />
                              <span className="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Role/Title
                            </label>
                            <input
                              type="text"
                              value={partner.role || ''}
                              onChange={(e) => {
                                const updatedPartners = [...partners]
                                updatedPartners[index] = { ...partner, role: e.target.value }
                                const updated = { ...ownerInfo, partners: updatedPartners }
                                handleJsonFieldChange('owner_info', updated)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Co-Founder, CFO"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Active Involvement
                            </label>
                            <select
                              value={partner.involvement || ''}
                              onChange={(e) => {
                                const updatedPartners = [...partners]
                                updatedPartners[index] = { ...partner, involvement: e.target.value }
                                const updated = { ...ownerInfo, partners: updatedPartners }
                                handleJsonFieldChange('owner_info', updated)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select...</option>
                              <option value="Full-time active">Full-time active</option>
                              <option value="Part-time active">Part-time active</option>
                              <option value="Advisory only">Advisory only</option>
                              <option value="Silent partner">Silent partner</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Years with Business
                            </label>
                            <input
                              type="number"
                              value={partner.years_with_business || ''}
                              onChange={(e) => {
                                const updatedPartners = [...partners]
                                updatedPartners[index] = { ...partner, years_with_business: parseInt(e.target.value) || 0 }
                                const updated = { ...ownerInfo, partners: updatedPartners }
                                handleJsonFieldChange('owner_info', updated)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              placeholder="0"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Key Responsibilities
                            </label>
                            <textarea
                              value={partner.responsibilities || ''}
                              onChange={(e) => {
                                const updatedPartners = [...partners]
                                updatedPartners[index] = { ...partner, responsibilities: e.target.value }
                                const updated = { ...ownerInfo, partners: updatedPartners }
                                handleJsonFieldChange('owner_info', updated)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                              placeholder="What does this partner focus on?"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const updatedPartners = [
                          ...partners,
                          { 
                            name: '', 
                            ownership_percentage: 0, 
                            role: '', 
                            involvement: '',
                            years_with_business: 0,
                            responsibilities: ''
                          }
                        ]
                        const updated = { ...ownerInfo, partners: updatedPartners }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      + Add Another Partner
                    </button>
                  </div>
                )}
              </div>

              {/* Business Goals */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">What You Want From This Business</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Business Goal
                    </label>
                    <select
                      value={ownerInfo.primary_goal || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, primary_goal: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your main goal...</option>
                      <option value="Build income & wealth">Build income & wealth</option>
                      <option value="Create freedom & lifestyle">Create freedom & lifestyle</option>
                      <option value="Make an impact">Make an impact</option>
                      <option value="Build to sell">Build to sell</option>
                      <option value="Create legacy">Create legacy</option>
                      <option value="Survive & stabilize">Survive & stabilize</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Horizon
                    </label>
                    <select
                      value={ownerInfo.time_horizon || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, time_horizon: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">How long do you plan to run this?</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                      <option value="Forever/retirement">Forever/until retirement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exit Strategy
                    </label>
                    <select
                      value={ownerInfo.exit_strategy || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, exit_strategy: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">What's your exit plan?</option>
                      <option value="Sell to third party">Sell to third party</option>
                      <option value="Pass to family">Pass to family</option>
                      <option value="Management buyout">Management buyout</option>
                      <option value="Run forever">No exit - run forever</option>
                      <option value="Haven't thought about it">Haven't thought about it</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Working Style */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Working Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Hours Per Week
                    </label>
                    <input
                      type="number"
                      value={ownerInfo.current_hours || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, current_hours: parseInt(e.target.value) || 0 }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Hours Per Week
                    </label>
                    <input
                      type="number"
                      value={ownerInfo.desired_hours || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, desired_hours: parseInt(e.target.value) || 0 }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Role in Business
                    </label>
                    <select
                      value={ownerInfo.desired_role || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, desired_role: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Working IN - doing the work">Working IN - doing the work</option>
                      <option value="Working ON - building systems">Working ON - building systems</option>
                      <option value="Mix of both">Mix of both</option>
                      <option value="Strategic only - minimal operations">Strategic only - minimal operations</option>
                      <option value="Want to step back completely">Want to step back completely</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What You LOVE Doing
                    </label>
                    <textarea
                      value={ownerInfo.love_doing || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, love_doing: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="What gives you energy?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What You HATE Doing
                    </label>
                    <textarea
                      value={ownerInfo.hate_doing || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, hate_doing: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="What drains your energy?"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Needs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Financial Needs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Income Needed (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={ownerInfo.minimum_income || ''}
                        onChange={(e) => {
                          const updated = { ...ownerInfo, minimum_income: parseFloat(e.target.value) || 0 }
                          handleJsonFieldChange('owner_info', updated)
                        }}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Income Desired (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={ownerInfo.target_income || ''}
                        onChange={(e) => {
                          const updated = { ...ownerInfo, target_income: parseFloat(e.target.value) || 0 }
                          handleJsonFieldChange('owner_info', updated)
                        }}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="250000"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Tolerance
                    </label>
                    <select
                      value={ownerInfo.risk_tolerance || ''}
                      onChange={(e) => {
                        const updated = { ...ownerInfo, risk_tolerance: e.target.value }
                        handleJsonFieldChange('owner_info', updated)
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Conservative - Minimize risk">Conservative - Minimize risk</option>
                      <option value="Moderate - Balanced approach">Moderate - Balanced approach</option>
                      <option value="Aggressive - High growth focus">Aggressive - High growth focus</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Snapshot */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Snapshot</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  This data will be automatically synchronized with Xero once integrated. Manual entry for now.
                </p>
              </div>

              {/* Revenue Stage Indicator */}
              {business.annual_revenue && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                  <div className="text-sm opacity-90">Revenue Stage</div>
                  <div className="text-2xl font-bold mt-1">{getRevenueStage(business.annual_revenue)}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={business.annual_revenue || ''}
                      onChange={(e) => {
                        handleFieldChange('annual_revenue', parseFloat(e.target.value) || 0)
                        setValidationErrors(errors => errors.filter(e => e.field !== 'annual_revenue'))
                      }}
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        hasFieldError('annual_revenue')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {hasFieldError('annual_revenue') && (
                    <p className="text-red-600 text-sm mt-1">{getFieldError('annual_revenue')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={business.gross_profit_margin || ''}
                      onChange={(e) => handleFieldChange('gross_profit_margin', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={business.net_profit_margin || ''}
                      onChange={(e) => handleFieldChange('net_profit_margin', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="-100"
                      max="100"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              </div>

              {/* Margin Health Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Gross Margin Health</div>
                  <div className={`text-lg font-semibold ${
                    (business.gross_profit_margin || 0) >= 50 ? 'text-green-600' :
                    (business.gross_profit_margin || 0) >= 30 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(business.gross_profit_margin || 0) >= 50 ? 'Excellent' :
                     (business.gross_profit_margin || 0) >= 30 ? 'Good' :
                     'Needs Improvement'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Net Margin Health</div>
                  <div className={`text-lg font-semibold ${
                    (business.net_profit_margin || 0) >= 20 ? 'text-green-600' :
                    (business.net_profit_margin || 0) >= 10 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(business.net_profit_margin || 0) >= 20 ? 'Excellent' :
                     (business.net_profit_margin || 0) >= 10 ? 'Good' :
                     'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Team & Organisation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Team & Organisation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Employees *
                  </label>
                  <input
                    type="number"
                    value={business.employee_count || ''}
                    onChange={(e) => {
                      handleFieldChange('employee_count', parseInt(e.target.value) || 0)
                      setValidationErrors(errors => errors.filter(e => e.field !== 'employee_count'))
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      hasFieldError('employee_count')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    min="0"
                  />
                  {hasFieldError('employee_count') && (
                    <p className="text-red-600 text-sm mt-1">{getFieldError('employee_count')}</p>
                  )}
                  {!hasFieldError('employee_count') && business.annual_revenue && business.employee_count && business.employee_count > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Revenue per employee: ${Math.round((business.annual_revenue / business.employee_count)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-2 mb-2 px-3">
                    <div className="text-xs font-medium text-gray-600">Role</div>
                    <div className="text-xs font-medium text-gray-600">Name</div>
                    <div className="text-xs font-medium text-gray-600">Status</div>
                  </div>
                  <div className="space-y-2">
                    {((business.key_roles as any[] || []).length < 3 
                      ? [...(business.key_roles as any[] || []), ...Array(3 - (business.key_roles as any[] || []).length).fill({ title: '', name: '', status: '' })]
                      : (business.key_roles as any[] || [])
                    ).map((role: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={role.title || ''}
                            onChange={(e) => {
                              const roles = [...(business.key_roles as any[] || [])]
                              if (!roles[index]) roles[index] = { title: '', name: '', status: '' }
                              roles[index] = { ...roles[index], title: e.target.value }
                              handleJsonFieldChange('key_roles', roles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="e.g., CEO, Sales Manager"
                          />
                          <input
                            type="text"
                            value={role.name || ''}
                            onChange={(e) => {
                              const roles = [...(business.key_roles as any[] || [])]
                              if (!roles[index]) roles[index] = { title: '', name: '', status: '' }
                              roles[index] = { ...roles[index], name: e.target.value }
                              handleJsonFieldChange('key_roles', roles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Person's name"
                          />
                          <select
                            value={role.status || ''}
                            onChange={(e) => {
                              const roles = [...(business.key_roles as any[] || [])]
                              if (!roles[index]) roles[index] = { title: '', name: '', status: '' }
                              roles[index] = { ...roles[index], status: e.target.value }
                              handleJsonFieldChange('key_roles', roles)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select Status</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Casual">Casual</option>
                            <option value="Virtual Assistant">Virtual Assistant</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(business.key_roles as any[] || []).length >= 3 && (
                    <button
                      onClick={() => {
                        const roles = [...(business.key_roles as any[] || []), { title: '', name: '', status: '' }]
                        handleJsonFieldChange('key_roles', roles)
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      + Add Another Role
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Current Situation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Situation</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  This provides critical context for AI recommendations. Be specific and honest about your challenges and opportunities.
                </p>
              </div>

              {/* Top Challenges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Current Challenges
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <textarea
                          value={(business.top_challenges || [])[index] || ''}
                          onChange={(e) => {
                            const challenges = [...(business.top_challenges || ['', '', ''])]
                            challenges[index] = e.target.value
                            handleFieldChange('top_challenges', challenges)
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder={`Challenge ${index + 1}: Be specific about what's holding you back...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Opportunities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Growth Opportunities
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <textarea
                          value={(business.growth_opportunities || [])[index] || ''}
                          onChange={(e) => {
                            const opportunities = [...(business.growth_opportunities || ['', '', ''])]
                            opportunities[index] = e.target.value
                            handleFieldChange('growth_opportunities', opportunities)
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder={`Opportunity ${index + 1}: What could accelerate your growth...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Context - NEW SECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anything Else We Should Know?
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Any other context, goals, constraints, or information that would help us support you better
                </p>
                <textarea
                  value={ownerInfo.additional_context || ''}
                  onChange={(e) => {
                    const updated = { ...ownerInfo, additional_context: e.target.value }
                    handleJsonFieldChange('owner_info', updated)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share any additional information that might be helpful for your coaching journey..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={manualSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            {currentStep < STEPS.length && (
              <button
                onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {currentStep === STEPS.length && (
              <button
                onClick={() => {
                  manualSave()
                  router.push('/dashboard')
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
              >
                Complete Profile
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Summary Card */}
        {calculateCompletion() >= 80 && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mt-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Profile Complete!
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  Your comprehensive business context is ready to power AI-driven insights
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}