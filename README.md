# SPI Profile App - Fixed for Vercel Deployment

This is your dating/lifestyle profile app with Supabase authentication, database, and storage integration - now properly configured for Vercel deployment!

## What Was Fixed

### 1. **Build Configuration**
- ✅ Added proper `package.json` with all required dependencies
- ✅ Configured Vite as the build tool for React + TypeScript
- ✅ Set up TypeScript configuration files (`tsconfig.json`, `tsconfig.node.json`)
- ✅ Organized source files into proper `src/` directory structure

### 2. **Vercel API Routes**
- ✅ Converted Express server to Vercel serverless functions
- ✅ Created separate API routes for each endpoint:
  - `/api/auth/signup.ts` - User registration
  - `/api/auth/login.ts` - User authentication
  - `/api/profile.ts` - Profile updates
  - `/api/storage/upload-url.ts` - Photo upload URLs
  - `/api/ai/generate-bio.ts` - AI bio generation

### 3. **Type Definitions**
- ✅ Fixed Profile interface to match all form fields
- ✅ Resolved TypeScript compilation errors
- ✅ Cleaned up unused imports

### 4. **Deployment Files**
- ✅ Updated `vercel.json` with proper configuration
- ✅ Added `.vercelignore` to exclude unnecessary files
- ✅ Created `.gitignore` for version control
- ✅ Added `.env.example` for environment variable reference

## Project Structure

```
Buggg-main/
├── api/                      # Vercel serverless functions
│   ├── auth/
│   │   ├── signup.ts
│   │   └── login.ts
│   ├── profile.ts
│   ├── storage/
│   │   └── upload-url.ts
│   └── ai/
│       └── generate-bio.ts
├── src/                      # React application source
│   ├── components/           # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── services/            # API and Supabase services
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   ├── types.ts             # TypeScript definitions
│   └── config.ts            # Supabase configuration
├── dist/                     # Build output (generated)
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── vercel.json              # Vercel deployment config
└── DEPLOYMENT_GUIDE.md      # Detailed deployment instructions

```

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment to Vercel

Please see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions.

### Quick Deploy Steps:

1. **Set up Supabase** (see DEPLOYMENT_GUIDE.md for SQL scripts)
2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```
3. **Add environment variables in Vercel:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `API_KEY` (Google Gemini)

## Environment Variables

Create a `.env` file (for local development only - never commit this):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
API_KEY=your_google_gemini_api_key
```

For Vercel deployment, add these in the Vercel Dashboard under Settings → Environment Variables.

## Features

- 🔐 User authentication (signup, login, password reset)
- 👤 Comprehensive profile setup
- 📸 Photo upload with Supabase Storage
- 🤖 AI-powered bio generation using Google Gemini
- 💑 Support for both individual and couple accounts
- 🎯 Advanced matching preferences
- 🔒 Row-level security with Supabase

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **AI:** Google Gemini API
- **Deployment:** Vercel

## Important Notes

1. **Service Role Key:** The API routes use the Supabase service role key for admin-level access. Keep this secure and never expose it in client-side code.

2. **Row Level Security:** Make sure to enable RLS on all Supabase tables and set up proper policies (see DEPLOYMENT_GUIDE.md).

3. **Storage Bucket:** The `profile-photos` bucket must be created and configured with proper policies.

4. **Database Trigger:** A trigger must be set up to automatically create profile entries when users sign up.

## Troubleshooting

If you encounter issues:

1. **Build fails:** Check that all dependencies are installed (`npm install`)
2. **API routes not working:** Verify environment variables in Vercel
3. **Authentication issues:** Check Supabase credentials and auth settings
4. **Storage issues:** Verify bucket exists and policies are correct

See DEPLOYMENT_GUIDE.md for detailed troubleshooting steps.

## Support Files

- `V1.sql`, `V2.sql`, `V3.sql` - Database migration scripts
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `.env.example` - Environment variable template

## License

Private project - All rights reserved

---

**Ready to deploy!** Follow the DEPLOYMENT_GUIDE.md for step-by-step instructions.