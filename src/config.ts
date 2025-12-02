// IMPORTANT: Replace with your actual Supabase project URL and anon key.
// The placeholder values below are syntactically valid to prevent the app from crashing on startup.
export const supabaseUrl = 'https://cbefwjwqworwfctadogk.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZWZ3andxd29yd2ZjdGFkb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTI1OTksImV4cCI6MjA3NTQ2ODU5OX0.lk6GS56tP2HS7b6cIJpnj04gf7146e8h2mZwoE4gbQw';

// App configuration
export const appConfig = {
  name: 'SPICE',
  version: '1.0.0',
  deepLinkScheme: 'spice',
};

// API endpoints
export const api = {
  supabaseUrl,
  supabaseAnonKey,
};

// Feature flags
export const features = {
  notifications: true,
  voiceMessages: true,
  videoCalls: false,
  stories: false,
};

// Default settings
export const defaults = {
  maxPhotos: 10,
  maxBioLength: 500,
  maxMessageLength: 1000,
  minAge: 18,
  maxAge: 100,
  defaultLocationRadius: 50, // miles
};