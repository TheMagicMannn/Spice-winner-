# Voice Message Troubleshooting Guide

## Recent Fixes Applied

✅ **Better Browser Compatibility**
- Now tries multiple audio formats (WebM, OGG, MP4)
- Automatically selects best supported format for your browser

✅ **Improved Error Messages**
- Specific messages for each type of error
- Errors auto-dismiss after 5 seconds

✅ **Enhanced Audio Settings**
- Echo cancellation enabled
- Noise suppression enabled
- Auto gain control enabled

✅ **Better Playback Support**
- Multiple audio source formats
- Wider browser compatibility

## Testing Voice Messages

### Step 1: Check Browser Compatibility
**Supported Browsers:**
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Opera

**Not Supported:**
- ❌ Internet Explorer
- ❌ Very old browser versions

### Step 2: Grant Microphone Permission

**First Time:**
1. Click the microphone icon
2. Browser will show a permission prompt
3. Click "Allow" or "Remember this decision"

**If Blocked:**

**Chrome/Edge:**
1. Click the lock icon in address bar
2. Find "Microphone" setting
3. Change to "Allow"
4. Refresh the page

**Firefox:**
1. Click the lock icon in address bar
2. Click "Connection secure" → "More information"
3. Go to Permissions tab
4. Find "Use the Microphone"
5. Uncheck "Use Default" and select "Allow"
6. Refresh the page

**Safari:**
1. Safari → Settings → Websites → Microphone
2. Find your site
3. Change to "Allow"
4. Refresh the page

### Step 3: Test Recording

1. Click microphone button (should turn red and pulse)
2. You should see "Recording..." text
3. Speak for 2-3 seconds
4. Click microphone button again to stop
5. Voice message should appear with audio player
6. Click play to hear your recording

## Common Errors & Solutions

### Error: "Microphone access denied"
**Cause:** You denied permission or it's blocked in browser settings

**Solution:**
1. Check browser permissions (see Step 2 above)
2. Make sure no other app is using the microphone
3. Try in a private/incognito window (tests if extensions are blocking)

### Error: "No microphone found"
**Cause:** No microphone connected to your device

**Solution:**
1. Check if microphone is plugged in
2. For wireless: check if it's connected
3. For laptops: built-in mic should work automatically
4. Go to System Settings → Sound → Input to verify mic is detected
5. Try another microphone

### Error: "Microphone is already in use"
**Cause:** Another app or browser tab is using the microphone

**Solution:**
1. Close other apps using microphone (Zoom, Skype, etc.)
2. Close other browser tabs with active microphone
3. Restart browser if issue persists
4. On Windows: Task Manager → End any audio-related processes
5. On Mac: Activity Monitor → Force quit audio-related apps

### Error: "Microphone access requires HTTPS"
**Cause:** You're accessing the site over HTTP

**Solution:**
1. Your Vercel deployment should automatically use HTTPS
2. If testing locally, you need HTTPS:
   - Use `ngrok` to create HTTPS tunnel
   - Or use `localhost` (some browsers allow this)
   - Or set up local SSL certificate

### Error: "Could not access microphone"
**Generic error - could be several causes**

**Check:**
1. Browser console (F12) for specific error
2. Try in different browser
3. Restart browser
4. Restart computer
5. Check system audio settings

## Testing Playback

### Voice Message Won't Play?

**Check 1: Browser Console**
- Open DevTools (F12)
- Look for audio-related errors
- 403 error = permission issue (check storage policies)
- 404 error = file not found (check upload succeeded)

**Check 2: Storage URL**
- Right-click the audio player → Inspect
- Find the audio source URL
- Copy and paste in new tab
- Should download or play the audio file
- If error, check Supabase storage bucket permissions

**Check 3: Browser Audio**
- Check system volume
- Check browser isn't muted (right-click browser tab)
- Try playing audio from another website
- Check browser audio permissions

## Advanced Troubleshooting

### Check Microphone in System

**Windows:**
1. Settings → System → Sound → Input
2. Test microphone with "Test your microphone"
3. Adjust volume slider if too quiet

**macOS:**
1. System Settings → Sound → Input
2. Select microphone
3. Watch input level bars while speaking

**Linux:**
1. Settings → Sound → Input
2. Test microphone
3. May need to install audio drivers

### Browser-Specific Issues

**Chrome/Edge:**
- Type `chrome://settings/content/microphone` in address bar
- Check if site is in "Block" list
- Move to "Allow" if needed

**Firefox:**
- Type `about:permissions` in address bar
- Find your site
- Check microphone permission

**Safari:**
- May need to enable "Auto-Play" for audio
- Settings → Websites → Auto-Play
- Change to "Allow All Auto-Play"

### Check Supabase Storage

**Verify Bucket Setup:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM storage.buckets WHERE name = 'message-attachments';
```

**Should return:**
- `public`: false (private bucket)
- `file_size_limit`: 52428800 (50MB)
- Allowed mime types should include audio types

**Check Storage Policies:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM storage.objects WHERE bucket_id = 'message-attachments' LIMIT 5;
```

Should show recent uploads. If empty, uploads are failing.

### Network Issues

**Corporate/School Networks:**
- May block getUserMedia API
- May block WebSocket (needed for realtime)
- Try on mobile data or home network

**VPN:**
- Some VPNs block media APIs
- Try disabling VPN temporarily

**Firewall:**
- Check if firewall is blocking media access
- Add browser exception in firewall settings

## Still Not Working?

### Get Detailed Error Info

Add this to browser console (F12) to see detailed errors:

```javascript
// Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    console.log('Tracks:', stream.getTracks());
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('❌ Microphone error:', error.name, error.message);
  });

// Test MediaRecorder support
console.log('MediaRecorder supported:', typeof MediaRecorder !== 'undefined');
if (typeof MediaRecorder !== 'undefined') {
  console.log('WebM supported:', MediaRecorder.isTypeSupported('audio/webm'));
  console.log('OGG supported:', MediaRecorder.isTypeSupported('audio/ogg'));
  console.log('MP4 supported:', MediaRecorder.isTypeSupported('audio/mp4'));
}
```

### Report Issue

If still having issues, provide:
1. Browser name and version
2. Operating system
3. Exact error message shown
4. Console errors (F12 → Console tab)
5. Network errors (F12 → Network tab, filter by "media")
6. Whether other users can hear your voice messages
7. Whether you can play other users' voice messages

## Tips for Best Results

✅ **Use Chrome or Edge** - best compatibility
✅ **Allow microphone permissions** - don't block
✅ **Good internet connection** - for uploads
✅ **Speak clearly** - close to microphone
✅ **Quiet environment** - for better quality
✅ **Test first** - send test message to yourself
✅ **HTTPS only** - required for microphone access

## Format Support by Browser

| Browser | WebM | OGG | MP4 |
|---------|------|-----|-----|
| Chrome  | ✅   | ✅  | ✅  |
| Firefox | ✅   | ✅  | ❌  |
| Safari  | ❌   | ❌  | ✅  |
| Edge    | ✅   | ✅  | ✅  |

*The app automatically selects the best format for your browser*
