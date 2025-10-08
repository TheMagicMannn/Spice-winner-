import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/Spinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const { email, profile } = user;
  const { displayName, photos, bio, age, location, interests } = profile;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto p-8 bg-base-200 rounded-xl shadow-lg animate-fade-in">
        <div className="flex flex-col items-center text-center">
            {photos && photos.length > 0 ? (
              <img
                src={photos[0]}
                alt={`${displayName}'s avatar`}
                className="w-40 h-40 rounded-full object-cover mb-6 border-4 border-brand-primary"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-brand-secondary flex items-center justify-center mb-6 border-4 border-brand-primary" aria-label="User initial avatar">
                <span className="text-6xl font-bold text-white" aria-hidden="true">
                  {displayName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-4xl font-bold text-white">Welcome, {displayName}!</h2>
            <p className="text-lg text-text-secondary mt-2">{email}</p>
            <p className="text-md text-text-secondary">{age} - {location}</p>
        </div>

        <div className="bg-base-300 p-6 rounded-lg text-left my-6 border border-brand-primary/50 shadow-md shadow-brand-primary/10">
          <h3 className="text-xl font-semibold text-brand-secondary mb-2">Your Bio:</h3>
          <p className="text-text-primary whitespace-pre-wrap">{bio || 'You have not set a bio yet.'}</p>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-brand-secondary mb-4 text-center">Your Interests:</h3>
            <div className="flex flex-wrap justify-center gap-2">
                {interests.map(interest => (
                    <span key={interest} className="bg-base-300 text-brand-secondary text-sm font-medium px-3 py-1 rounded-full">
                        {interest}
                    </span>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};