import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: `Unauthorized: ${authError?.message}` });
    }

    const { interests } = req.body;
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'Interests array is required.' });
    }

    const prompt = `Based on these interests: ${interests.join(', ')}, write a short, fun, and flirty dating profile bio (2-3 sentences). Be creative and engaging.`;
    
    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate bio');
    }

    const data = await response.json();
    const bio = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate bio';
    
    return res.status(200).json({ bio });
  } catch (error: any) {
    console.error('AI bio generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate bio.' });
  }
}