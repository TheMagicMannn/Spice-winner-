# Fix Summary: Display Names & Group Chat Navigation

## Issues Found

1. **Profiles showing "Unknown" for group participants**
   - Profile data is loaded but displayName might be NULL/undefined in database
   - Need to add fallback to other name fields

2. **Direct chats showing "User"**
   - Same issue - displayName is NULL

3. **Group chat creation redirects to community page**
   - Navigation path might be wrong or route not matching

## Solutions

### 1. Update profile fallback logic
Use multiple fallback fields:
- displayName → firstName + lastName → email prefix → "User"

### 2. Check database for NULL displayNames
Query: SELECT id, display_name, email FROM profiles WHERE display_name IS NULL;

### 3. Fix navigation path
Check if route expects `/chat/:id` or `/chat/:id/group`
