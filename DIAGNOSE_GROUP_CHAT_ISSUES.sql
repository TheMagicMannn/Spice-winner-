-- =====================================================
-- DIAGNOSTIC QUERIES FOR GROUP CHAT ISSUES
-- =====================================================
-- Run these queries to diagnose 403 errors and other issues
-- Replace the placeholder IDs with actual values from your error logs
-- =====================================================

-- ============================================
-- CONFIGURATION
-- ============================================
-- Replace these with actual IDs from your logs:
-- conversation_id or match_id: 598ddbfb-0027-4773-bfe7-5317bd5bc85e
-- user_id: 9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6

-- ============================================
-- 1. CHECK IF TABLES EXIST
-- ============================================
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✓ Exists'
        ELSE '✗ Missing'
    END as status
FROM (
    VALUES 
        ('messages'),
        ('conversations'),
        ('conversation_participants'),
        ('matches')
) AS expected_tables(table_name);

-- ============================================
-- 2. CHECK MESSAGES TABLE COLUMNS
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('id', 'match_id', 'conversation_id', 'sender_id', 'content', 'is_deleted')
ORDER BY ordinal_position;

-- ============================================
-- 3. CHECK RLS POLICIES ON MESSAGES
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename IN ('messages', 'conversations', 'conversation_participants')
ORDER BY tablename, policyname;

-- ============================================
-- 4. CHECK SPECIFIC CONVERSATION (REPLACE ID)
-- ============================================
-- Replace 'YOUR_CONVERSATION_ID' with actual ID
SELECT 
    c.id,
    c.conversation_type,
    c.group_name,
    c.created_by,
    c.created_at,
    COUNT(cp.id) as participant_count
FROM conversations c
LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id
WHERE c.id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE THIS
GROUP BY c.id, c.conversation_type, c.group_name, c.created_by, c.created_at;

-- ============================================
-- 5. CHECK PARTICIPANTS IN CONVERSATION
-- ============================================
-- Replace 'YOUR_CONVERSATION_ID' with actual ID
SELECT 
    cp.id as participant_record_id,
    cp.user_id,
    cp.is_admin,
    cp.is_active,
    cp.is_deleted,
    cp.joined_at,
    cp.deleted_at,
    p.display_name as user_name,
    p.email
FROM conversation_participants cp
LEFT JOIN profiles p ON p.id = cp.user_id
WHERE cp.conversation_id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE THIS
ORDER BY cp.joined_at;

-- ============================================
-- 6. CHECK IF USER IS A PARTICIPANT
-- ============================================
-- Replace with actual conversation_id and user_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE
            AND user_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6' -- REPLACE
            AND is_active = true
            AND is_deleted = false
        ) THEN '✓ User IS a valid participant'
        ELSE '✗ User is NOT a valid participant (or is_deleted=true)'
    END as participation_status;

-- ============================================
-- 7. CHECK MESSAGES IN CONVERSATION
-- ============================================
-- Replace 'YOUR_CONVERSATION_ID' with actual ID
SELECT 
    m.id,
    m.conversation_id,
    m.match_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.is_deleted,
    m.created_at,
    p.display_name as sender_name
FROM messages m
LEFT JOIN profiles p ON p.id = m.sender_id
WHERE m.conversation_id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE THIS
OR m.match_id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE THIS
ORDER BY m.created_at DESC
LIMIT 10;

-- ============================================
-- 8. CHECK IF ID IS A MATCH OR CONVERSATION
-- ============================================
-- Replace 'YOUR_ID' with the ID from error logs
SELECT 
    'matches' as table_name,
    id,
    user1_id,
    user2_id,
    status,
    matched_at
FROM matches
WHERE id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE THIS

UNION ALL

SELECT 
    'conversations' as table_name,
    id,
    created_by as user1_id,
    NULL as user2_id,
    conversation_type as status,
    created_at as matched_at
FROM conversations
WHERE id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e'; -- REPLACE THIS

-- ============================================
-- 9. CHECK MATCHES FOR A USER
-- ============================================
-- Replace 'YOUR_USER_ID' with actual user ID
SELECT 
    m.id as match_id,
    m.user1_id,
    m.user2_id,
    m.status,
    m.matched_at,
    p1.display_name as user1_name,
    p2.display_name as user2_name
FROM matches m
LEFT JOIN profiles p1 ON p1.id = m.user1_id
LEFT JOIN profiles p2 ON p2.id = m.user2_id
WHERE (m.user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6' OR m.user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6') -- REPLACE
AND m.status = 'matched'
ORDER BY m.matched_at DESC;

-- ============================================
-- 10. CHECK IF CREATOR MATCHED WITH PARTICIPANTS
-- ============================================
-- Replace IDs below
WITH conversation_info AS (
    SELECT 
        id as conversation_id,
        created_by as creator_id,
        conversation_type
    FROM conversations
    WHERE id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e' -- REPLACE
)
SELECT 
    cp.user_id as participant_id,
    p.display_name as participant_name,
    ci.creator_id,
    creator.display_name as creator_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM matches m
            WHERE m.status = 'matched'
            AND (
                (m.user1_id = ci.creator_id AND m.user2_id = cp.user_id)
                OR
                (m.user1_id = cp.user_id AND m.user2_id = ci.creator_id)
            )
        ) THEN '✓ Matched with creator'
        WHEN cp.user_id = ci.creator_id THEN '✓ Is creator'
        ELSE '✗ NOT matched with creator'
    END as match_status
FROM conversation_participants cp
JOIN conversation_info ci ON ci.conversation_id = cp.conversation_id
LEFT JOIN profiles p ON p.id = cp.user_id
LEFT JOIN profiles creator ON creator.id = ci.creator_id
WHERE cp.conversation_id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e'; -- REPLACE

-- ============================================
-- 11. TEST RLS POLICY AS USER
-- ============================================
-- This simulates what the user sees
-- Replace 'YOUR_USER_ID' with actual user ID
SET LOCAL jwt.claims.sub = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'; -- REPLACE

-- Try to select messages (this is what fails with 403)
SELECT 
    COUNT(*) as message_count,
    'Messages user can see' as description
FROM messages
WHERE conversation_id = '598ddbfb-0027-4773-bfe7-5317bd5bc85e'; -- REPLACE

RESET jwt.claims.sub;

-- ============================================
-- INTERPRETATION GUIDE
-- ============================================
/*
1. If tables don't exist → Run COMPLETE_GROUP_CHAT_IMPLEMENTATION.sql
2. If RLS policies are missing → Run FIX_GROUP_CHAT_RLS_FINAL.sql
3. If user is not a participant → Add user with: 
   INSERT INTO conversation_participants (conversation_id, user_id, is_active, is_deleted)
   VALUES ('conv_id', 'user_id', true, false);
4. If match doesn't exist → Users need to match first
5. If messages have match_id but should have conversation_id → Data migration needed
6. If RLS test returns 0 messages → RLS policies are blocking access → Re-run FIX_GROUP_CHAT_RLS_FINAL.sql
*/
