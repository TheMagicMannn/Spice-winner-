-- =====================================================
-- 🔍 ONE SIMPLE QUERY - Does user have matches?
-- =====================================================

SELECT 
    COUNT(*) AS total_matches,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NO MATCHES FOUND - User needs to create a match first!'
        WHEN COUNT(*) > 0 THEN 'User has ' || COUNT(*) || ' match(es) - should be able to message'
    END AS diagnosis
FROM matches
WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6';
