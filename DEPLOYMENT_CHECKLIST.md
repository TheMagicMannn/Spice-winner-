# 🚀 Complete Deployment Checklist

## Phase 1: Database Setup ✅

### Step 1: Run SQL Setup Script
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy contents of `/SUPABASE_COMPLETE_SETUP.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify completion message appears
- [ ] Check all 7 tables created successfully

### Step 2: Verify Database Schema
- [ ] Go to Table Editor
- [ ] Confirm `profiles` table uses snake_case columns
- [ ] Verify `match_preferences` column is JSONB type
- [ ] Check RLS is enabled on all tables
- [ ] Verify indexes are created

### Step 3: Verify Storage Buckets
- [ ] Go to Storage
- [ ] Confirm `profile-photos` bucket exists (public)
- [ ] Confirm `event-photos` bucket exists (public)
- [ ] Confirm `message-attachments` bucket exists (private)
- [ ] Test upload to `profile-photos` bucket

---

## Phase 2: Frontend Configuration ✅

### Step 1: Verify Transformation Layer
- [ ] Check `/src/utils/transformers.ts` exists
- [ ] Verify TypeScript compiles: `yarn tsc --noEmit`
- [ ] Review transformation logic for correctness

### Step 2: Update Environment Variables
- [ ] Check `/src/config.ts` has correct Supabase URL
- [ ] Verify Supabase anon key is set
- [ ] Ensure no hardcoded URLs in code

### Step 3: Test Profile Setup Flow
- [ ] Run app locally or in preview
- [ ] Complete profile setup form
- [ ] Check browser console for transformation logs:
  - `🔄 Transforming profile data for database...`
  - `✅ Profile data validation passed`
  - `✅ Profile saved successfully`
- [ ] Verify profile appears in Supabase Table Editor
- [ ] Confirm data is in snake_case in database

---

## Phase 3: Edge Functions (Optional) ⚡

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Deploy Functions
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref YOUR_REF`
- [ ] Deploy matching function:
  ```bash
  supabase functions deploy get-potential-matches
  ```
- [ ] Deploy cleanup function:
  ```bash
  supabase functions deploy cleanup-expired-memberships
  ```

### Step 3: Configure Secrets
- [ ] Set cron secret:
  ```bash
  supabase secrets set CRON_SECRET=your_secret_here
  ```

### Step 4: Setup Cron Jobs
- [ ] Configure daily membership cleanup
- [ ] Test cron job executes successfully
- [ ] Verify expired memberships are downgraded

---

## Phase 4: Testing 🧪

### Database Tests
- [ ] Create individual profile
- [ ] Create couple profile
- [ ] Upload profile photos
- [ ] Update existing profile
- [ ] Verify RLS policies work (can't access other users' data)

### Frontend Tests
- [ ] Sign up new user
- [ ] Complete profile setup
- [ ] Upload 2+ photos
- [ ] Save profile successfully
- [ ] Fetch profile data
- [ ] Verify data displays correctly

### Integration Tests
- [ ] camelCase → snake_case transformation works
- [ ] `sexualities` → `orientations` mapping correct
- [ ] Photos upload to correct path: `{userId}/filename`
- [ ] Match preferences save correctly
- [ ] Arrays (seeking, interests, kinks) save correctly

### Edge Function Tests
- [ ] Call `get-potential-matches` endpoint
- [ ] Verify matches returned
- [ ] Check match scores calculated
- [ ] Test with different preferences

---

## Phase 5: Security Verification 🔒

### RLS Policy Checks
- [ ] Users can only view their own profile
- [ ] Users can only edit their own profile
- [ ] Users can view other active, completed profiles
- [ ] Users can only upload photos to their own folder
- [ ] Users can only message matched profiles
- [ ] VIP-only events hidden from basic users

### Authentication Tests
- [ ] Sign up works
- [ ] Login works
- [ ] Profile auto-created on signup
- [ ] JWT tokens work with API calls
- [ ] Logout works correctly

### Data Validation
- [ ] Age must be ≥ 18
- [ ] Bio must be 69-1000 characters
- [ ] Photos limited to 10
- [ ] Required fields enforced

---

## Phase 6: Performance Optimization ⚡

