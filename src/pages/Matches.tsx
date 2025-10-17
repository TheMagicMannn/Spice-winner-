import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

export const MatchesPage: React.FC = () => {
  // Placeholder data
  const matches = [
    {
      id: '1',
      name: 'Sarah & Mike',
      age: 32,
      location: 'New York, NY',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
      matchedAt: '2 days ago',
      bio: 'Adventurous couple looking for like-minded people'
    },
    {
      id: '2',
      name: 'Jessica',
      age: 28,
      location: 'Brooklyn, NY',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      matchedAt: '1 week ago',
      bio: 'Love meeting new people and exploring the lifestyle'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
        <h1 className="text-2xl font-bold text-white mb-1" data-testid="text-matches-title">
          Matches
        </h1>
        <p className="text-white/70 text-sm">You have {matches.length} mutual matches</p>
      </div>

      {/* Matches List */}
      <div className="p-4 space-y-4">
        {matches.map((match) => (
          <Card
            key={match.id}
            className="bg-black/50 border-pink-500/30 hover:border-pink-500/60 transition-all"
            data-testid={`match-card-${match.id}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Profile Image */}
                <img
                  src={match.image}
                  alt={match.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                
                {/* Match Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{match.name}</h3>
                      <p className="text-white/60 text-sm">
                        {match.age} • {match.location}
                      </p>
                    </div>
                    <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
                      <Heart className="h-3 w-3 mr-1" />
                      Match
                    </Badge>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {match.bio}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">
                      Matched {match.matchedAt}
                    </span>
                    <Button
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                      data-testid={`button-message-${match.id}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No matches yet</h3>
            <p className="text-white/60 text-sm">
              Keep browsing to find your perfect match!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
