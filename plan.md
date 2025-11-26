# SPICE Profile Setup Overhaul — Plan

Problem: Fix TS build errors and deliver a complete 14-step profile setup for Individual and Couple accounts, preserving existing Role/Kink, Physical Stats, Photos, Match Preferences, and Membership steps. Add backend + DB support for all new fields.

## Objectives
- Resolve all TypeScript errors in Profile Setup and related step files
- Implement full 14-step onboarding for both Individual and Couple accounts (dynamic routing and validation)
- Extend backend API and DB schema to persist new fields (camelCase → snake_case mapping safe)
- Ensure photos upload (min 2) + match preferences + membership selection flows remain intact
- Ship a thoroughly-tested, production-ready flow

## Development Approach
Core-first: Prove core persistence of the enhanced profile in isolation, then build full UI around it. Test incrementally and fix until green.

## Phase 1 — Core POC (Isolation)
Core = Ability to save a complete enhanced profile (including accountType, context, lifestyle, structures, seeking, who-to-meet) for both Individual and Couple.

Scope
- DB: Apply missing columns using existing SQLs
  - PROFILE_SETUP_ENHANCED_SCHEMA.sql
  - COMPREHENSIVE_3_ACCOUNT_TYPES_SCHEMA.sql
- API: Ensure /api/profile accepts enhanced payload and updates profiles row for current user
- Mapping: Implement safe camelCase → snake_case transformer before DB update
- Storage check: Confirm public bucket `profile-photos` exists (from schema) and simple upload works via Supabase Storage

POC Test (single script covering all) — test_core.ts (HTTP-based)
- Test 1: Auth token validation (rejects without token)
- Test 2: POST /api/profile (Individual) with minimal required enhanced fields → 200 OK
- Test 3: POST /api/profile (Couple) with partner fields → 200 OK
- Test 4: Upload 1 small image to `profile-photos` via signed URL or storage client (basic success)

Success Gate (must pass before Phase 2)
- All 4 tests pass consistently
- DB row updated with enhanced fields visible in Supabase

User Stories (POC)
1) As a user, I can save my Individual profile core data successfully.
2) As a couple, we can save both partners’ core data successfully.
3) As any user, I cannot update profile without being authenticated.
4) As a user, I can upload a profile photo to the proper bucket.
5) As a user, I see a clear error if saving fails.

## Phase 2 — App Development (Complete 13-step Flow) ✅ COMPLETED
Front-end: Updated src/pages/ProfileSetup.tsx to implement refined 13-step workflow with dynamic routing and validations.

**REFINEMENTS COMPLETED:**
- Added experience level slider (Curious → Living it 24/7) for each selected lifestyle identity in Step 3
- Removed old Step 9 (Role & Kink Preferences) 
- Steps renumbered: old 10-13 are now 9-12
- Removed questions: Barrier Methods, Fluid Bonding, Risk Profile, Discretion Needs, "Who knows about lifestyle"
- Updated Lifestyle Identity options: BDSM/Kink, Swinger, ENM, Polyamory, Fetish, Vanilla but Curious, Exploring/Not Sure Yet, Other

Step Map (Individual & Couples share numbering; conditional rendering)
0) Account Type selection (Individual | Couple)
1) Basic Info (name(s), location, gender(s), sexuality(ies), DOB/Age, relationship status)
2) Relationship Context (+ partner alignment for Partnered/Solo Poly/Polycule, consent toggle for Married Solo)
3) Lifestyle Identity (BDSM/Kink, Swinger, ENM, Polyamory, Fetish, Vanilla but Curious, Exploring, Other — multi-select) + Experience Level Sliders ✨NEW
4) Deep Relationship Structure (Adaptive)
   - If ENM/Poly → structure options
   - If Swinger → swinger structure
   - If BDSM → BDSM roles
