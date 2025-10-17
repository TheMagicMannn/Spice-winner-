import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

export const MatchesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('matches');

  // Placeholder data
  const mutualMatches = [
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

  const whoILike = [
    {
      id: '3',
      name: 'Alex & Jordan',
      age: 29,
      location: 'Manhattan, NY',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
      likedAt: '3 hours ago',
      bio: 'Travel enthusiasts and wine lovers'
    },
  ];

  const whoLikesMe = [
    {
      id: '4',
      name: 'Emma',
      age: 27,
      location: 'Queens, NY',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      likedAt: '1 day ago',
      bio: 'Yoga instructor and lifestyle explorer'
    },
    {
      id: '5',
      name: 'Taylor & Sam',
      age: 30,
      location: 'Brooklyn, NY',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
      likedAt: '2 days ago',
      bio: 'Fitness enthusiasts seeking connections'
    },
  ];

  const renderMatchCard = (match: any, type: 'match' | 'liked' | 'likes') => (
    <Card
      key={match.id}
      className={`${spiceTheme.components.card} animate-fade-in hover:scale-105 transform transition-all duration-300`}
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
                <h3 className={`font-semibold text-lg ${spiceTheme.components.text.gradient}`}>{match.name}</h3>
                <p className="text-white/60 text-sm">
                  {match.age} • {match.location}
                </p>
              </div>
              <Badge className={
                type === 'match' 
                  ? `${spiceTheme.components.badge.pink} animate-pulse` 
                  : type === 'liked'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                  : 'bg-green-500/20 text-green-400 border-green-500/50'
              }>
                {type === 'match' && <Heart className="h-3 w-3 mr-1" />}
                {type === 'liked' && <Eye className="h-3 w-3 mr-1" />}
                {type === 'likes' && <Heart className="h-3 w-3 mr-1" />}
                {type === 'match' ? 'Match' : type === 'liked' ? 'Sent' : 'Received'}
              </Badge>
            </div>
            
            <p className="text-white/70 text-sm mb-3 line-clamp-2">
              {match.bio}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">
                {type === 'match' 
                  ? `Matched ${match.matchedAt}` 
                  : `Liked ${match.likedAt || match.matchedAt}`}
              </span>
              <Button
                className={spiceTheme.components.button.gradient}
                data-testid={`button-message-${match.id}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {type === 'match' ? 'Message' : 'View'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="text-center py-12 animate-fade-in">
      <div className="text-pink-400/50 mb-4">
        {icon}
      </div>
      <h3 className="text-white text-lg font-medium mb-2">{title}</h3>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  );

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`} data-testid="text-matches-title">
          Matches
        </h1>
        <p className={spiceTheme.components.text.subtitle}>
          Manage your connections and interactions
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-pink-500/30">
            <TabsTrigger 
              value="matches" 
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-white/70"
            >
              <Heart className="h-4 w-4 mr-2" />
              My Matches
              {mutualMatches.length > 0 && (
                <Badge className="ml-2 bg-pink-500/20 text-pink-400 text-xs">
                  {mutualMatches.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-white/70"
            >
              <Eye className="h-4 w-4 mr-2" />
              Who I Like
              {whoILike.length > 0 && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-400 text-xs">
                  {whoILike.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-white/70"
            >
              <Users className="h-4 w-4 mr-2" />
              Who Likes Me
              {whoLikesMe.length > 0 && (
                <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">
                  {whoLikesMe.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Mutual Matches Tab */}
          <TabsContent value="matches" className="mt-6">
            <div className="space-y-4">
              {mutualMatches.length > 0 ? (
                mutualMatches.map((match) => renderMatchCard(match, 'match'))
              ) : (
                renderEmptyState(
                  <Heart className="h-16 w-16 mx-auto" />,
                  "No matches yet",
                  "Keep browsing to find your perfect match!"
                )
              )}
            </div>
          </TabsContent>

          {/* Who I Like Tab */}
          <TabsContent value="liked" className="mt-6">
            <div className="space-y-4">
              {whoILike.length > 0 ? (
                whoILike.map((match) => renderMatchCard(match, 'liked'))
              ) : (
                renderEmptyState(
                  <Eye className="h-16 w-16 mx-auto" />,
                  "No likes sent",
                  "Start browsing and like profiles you're interested in!"
                )
              )}
            </div>
          </TabsContent>

          {/* Who Likes Me Tab */}
          <TabsContent value="likes" className="mt-6">
            <div className="space-y-4">
              {whoLikesMe.length > 0 ? (
                whoLikesMe.map((match) => renderMatchCard(match, 'likes'))
              ) : (
                renderEmptyState(
                  <Users className="h-16 w-16 mx-auto" />,
                  "No likes received",
                  "Complete your profile to attract more matches!"
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
