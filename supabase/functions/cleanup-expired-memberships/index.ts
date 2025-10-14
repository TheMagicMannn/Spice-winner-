// Supabase Edge Function: Cleanup Expired Memberships
// This function should be called periodically (e.g., via cron job)
// to downgrade expired VIP memberships to basic tier
//
// Deploy command:
// supabase functions deploy cleanup-expired-memberships
//
// Setup cron: https://supabase.com/docs/guides/functions/schedule-functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request is from Supabase (check for cron secret)
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      throw new Error('Unauthorized')
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString()

    // Find all expired VIP memberships
    const { data: expiredProfiles, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('id, display_name, membership_tier, membership_expires_at')
      .eq('membership_tier', 'vip')
      .lt('membership_expires_at', now)

    if (fetchError) throw fetchError

    if (!expiredProfiles || expiredProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No expired memberships found',
          count: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Downgrade all expired memberships to basic
    const { data: updatedProfiles, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        membership_tier: 'basic',
        membership_expires_at: null,
      })
      .in('id', expiredProfiles.map(p => p.id))
      .select()

    if (updateError) throw updateError

    // Also update their subscription status to 'expired'
    const { error: subUpdateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: 'expired',
      })
      .in('user_id', expiredProfiles.map(p => p.id))
      .eq('status', 'active')

    if (subUpdateError) {
      console.error('Error updating subscriptions:', subUpdateError)
      // Don't throw - profiles are already downgraded
    }

    // Log the cleanup
    console.log(`✅ Downgraded ${updatedProfiles?.length || 0} expired VIP memberships`)
    expiredProfiles.forEach(p => {
      console.log(`  - ${p.display_name} (${p.id})`)
    })

    return new Response(
      JSON.stringify({
        message: 'Successfully downgraded expired memberships',
        count: updatedProfiles?.length || 0,
        profiles: updatedProfiles?.map(p => ({
          id: p.id,
          display_name: p.display_name,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in cleanup function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
