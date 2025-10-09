import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Profile } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message, error);
          throw new Error(error.message);
        }

        setProfile(data);
      } catch (err: any) {
        console.error('Profile fetch error:', err.message, err.stack);
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile found. Please complete your profile setup.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {profile.displayName}!</h1>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Your Interests</h2>
        <ul className="list-disc list-inside">
          {profile.interests.map((interest: string) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
      {/* Add more profile details as needed */}
    </div>
  );
};
