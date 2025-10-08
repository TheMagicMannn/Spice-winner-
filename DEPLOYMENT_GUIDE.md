# Vercel Deployment Guide for SPI Profile App

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your Supabase project credentials
- Google Gemini API key

## Step 1: Prepare Your Project

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Test Local Build** (Optional but recommended)
   ```bash
   npm run build
   npm run preview
   ```

## Step 2: Set Up Supabase

1. **Create Required Tables**
   
   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     display_name TEXT,
     age INTEGER,
     gender TEXT,
     looking_for TEXT,
     interests TEXT[],
     bio TEXT,
     photos TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view their own profile"
     ON profiles FOR SELECT
     USING (auth.uid() = id);

   CREATE POLICY "Users can update their own profile"
     ON profiles FOR UPDATE
     USING (auth.uid() = id);

   CREATE POLICY "Users can insert their own profile"
     ON profiles FOR INSERT
     WITH CHECK (auth.uid() = id);
   ```

2. **Create Storage Bucket**
   
   In Supabase Dashboard:
   - Go to Storage
   - Create a new bucket named `profile-photos`
   - Make it public
   - Set up policies:
     ```sql
     -- Allow authenticated users to upload
     CREATE POLICY "Users can upload their own photos"
       ON storage.objects FOR INSERT
       WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

     -- Allow public read access
     CREATE POLICY "Public can view photos"
       ON storage.objects FOR SELECT
       USING (bucket_id = 'profile-photos');
     ```

3. **Create Database Trigger for New Users**
   
   ```sql
   -- Function to create profile on signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, display_name, age)
     VALUES (
       NEW.id,
       NEW.raw_user_meta_data->>'display_name',
       (NEW.raw_user_meta_data->>'age')::INTEGER
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger to call function on user creation
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_KEY
   vercel env add API_KEY
   ```
   
   Enter your values when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the framework settings

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (NOT the anon key)
   - `API_KEY`: Your Google Gemini API key

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Step 4: Verify Deployment

1. Visit your deployed URL
2. Test the signup flow
3. Test the login flow
4. Test profile setup
5. Test photo upload
6. Test AI bio generation

## Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Verify Node.js version compatibility
- Check build logs for specific errors

### API Routes Not Working
- Verify environment variables are set correctly
- Check that API routes are in the `/api` directory
- Ensure Supabase credentials are correct

### Authentication Issues
- Verify Supabase URL and keys
- Check that auth is enabled in Supabase
- Ensure email confirmation is configured

### Storage Issues
- Verify storage bucket exists and is public
- Check storage policies are set correctly
- Ensure CORS is configured in Supabase

### AI Bio Generation Fails
- Verify Google Gemini API key is valid
- Check API quota limits
- Review API endpoint URL

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role key (server-side only) | Supabase Dashboard → Settings → API |
| `API_KEY` | Google Gemini API key | Google AI Studio |

## Important Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use service role key for API routes** - Not the anon key
3. **Enable RLS on all tables** - For security
4. **Test locally first** - Before deploying to production
5. **Monitor usage** - Check Supabase and Vercel dashboards regularly

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Review Supabase logs
5. Check API route responses

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure email templates in Supabase
3. Set up monitoring and analytics
4. Implement additional features
5. Optimize performance

---

**Deployment Complete!** 🎉

Your app should now be live at your Vercel URL.