import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Users, Crown, Shield } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

const mockProfiles = [
  {
    id: '1',
    displayName: 'Alex & Jordan',
    age: 29,
    accountType: 'couple',
    city: 'New York',
    state: 'NY',
    bio: 'Adventurous couple looking for like-minded friends. We love travel, good food, and meaningful connections.',
    photos: ['https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600'],
    distance: 2.5,
    verificationStatus: 'verified',
    membershipType: 'premium'
  },
  {
    id: '2',
    displayName: 'Emma',
    age: 27,
    accountType: 'individual',
    city: 'Brooklyn',
    state: 'NY',
    bio: 'Love meeting new people and exploring the lifestyle. Looking for genuine connections and fun experiences.',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600'],
    distance: 4.2,
    verificationStatus: 'verified',
    membershipType: 'basic'
  },
];

export const BrowsePage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles] = useState(mockProfiles);

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    console.log('Liked:', currentProfile?.id);
    handleNext();
  };

  const handlePass = () => {
    console.log('Passed:', currentProfile?.id);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back or show "no more profiles"
    }
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center pb-20">
        <div className="text-center">
          <h2 className="text-white text-xl mb-2">No more profiles</h2>
          <p className="text-white/60">Check back later for new members!</p>
        </div>
      </div>
    );
  }

  return (
    <SpiceBackground className="max-w-md mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center justify-between">
          <h1 className={`text-xl ${spiceTheme.components.text.title}`} data-testid="text-browse-title">
            Discover
          </h1>
          <Badge className={`${spiceTheme.components.badge.pink} animate-pulse`}>
            {currentIndex + 1} of {profiles.length}
          </Badge>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <Card 
          className={`${spiceTheme.components.card} overflow-hidden animate-fade-in`} 
          data-testid={`card-profile-${currentProfile.id}`}
        >
          <div className="relative">
            <img
              src={currentProfile.photos[0]}
              alt={currentProfile.displayName}
              className="w-full h-96 object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Profile badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              {currentProfile.verificationStatus === 'verified' && (
                <Badge className={`${spiceTheme.components.badge.verified} animate-glow`}>
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {currentProfile.membershipType === 'premium' && (
                <Badge className={`${spiceTheme.components.badge.premium} animate-glow`}>
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Distance badge */}
            {currentProfile.distance && (
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {currentProfile.distance}km away
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className={`text-xl font-bold ${spiceTheme.components.text.gradient}`} data-testid={`text-profile-name-${currentProfile.id}`}>
                {currentProfile.displayName}
              </h2>
              <div className="flex items-center gap-2 text-white/60">
                <span>{currentProfile.age || 'Age not specified'}</span>
                <Badge className={spiceTheme.components.badge.pink}>
                  {currentProfile.accountType}
                </Badge>
              </div>
            </div>

            {/* Location */}
            {(currentProfile.city || currentProfile.state) && (
              <div className="flex items-center text-white/60">
                <MapPin className="h-4 w-4 mr-2 text-pink-400" />
                <span>
                  {[currentProfile.city, currentProfile.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Bio */}
            {currentProfile.bio && (
              <p className="text-white/80 leading-relaxed" data-testid={`text-profile-bio-${currentProfile.id}`}>
                {currentProfile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-pink-400" />
                <span>{currentProfile.photos.length} photos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={handlePass}
            className="h-16 w-16 rounded-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 animate-glow flex items-center justify-center"
            data-testid="button-pass-profile"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={handleLike}
            className={`h-16 w-16 rounded-full ${spiceTheme.components.button.gradient} transition-all duration-300 animate-glow flex items-center justify-center hover:scale-110 transform`}
            data-testid="button-like-profile"
          >
            <Heart className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
