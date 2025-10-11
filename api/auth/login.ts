import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ✅ Use anon key for public login
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in the user
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Return token and basic user info
    return res.status(200).json({
      user: signInData.user,
      session: signInData.session,
      access_token: signInData.session?.access_token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
