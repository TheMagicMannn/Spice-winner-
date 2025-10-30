# Media Upload Fix Guide

## Issue
Video uploads were failing with 400 Bad Request errors due to:
1. **File size too large** - 123MB video exceeds Supabase limits
2. **Missing storage bucket** - message-attachments bucket not properly configured
3. **Missing RLS policies** - Storage policies not set up

## Solutions Implemented

### 1. Storage Bucket Configuration
**File:** `/app/STORAGE_BUCKET_SETUP.sql`

Run this SQL in Supabase to:
- Create `message-attachments` bucket (private)
- Set 50MB file size limit
- Configure allowed MIME types (images, videos, audio)
- Set up RLS policies for upload/view/delete

**Execute in Supabase SQL Editor:**
```sql
-- See STORAGE_BUCKET_SETUP.sql for full script
```

### 2. Client-Side File Size Validation
**Updated:** `/app/src/components/ChatModal.tsx`

Added file size limits:
- **Images:** 10MB max
- **Videos:** 50MB max  
- **Voice:** 5MB max

User sees error message immediately if file exceeds limit.

### 3. Better Error Handling
**Updated:** `/app/src/services/messageService.ts`

Enhanced error messages:
- "File is too large" - Clear size limit information
- "Permission denied" - Policy issues
- "File type not supported" - MIME type issues

## File Size Recommendations

### For Users:
- **Photos:** Compress before sending (recommended < 5MB)
- **Videos:** Keep under 30 seconds or compress (recommended < 25MB)
- **Voice notes:** Typically under 1MB

### Technical Limits:
```typescript
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024,  // 50MB
  voice: 5 * 1024 * 1024    // 5MB
}
```

## Storage Policies Explained

### Upload Policy
Users can only upload to their own folder:
```
/message-attachments/{user_id}/{match_id}/{filename}
```

### View Policy
Users can view media if:
1. They uploaded it themselves, OR
2. They have a matched conversation with the uploader

### Delete Policy
Users can only delete their own uploads

## Supabase Storage Limits

### Free Tier:
- **Storage:** 1GB total
- **File size:** Up to 50MB per file
- **Bandwidth:** 2GB/month

### Pro Tier:
- **Storage:** 100GB included
- **File size:** Up to 5GB per file
- **Bandwidth:** 250GB/month

## How to Run Setup

### Step 1: Execute Storage Setup SQL
```bash
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of STORAGE_BUCKET_SETUP.sql
4. Run the script
5. Verify success message appears
```

### Step 2: Verify Bucket Creation
```bash
1. Go to Storage in Supabase Dashboard
2. Check that 'message-attachments' bucket exists
3. Verify it shows as "Private"
4. Check file size limit is 50MB
```

### Step 3: Test Upload
```bash
1. Try uploading a small image (< 5MB)
2. Try uploading a video (< 25MB)
3. Verify uploads succeed
4. Check files appear in storage bucket
```

## Troubleshooting

### Error: "File is too large"
**Solution:** 
- Compress the video before uploading
- Use video compression tools or apps
- Keep videos under 30 seconds

### Error: "You do not have permission"
**Solution:**
- Run STORAGE_BUCKET_SETUP.sql to create policies
- Ensure user is authenticated
- Check that match exists and status is 'matched'

### Error: "File type not supported"
**Solution:**
- Use supported formats:
  - Images: JPG, PNG, GIF, WebP
  - Videos: MP4, MOV, WebM
  - Audio: WebM, MP3, WAV

### Videos not playing
**Solution:**
- Ensure video is in MP4 format (H.264 codec)
- MOV files may not play in all browsers
- Convert to MP4 using video conversion tools

### Storage quota exceeded
**Solution:**
- Check Supabase Dashboard → Storage → Usage
- Clean up old/expired media files
- Consider upgrading to Pro tier
- Implement automatic cleanup of expired self-destruct media

## Optional: Video Compression

For better user experience, consider adding client-side video compression:

```typescript
// Example using browser-image-compression library
import imageCompression from 'browser-image-compression';

const compressVideo = async (file: File) => {
  const options = {
    maxSizeMB: 25,
    maxWidthOrHeight: 1280,
    useWebWorker: true
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file;
  }
};
```

## Monitoring Storage Usage

### Check Usage:
1. Supabase Dashboard → Settings → Usage
2. Monitor storage and bandwidth
3. Set up alerts for approaching limits

### Cleanup Strategy:
1. Implement cron job to delete expired media
2. Remove messages older than 90 days
3. Compress older videos to lower quality

## Support

If you continue to experience upload issues:
1. Check browser console for detailed error messages
2. Verify RLS policies are active
3. Test with smaller files first
4. Contact Supabase support for storage issues
