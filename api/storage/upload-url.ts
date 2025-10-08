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

    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const filePath = `${user.id}/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(filePath, 60, { upsert: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return res.status(200).json({ signedUrl: data.signedUrl, publicUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}