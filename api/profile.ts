import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Convert camelCase to snake_case for database columns
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Transform profile data from camelCase (frontend) to snake_case (database)
function transformProfileData(data: any): any {
  const transformed: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = toSnakeCase(key);
    
    // Handle special cases
    if (key === 'matchPreferences') {
      // matchPreferences is stored as JSONB in the database
      transformed.match_preferences = value;
    } else if (key === 'kinkQuizResults' || key === 'partner1QuizResults' || key === 'partner2QuizResults') {
      // Quiz results are stored as JSONB
      transformed[snakeKey] = value;
    } else if (Array.isArray(value)) {
      // Arrays are native PostgreSQL arrays
      transformed[snakeKey] = value;
    } else if (typeof value === 'boolean') {
      transformed[snakeKey] = value;
    } else if (typeof value === 'number') {
      transformed[snakeKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Objects are stored as JSONB
      transformed[snakeKey] = value;
    } else {
      transformed[snakeKey] = value;
    }
  }
  
  return transformed;
}

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

    const profileData = req.body;
    
    // Transform camelCase to snake_case for database
    const transformedData = transformProfileData(profileData);
    
    // Mark profile as completed if all required fields are present
    if (transformedData.photos && transformedData.photos.length >= 2 && transformedData.bio) {
      transformedData.profile_completed = true;
    }
    
    // Update last active timestamp
    transformedData.last_active_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('profiles')
      .update(transformedData)
      .eq('id', user.id);
    
    if (error) {
      console.error('Profile update error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}