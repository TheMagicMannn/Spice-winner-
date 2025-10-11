import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! // ✅ use anon key for public auth
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, data } = req.body;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(signUpData);
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
