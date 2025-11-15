// /app/business-profile/services/business-profile-service.ts
'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

/**
 * Business Profile Service - Supabase Integration
 *
 * Handles the normalized data model:
 * - businesses table: Lightweight parent (id, name, owner_id)
 * - business_profiles table: Detailed child (all profile fields)
 *
 * business_profiles.business_id -> businesses.id
 */
export class BusinessProfileService {

  /**
   * Get or create business + business_profile for a user
   * This ensures both records exist and are properly linked
   */
  static async getOrCreateBusinessProfile(userId: string): Promise<{
    business: any
    profile: any
    error?: string
  }> {
    try {
      console.log('[Business Profile Service] 📥 Loading business profile for user:', userId)

      // Step 1: Get or create business record
      let { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true })

      if (businessError) {
        console.error('[Business Profile Service] ❌ Error fetching businesses:', businessError)
        return { business: null, profile: null, error: businessError.message }
      }

      let business = businesses && businesses.length > 0 ? businesses[0] : null

      // Create business if doesn't exist
      if (!business) {
        console.log('[Business Profile Service] 🆕 Creating new business record')
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({
            owner_id: userId,
            name: 'My Business',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('[Business Profile Service] ❌ Error creating business:', createError)
          return { business: null, profile: null, error: createError.message }
        }

        business = newBusiness
        console.log('[Business Profile Service] ✅ Created business:', business.id)
      }

      // Step 2: Get or create business_profile record
      // Query by user_id only since one user = one business profile
      let { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle 0 results gracefully

      if (profileError) {
        console.error('[Business Profile Service] ❌ Error fetching profile:', profileError)
        return { business, profile: null, error: profileError.message }
      }

      // Create profile if doesn't exist
      if (!profile) {
        console.log('[Business Profile Service] 🆕 Creating new business profile record')
        const { data: newProfile, error: createProfileError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: userId,
            business_id: business.id,
            company_name: business.name || 'My Business', // REQUIRED field
            business_name: business.name || 'My Business',
            key_roles: [
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' },
              { title: '', name: '', status: '' }
            ],
            owner_info: {},
            profile_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createProfileError) {
          console.error('[Business Profile Service] ❌ Error creating profile:', createProfileError)
          return { business, profile: null, error: createProfileError.message }
        }

        profile = newProfile
        console.log('[Business Profile Service] ✅ Created profile:', profile.id)
      }

      console.log('[Business Profile Service] ✅ Loaded business + profile successfully')
      return { business, profile }
    } catch (err) {
      console.error('[Business Profile Service] ❌ Unexpected error:', err)
      return {
        business: null,
        profile: null,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }

  /**
   * Save business profile data
   * Updates both business (name only) and business_profile (all fields)
   */
  static async saveBusinessProfile(
    businessId: string,
    profileId: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[Business Profile Service] 💾 Saving business profile...')

      // Step 1: Update business table (just name)
      if (data.name) {
        const { error: businessError } = await supabase
          .from('businesses')
          .update({
            name: data.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', businessId)

        if (businessError) {
          console.error('[Business Profile Service] ❌ Error updating business:', businessError)
          return { success: false, error: businessError.message }
        }
      }

      // Step 2: Update business_profile table (all profile fields)
      const profileData: any = {
        updated_at: new Date().toISOString(),
        profile_updated_at: new Date().toISOString()
      }

      // Map all the profile fields
      if (data.name) {
        profileData.company_name = data.name // REQUIRED field
        profileData.business_name = data.name
      }
      if (data.industry !== undefined) profileData.industry = data.industry
      if (data.business_model !== undefined) profileData.business_model = data.business_model
      if (data.years_in_operation !== undefined) profileData.years_in_operation = data.years_in_operation
      if (data.employee_count !== undefined) profileData.employee_count = data.employee_count
      if (data.annual_revenue !== undefined) profileData.annual_revenue = data.annual_revenue
      if (data.gross_profit_margin !== undefined) profileData.gross_profit_margin = data.gross_profit_margin
      if (data.net_profit_margin !== undefined) profileData.net_profit_margin = data.net_profit_margin
      if (data.cash_in_bank !== undefined) profileData.cash_in_bank = data.cash_in_bank
      if (data.owner_info !== undefined) profileData.owner_info = data.owner_info
      if (data.key_roles !== undefined) profileData.key_roles = data.key_roles
      if (data.contractors_count !== undefined) profileData.contractors_count = data.contractors_count
      if (data.reporting_structure !== undefined) profileData.reporting_structure = data.reporting_structure
      if (data.top_challenges !== undefined) profileData.top_challenges = data.top_challenges
      if (data.growth_opportunities !== undefined) profileData.growth_opportunities = data.growth_opportunities
      if (data.current_priorities !== undefined) profileData.current_priorities = data.current_priorities
      if (data.social_media !== undefined) profileData.social_media = data.social_media
      if (data.website !== undefined) profileData.website = data.website
      if (data.locations !== undefined) profileData.locations = data.locations
      if (data.profile_completed !== undefined) profileData.profile_completed = data.profile_completed

      const { error: profileError } = await supabase
        .from('business_profiles')
        .update(profileData)
        .eq('id', profileId)

      if (profileError) {
        console.error('[Business Profile Service] ❌ Error updating profile:', profileError)
        return { success: false, error: profileError.message }
      }

      console.log('[Business Profile Service] ✅ Successfully saved business profile')
      return { success: true }
    } catch (err) {
      console.error('[Business Profile Service] ❌ Error saving:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }

  /**
   * Load business profile data
   * Returns merged data from both tables
   */
  static async loadBusinessProfile(userId: string): Promise<{
    data: any
    businessId: string | null
    profileId: string | null
    error?: string
  }> {
    try {
      const { business, profile, error } = await this.getOrCreateBusinessProfile(userId)

      if (error) {
        return { data: null, businessId: null, profileId: null, error }
      }

      // Merge business + profile data for the UI
      const mergedData = {
        ...profile,
        name: business?.name || profile?.business_name || 'My Business',
        // All other fields come from profile
      }

      return {
        data: mergedData,
        businessId: business?.id || null,
        profileId: profile?.id || null
      }
    } catch (err) {
      console.error('[Business Profile Service] ❌ Error loading:', err)
      return {
        data: null,
        businessId: null,
        profileId: null,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }
}

export default BusinessProfileService
