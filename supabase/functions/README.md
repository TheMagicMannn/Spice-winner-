# Supabase Edge Functions

This directory contains Supabase Edge Functions for advanced server-side operations.

## 📁 Available Functions

### 1. `get-potential-matches`
Advanced matching algorithm that finds compatible profiles based on preferences.

**Features:**
- ✅ Filters by age, gender, orientation, account type
- ✅ Excludes already matched users
- ✅ Calculates match scores based on shared interests/kinks
- ✅ Respects VIP-only and verified-only preferences
- ✅ Returns top 50 matches sorted by compatibility

**Usage:**
```typescript
const response = await fetch(
  'https://YOUR_PROJECT.supabase.co/functions/v1/get-potential-matches',
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  }
);

const { matches, total } = await response.json();
```

### 2. `cleanup-expired-memberships`
Automated task to downgrade expired VIP memberships.

**Features:**
- ✅ Finds all expired VIP memberships
- ✅ Downgrades to basic tier automatically
- ✅ Updates subscription status to 'expired'
- ✅ Designed to run on a schedule (cron)

**Usage:**
This function should be called periodically via cron or webhook.

---

## 🚀 Deployment

### Prerequisites
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Functions

Deploy individual function:
```bash
supabase functions deploy get-potential-matches
```

Deploy all functions:
```bash
supabase functions deploy
```

### Set Environment Variables

For the cleanup function, set a cron secret:
```bash
supabase secrets set CRON_SECRET=your_secret_key_here
```

---

## ⏰ Scheduling Functions

### Setup Cron for Membership Cleanup

Using Supabase Cron (requires Enterprise plan):
```sql
SELECT cron.schedule(
  'cleanup-expired-memberships',
  '0 0 * * *', -- Run daily at midnight
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/cleanup-expired-memberships',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
    ) AS request_id;
  $$
);
```

Alternative: Use external cron service:
- [GitHub Actions](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Vercel Cron](https://vercel.com/docs/cron-jobs)
- [EasyCron](https://www.easycron.com/)

---

## 🧪 Testing Functions Locally

### Start local Supabase:
```bash
supabase start
```

### Serve functions locally:
```bash
supabase functions serve
```

### Test with curl:
```bash
# Test get-potential-matches
curl -i --location --request POST 'http://localhost:54321/functions/v1/get-potential-matches' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'

# Test cleanup-expired-memberships
curl -i --location --request POST 'http://localhost:54321/functions/v1/cleanup-expired-memberships' \
  --header 'Authorization: Bearer YOUR_CRON_SECRET'
```

---

## 📊 Function Details

### Get Potential Matches - Algorithm

**Matching Score Calculation:**
- Shared interests: +10 points each
- Shared kinks: +15 points each
- VIP member: +5 points
- Verified profile: +10 points

**Filters Applied (in order):**
1. Profile must be active and completed
2. Age within user's preferred range
3. Account type matches search criteria
4. Gender matches preferences
5. Orientation matches preferences
6. Experience level matches preferences
7. Not already matched
8. VIP-only filter (if enabled)
9. Verified-only filter (if enabled)

**Returns:**
```typescript
{
  matches: [
    {
      id: string,
      display_name: string,
      display_name2?: string,
      account_type: 'individual' | 'couple',
      age: number,
      age2?: number,
      gender: string,
      gender2?: string,
      orientation: string,
      orientation2?: string,
      location: string,
      photos: string[],
      bio: string,
      interests: string[],
      kinks: string[],
      lifestyle_experience: string,
      membership_tier: 'basic' | 'vip',
      is_verified: boolean,
      matchScore: number,
      sharedInterests: string[],
      sharedKinks: string[]
    }
  ],
  total: number
}
```

### Cleanup Expired Memberships - Process

**Steps:**
1. Query all profiles with `membership_tier = 'vip'` and `membership_expires_at < NOW()`
2. Update profiles:
   - Set `membership_tier` to `'basic'`
   - Set `membership_expires_at` to `NULL`
3. Update subscriptions:
   - Set `status` to `'expired'`
4. Log results

**Returns:**
```typescript
{
  message: string,
  count: number,
  profiles: [
    {
      id: string,
      display_name: string
    }
  ]
}
```

---

## 🔒 Security

### Authentication
- **get-potential-matches**: Requires valid user JWT token
- **cleanup-expired-memberships**: Requires cron secret or service role key

### RLS Bypass
The cleanup function uses the service role key to bypass RLS policies. This is necessary to update profiles in batch.

### Best Practices
- Never expose service role key in frontend code
- Store secrets in Supabase Secrets (not in code)
- Use HTTPS for all function calls
- Validate all inputs in functions

---

## 📝 Creating New Functions

### Template
```bash
supabase functions new your-function-name
```

### Basic Structure
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Your logic here

    return new Response(
      JSON.stringify({ success: true }),
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
```

---

## 🐛 Debugging

### View Function Logs
```bash
supabase functions logs get-potential-matches
```

### Enable Detailed Logging
Add console.log statements in your function code. They'll appear in the logs.

### Common Issues

**Issue: "Function not found"**
- Make sure function is deployed
- Check function name matches exactly

**Issue: "Unauthorized"**
- Verify JWT token is valid
- Check Authorization header format: `Bearer <token>`

**Issue: "Timeout"**
- Edge functions have 60s timeout
- Optimize queries or split into smaller operations

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy)
- [CORS Configuration](https://supabase.com/docs/guides/functions/cors)

---

## 💡 Function Ideas

Other functions you might want to create:

1. **send-match-notification** - Send push notification when users match
2. **generate-ai-bio** - Use AI to generate profile bio
3. **verify-profile-photo** - Use AI to verify photos are appropriate
4. **calculate-compatibility** - Deep compatibility analysis
5. **send-daily-matches** - Email daily match suggestions
6. **analytics-tracker** - Track user behavior for insights
7. **content-moderation** - Moderate user-generated content

---

## ✅ Checklist

Before deploying to production:

- [ ] Test functions locally
- [ ] Set up all required secrets
- [ ] Configure CORS if needed
- [ ] Set up monitoring/logging
- [ ] Schedule cron jobs
- [ ] Document API endpoints
- [ ] Test error handling
- [ ] Implement rate limiting (if needed)

---

## 🎉 You're Ready!

Your edge functions are set up and ready to deploy. These provide powerful server-side capabilities that enhance your dating app with advanced matching and automated maintenance.