5) Intent (re-weight emphasis based on lifestyle choices)
6) Boundaries (meeting types, environments; if BDSM → negotiation comfort; if Poly → autonomy level)
7) What You’re Seeking (enhanced list; if “Poly expansion” → preferred poly role)
8) Who You Want to Meet (Singles/Couples/Groups/Polycules/Event hosts)
   - Singles → gender list
   - Couples → couple type + interaction style (+ genders if “one partner only”)
   - Groups → group type(s)
   - Polycules → structure preferences
9) Role & Kink Preferences (KEEP existing UI — Individual vs Partners)
10) About Me/Us + Physical & Lifestyle Stats (KEEP existing)
11) Photos (2–10 required min 2; KEEP existing; verify preview + removal)
12) Match Preferences (KEEP existing; genders/sexualities/distance/experience/vip/verified)
13) Membership (Basic/VIP — KEEP existing)

Type & Validation Work
- Update src/types.ts Profile to include all fields referenced by steps (add missing: personalityTraits, hairLength, fitnessLevel, lifestyleActivities, tryingInterests, referenceWillingness, energyLevel, hasMetamours, metamourRelationship, parallelDating, escalatorInterests, etc.)
- Fix all compile errors in Step* components (adjust option types and handlers)
- Centralize toggle handlers for arrays with max limits & error messaging
- Ensure strong per-step canProceed() validation

Backend
- /api/profile: add camelCase → snake_case transform; whitelist/save only allowed keys
- Ensure storage public URL retrieval for photo uploads remains consistent

UX & Design
- Keep existing styling; add loading/disabled states; show validation errors
- Persist draft to localStorage to guard against loss (optional fast-follow)

User Stories (Phase 2)
1) As an individual, I can complete all steps and submit successfully.
2) As a couple, I can enter both partners’ details and submit successfully.
3) As a user who selects Swinger, I’m prompted with swinger-specific structure options in Step 4.
4) As a user who selects Couples in Step 8, I must choose couple type and interaction style before continuing.
5) As a user, I can’t proceed from Photos unless I have at least 2 images with previews.
6) As a user, I get clear validation for DOB (MM/DD/YYYY; 18–99).
7) As a user, I can take the Kink Quiz and see role suggestions.
8) As a user, my match preferences are saved and later used for matching.

## Phase 3 — Backend & Database Hardening
- Apply SQL migrations (idempotent) from repo (PROFILE_SETUP_ENHANCED_SCHEMA.sql, COMPREHENSIVE_3_ACCOUNT_TYPES_SCHEMA.sql)
- Add missing columns for any newly introduced fields
- Ensure RLS policies and storage policies cover new flows
- Extend /api/profile to sanitize payload and update setup_step_completed, profile_completion_percentage via DB triggers

User Stories (Phase 3)
1) As a user, my enhanced fields are persisted and retrievable.
2) As a user, my profile completion percentage updates when I edit my profile.
3) As a user, I can view my verification status later (foundation laid by schema).
4) As a user, my photos respect privacy settings as designed.
5) As a user, my couple data is stored coherently (partner1/partner2 fields).

## Phase 4 — Testing & Stabilization
- Lint TypeScript, fix all compile errors
- Use Testing Agent to run E2E onboarding for Individual and Couple with conditional branches (skip camera/drag-and-drop)
- Verify dynamic routing paths (Swinger/Poly/BDSM; Singles/Couples/Groups/Polycules)
- Validate error states, loading states, uploaded image preview

Success Criteria
- TypeScript builds cleanly (0 errors)
- Both account types fully complete the 14-step flow and submit
- /api/profile persists all enhanced fields (visible in DB)
- Photos upload and display successfully; min 2 enforced
- Match preferences and membership stored as expected
- Testing agent scenarios pass for both flows; no red screen errors

## Next Actions
1) Phase 1: Implement camelCase → snake_case transformer, ensure /api/profile saves enhanced payload; run core tests
2) Update src/types.ts with all missing fields to eliminate current TS errors
3) Phase 2: Finalize 14-step ProfileSetup.tsx (conditional steps + validation), keep existing steps 9–13 intact
4) Phase 3: Apply SQL migrations; extend API; confirm RLS/storage policies
5) Phase 4: Run Testing Agent; address all issues until green