### Database Indexes
- [ ] Verify indexes created (check setup script output)
- [ ] Test query performance on large datasets
- [ ] Monitor slow queries in Supabase Dashboard

### Frontend Performance
- [ ] Images optimized for web
- [ ] Lazy loading implemented
- [ ] API calls minimized
- [ ] Caching strategy in place

---

## Phase 7: Monitoring & Logging 📊

### Setup Monitoring
- [ ] Enable Supabase Dashboard → Logs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics (optional)

### Test Logging
- [ ] Check transformation logs in browser console
- [ ] Verify database query logs in Supabase
- [ ] Test error logging (trigger intentional error)

---

## Phase 8: Production Deployment 🌐

### Pre-Deployment
- [ ] Run full test suite
- [ ] Check for TypeScript errors: `yarn tsc --noEmit`
- [ ] Review all environment variables
- [ ] Backup database (if migrating)

### Deploy Frontend
- [ ] Build production bundle: `yarn build`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Test production URL
- [ ] Verify API calls work in production

### Post-Deployment
- [ ] Test full user journey in production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify SSL/HTTPS working

---

## Phase 9: Documentation 📚

### User Documentation
- [ ] Create user guide for profile setup
- [ ] Document matching algorithm
- [ ] Explain VIP features
- [ ] Safety guidelines

### Developer Documentation
- [ ] API documentation
- [ ] Schema documentation (already created!)
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## Phase 10: Maintenance 🔧

### Regular Tasks
- [ ] Monitor membership expirations
- [ ] Review user reports
- [ ] Check storage usage
- [ ] Update dependencies
- [ ] Backup database regularly

### Monthly Tasks
- [ ] Review analytics
- [ ] Optimize slow queries
- [ ] Clean up old data
- [ ] Update documentation

---

## 🎯 Quick Verification Commands

### Check TypeScript Compilation
```bash
cd /app && yarn tsc --noEmit
```

### Test Transformation Function
```bash
cd /app && node -r esbuild-register src/utils/transformers.test.ts
```

### Check Supabase Connection
```bash
supabase status
```

---

## 📋 Common Issues & Solutions

### Issue: Profile not saving
**Check:**
1. Browser console for transformation logs
2. Supabase Dashboard → Logs → API
3. RLS policies enabled
4. Required fields filled

**Solution:**
- Review `/src/hooks/useProfile.ts` transformation
- Verify validation passes
- Check field names match schema

### Issue: Photos not uploading
**Check:**
1. Storage bucket exists
2. File path: `{userId}/{filename}`
3. User authenticated
4. File size limits

**Solution:**
- Verify storage policies in Supabase
- Check Authorization header
- Test with smaller file

### Issue: Matches not working
**Check:**
1. Both profiles completed
2. Profiles are active
3. Match preferences set
4. RLS policies correct

**Solution:**
- Deploy edge function for advanced matching
- Check match_preferences JSONB structure
- Verify filters applied correctly

---

## ✅ Final Checklist

Before going live:

- [ ] All database tables created ✅
- [ ] RLS policies enabled ✅
- [ ] Storage buckets configured ✅
- [ ] Transformation layer working ✅
- [ ] TypeScript compiles without errors ✅
- [ ] Profile creation tested ✅
- [ ] Photo uploads working ✅
- [ ] Edge functions deployed (optional) ⚡
- [ ] Security verified ✅
- [ ] Performance optimized ✅
- [ ] Monitoring enabled ✅
- [ ] Documentation complete ✅

---

## 🎉 You're Ready to Launch!

Your Supabase database is properly configured with:
- ✅ Correct snake_case schema
- ✅ Comprehensive RLS policies
- ✅ Automatic triggers
- ✅ Storage buckets with policies
- ✅ Frontend transformation layer
- ✅ Edge functions (optional)

Everything is aligned and ready for production! 🚀

---

## 📞 Support Resources

- **Schema Documentation**: `/SCHEMA_FIX_DOCUMENTATION.md`
- **Setup Guide**: `/SUPABASE_SETUP_GUIDE.md`
- **Quick Summary**: `/SCHEMA_FIX_SUMMARY.md`
- **SQL Script**: `/SUPABASE_COMPLETE_SETUP.sql`
- **Edge Functions**: `/supabase/functions/README.md`

Need help? Review these documents for detailed explanations and troubleshooting steps.
