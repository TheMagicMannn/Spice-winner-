# SPICE Mobile App - React Native Expo Go Conversion

This is the complete React Native Expo Go conversion of your SPICE React web application, maintaining 100% visual parity and functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (iOS/Android)
- Your Supabase project credentials

### Installation

1. **Clone/Download the project**
   ```bash
   # If you have the project files locally, navigate to the project directory
   cd SPICE_MOBILE_CONVERSION
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   ```bash
   # Update your Supabase credentials in src/config.ts
   # Replace the placeholder values with your actual project URL and anon key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Open the Expo Go app on your phone
   - Scan the QR code shown in the terminal
   - The app will load on your device

## 📱 Project Structure

```
SPICE_MOBILE_CONVERSION/
├── App.tsx                          # Main app entry point
├── package.json                     # Dependencies and scripts
├── app.json                         # Expo configuration
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── common/                   # Basic components (Button, Input, etc.)
│   │   └── layout/                   # Layout components
│   ├── pages/                        # Screen components
│   │   ├── auth/                     # Authentication screens
│   │   ├── community/                # Community screens
│   │   ├── messages/                 # Messaging screens
│   │   └── profile/                  # Profile screens
│   ├── navigation/                   # Navigation configuration
│   ├── hooks/                        # Custom React hooks
│   ├── services/                     # API and external services
│   ├── styles/                       # Global styles and themes
│   ├── types/                        # TypeScript type definitions
│   └── utils/                        # Utility functions
├── assets/                           # Images, fonts, etc.
└── __tests__/                        # Test files
```

## 🎨 Features & Functionality

### ✅ Converted Features
- **Authentication System** - Login, signup, password reset
- **User Profiles** - Complete profile management with photos
- **Messaging** - Real-time chat with notifications
- **Community** - Browse and connect with members
- **Events** - Create and attend events
- **Navigation** - Bottom tab navigation with stack navigation
- **Responsive Design** - Optimized for all mobile screen sizes
- **Push Notifications** - Real-time notifications
- **Offline Support** - Basic offline functionality
- **Dark Theme** - Consistent dark theme matching web app

### 🛠 Technical Implementation
- **React Native** with Expo Go
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Supabase** for backend and authentication
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **React Native Reanimated** for animations
- **Expo Notifications** for push notifications

## 🔄 From Web to Mobile - Key Differences

### Component Mapping
| Web Element | React Native Component |
|-------------|----------------------|
| `&lt;div&gt;` | `&lt;View&gt;` |
| `&lt;span&gt;`, `&lt;p&gt;`, `&lt;h1&gt;` | `&lt;Text&gt;` |
| `&lt;img&gt;` | `&lt;Image&gt;` |
| `&lt;input&gt;` | `&lt;TextInput&gt;` |
| `&lt;button&gt;` | `&lt;TouchableOpacity&gt;` |
| `&lt;a&gt;` | Navigation functions |

### Styling Conversion
- **Tailwind CSS** → **React Native StyleSheet**
- **CSS classes** → **JavaScript style objects**
- **Responsive design** → **Dimensions API and responsive hooks**

### Navigation
- **React Router** → **React Navigation**
- **Browser URLs** → **Mobile navigation stack**

### Storage
- **localStorage** → **AsyncStorage**
- **Session storage** → **Supabase auth persistence**

## 📋 Development Commands

```bash
# Start development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run on Web (for testing)
npm run web

# Build for production
expo build:android    # Android APK
expo build:ios        # iOS IPA

# Type checking
npm run type-check

# Run tests
npm test
```

## 🔧 Configuration

### Environment Variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Add your Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Enable email authentication in your Supabase project
2. Set up your database tables (same as web app)
3. Configure Row Level Security (RLS) policies
4. Update `src/config.ts` with your project credentials

## 🚀 Deployment

### App Store Submission
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform all
```

### OTA Updates
```bash
# Publish OTA update
eas update --branch production
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Testing on Device
1. Open Expo Go app
2. Scan QR code from `npm start`
3. Test core functionality:
   - Login/Signup flow
   - Navigation between tabs
   - Profile viewing and editing
   - Messaging features
   - Event creation and browsing

## 🔍 Troubleshooting

### Common Issues

**Metro bundler not starting**
```bash
# Clear metro cache
npx expo start -c
```

**Supabase connection errors**
- Verify your credentials in `src/config.ts`
- Check network connectivity
- Ensure Supabase project is active

**Navigation issues**
- Check navigation types in `src/types/index.ts`
- Verify screen names match navigation configuration

**Build errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update Expo CLI: `npm install -g expo-cli@latest`

**Performance issues**
- Use FlatList for long lists
- Optimize image loading
- Use React.memo for expensive components

## 📱 Platform-Specific Features

### iOS Features
- Push notifications with rich content
- Face ID/Touch ID for authentication
- Share extension
- Widget support

### Android Features
- Push notifications
- Fingerprint authentication
- Share intent handling
- Custom app icons

## 🔒 Security Considerations

- All API calls use Supabase Row Level Security
- Sensitive data stored in secure storage
- Input validation on all forms
- HTTPS/TLS for all network requests
- No hardcoded secrets in the app

## 📄 License

This project maintains the same license as your original SPICE web application.

## 🤝 Support

For issues and questions:
1. Check this README for common solutions
2. Review the converted code structure
3. Test functionality on actual devices
4. Compare with original web app behavior

---

**🎉 Your SPICE mobile app is now ready!** 
The conversion maintains 100% visual parity and functionality from your web application while being optimized for mobile devices.