# 📱 SPICE Mobile App - Quick Start Guide

## ✅ Setup Complete!

Your SPICE dating app is now configured for iOS and Android deployment.

---

## 🚀 Quick Commands

### Development
```bash
# Build web app and sync to mobile
npm run cap:sync

# Open iOS in Xcode (macOS only)
npm run cap:ios

# Open Android in Android Studio
npm run cap:android
```

### Testing on Devices

**iOS:**
1. `npm run cap:sync`
2. `npm run cap:ios`
3. Select device/simulator in Xcode
4. Click Run ▶️

**Android:**
1. `npm run cap:sync`
2. `npm run cap:android`
3. Select device/emulator in Android Studio
4. Click Run ▶️

---

## 📦 What's Installed

### Platforms
- ✅ iOS native project (`/ios`)
- ✅ Android native project (`/android`)

### Plugins
- 📷 Camera (photo uploads)
- 📍 Geolocation (location-based matching)
- 🔔 Push Notifications
- 💾 Filesystem
- 📱 App lifecycle
- 🎨 Splash screen
- ⚡ Status bar
- ⌨️ Keyboard

### Permissions Configured
- ✅ Camera & Photo Library
- ✅ Location Services
- ✅ Push Notifications
- ✅ File Access
- ✅ Network Access

---

## 💻 Using Mobile Features in Code

### Import Services
```typescript
import { 
  cameraService, 
  geolocationService,
  isNative,
  getPlatform 
} from './services/capacitor';
```

### Check if Running on Mobile
```typescript
if (isNative()) {
  console.log('Platform:', getPlatform()); // 'ios' or 'android'
}
```

### Take/Select Photos
```typescript
// Take photo with camera
const photo = await cameraService.takePhoto();

// Select from gallery
const photo = await cameraService.selectPhoto();

// Select multiple photos
const photos = await cameraService.selectMultiplePhotos();
```

### Get User Location
```typescript
// Request permission
const granted = await geolocationService.requestPermissions();

// Get position
const position = await geolocationService.getCurrentPosition();
if (position) {
  console.log(position.lat, position.lng);
}
```

---

## 🎨 App Icons & Splash Screens

### Quick Setup (Recommended)
```bash
# 1. Install asset generator
npm install -g @capacitor/assets

# 2. Create assets
# - Place 1024x1024 icon: /resources/icon.png
# - Place 2732x2732 splash: /resources/splash.png

# 3. Generate all sizes
npx capacitor-assets generate
```

---

## 📱 App Information

- **App Name:** SPICE Dating
- **Bundle ID:** com.spice.dating
- **iOS Bundle:** com.spice.dating
- **Android Package:** com.spice.dating

---

## 🔧 Common Tasks

### Rebuild and Sync
```bash
npm run build && npx cap sync
```

### Update Plugins
```bash
npx cap update
```

### Clean Build
```bash
# iOS
cd ios/App && pod cache clean --all && pod install

# Android
cd android && ./gradlew clean
```

---

## 🚢 Production Build

### iOS
1. Open Xcode: `npm run cap:ios`
2. Product → Archive
3. Distribute to App Store

### Android
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📚 Documentation

Full guide: `/app/CAPACITOR_MOBILE_SETUP.md`

Official docs: https://capacitorjs.com/docs

---

## ✨ Key Features Ready

- ✅ Photo upload with camera/gallery
- ✅ Location-based matching
- ✅ Push notifications support
- ✅ Native iOS & Android apps
- ✅ All permissions configured
- ✅ Mobile-optimized UI
- ✅ App lifecycle management

---

## 🎯 Next Steps

1. **Test on devices:**
   - iOS: Connect iPhone, run from Xcode
   - Android: Connect phone or use emulator

2. **Create app icons:**
   - Design 1024x1024 icon
   - Generate with `@capacitor/assets`

3. **Configure for production:**
   - iOS: Apple Developer account
   - Android: Google Play Console account

4. **Submit to stores:**
   - App Store (iOS)
   - Google Play (Android)

---

## 🆘 Need Help?

- Full setup guide: `CAPACITOR_MOBILE_SETUP.md`
- Capacitor docs: https://capacitorjs.com/docs
- Community: https://forum.ionicframework.com/

---

**🎉 Your dating app is ready for mobile!**
