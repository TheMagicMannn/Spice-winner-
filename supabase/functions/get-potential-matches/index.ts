// Supabase Edge Function: Get Potential Matches
// Deploy this to Supabase Edge Functions for advanced matching logic
// 
// Deploy command:
// supabase functions deploy get-potential-matches

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchPreferences {
  ageRange: [number, number];
  genders: string[];
  orientations: string[];
  searchingFor: string[];
  distance: number;
  vipOnly: boolean;
  verifiedOnly: boolean;
  experienceLevels: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get user's profile and preferences
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    if (!userProfile?.profile_completed) {
      throw new Error('Profile not completed')
    }

    const prefs = userProfile.match_preferences as MatchPreferences

    // Build the query for potential matches
    let query = supabaseClient
      .from('profiles')
      .select('id, display_name, display_name2, account_type, age, age2, gender, gender2, orientation, orientation2, location, photos, bio, interests, kinks, lifestyle_experience, membership_tier, is_verified')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .neq('id', user.id)

    // Filter by age range
    query = query.gte('age', prefs.ageRange[0])
    query = query.lte('age', prefs.ageRange[1])

    // Filter by account type (Individual / Couple)
    if (prefs.searchingFor.length > 0) {
      if (prefs.searchingFor.includes('Individual') && !prefs.searchingFor.includes('Couple')) {
        query = query.eq('account_type', 'individual')
      } else if (prefs.searchingFor.includes('Couple') && !prefs.searchingFor.includes('Individual')) {
        query = query.eq('account_type', 'couple')
      }
      // If both or "Both" is selected, don't filter
    }

    // Filter by VIP status
    if (prefs.vipOnly) {
      query = query.eq('membership_tier', 'vip')
    }

    // Filter by verified status
    if (prefs.verifiedOnly) {
      query = query.eq('is_verified', true)
    }

    // Execute query
    const { data: potentialMatches, error: matchError } = await query

    if (matchError) throw matchError

    // Get existing matches to exclude
    const { data: existingMatches } = await supabaseClient
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

    const matchedUserIds = new Set(
      existingMatches?.map(m => 
        m.user1_id === user.id ? m.user2_id : m.user1_id
      ) || []
    )

    // Filter out already matched users and apply additional filters
    const filteredMatches = (potentialMatches || []).filter(profile => {
      // Skip if already matched
      if (matchedUserIds.has(profile.id)) return false

      // Filter by gender preferences
      if (prefs.genders.length > 0) {
        const hasMatchingGender = 
          prefs.genders.includes(profile.gender) ||
          (profile.gender2 && prefs.genders.includes(profile.gender2))
        if (!hasMatchingGender) return false
      }

      // Filter by orientation preferences
      if (prefs.orientations.length > 0) {
        const hasMatchingOrientation = 
          prefs.orientations.includes(profile.orientation) ||
          (profile.orientation2 && prefs.orientations.includes(profile.orientation2))
        if (!hasMatchingOrientation) return false
      }

      // Filter by experience level
      if (prefs.experienceLevels.length > 0) {
        if (!prefs.experienceLevels.includes(profile.lifestyle_experience)) {
          return false
        }
      }

      return true
    })

    // Calculate match scores based on shared interests and kinks
    const scoredMatches = filteredMatches.map(profile => {
      let score = 0

      // Shared interests
      const sharedInterests = (userProfile.interests || []).filter(
        (interest: string) => (profile.interests || []).includes(interest)
      )
      score += sharedInterests.length * 10

      // Shared kinks
      const sharedKinks = (userProfile.kinks || []).filter(
        (kink: string) => (profile.kinks || []).includes(kink)
      )
      score += sharedKinks.length * 15

      // Boost VIP profiles slightly
      if (profile.membership_tier === 'vip') {
        score += 5
      }

      // Boost verified profiles
      if (profile.is_verified) {
        score += 10
      }

      return {
        ...profile,
        matchScore: score,
        sharedInterests,
        sharedKinks,
      }
    })

    // Sort by match score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore)

    // Limit to top 50 matches
    const topMatches = scoredMatches.slice(0, 50)

    return new Response(
      JSON.stringify({
        matches: topMatches,
        total: topMatches.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
