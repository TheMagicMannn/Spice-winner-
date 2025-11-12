-- Try to insert a message directly
INSERT INTO messages (
    match_id,
    sender_id,
    content,
    message_type
) 
SELECT 
    id,
    '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6',
    'Direct test',
    'text'
FROM matches
WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
LIMIT 1
RETURNING id, match_id, sender_id, content, created_at;
