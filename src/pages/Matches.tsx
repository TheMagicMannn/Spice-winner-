import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Users, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { useAuth } from '@/hooks/useAuth';
import { MatchingService } from '@/services/matchingService';
import { Profile } from '@/types';
import { Spinner } from '@/components/Spinner';

export const MatchesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  
  // Real data from Supabase
  const [mutualMatches, setMutualMatches] = useState<Profile[]>([]);
  const [whoILike, setWhoILike] = useState<Profile[]>([]);
  const [whoLikesMe, setWhoLikesMe] = useState<Profile[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadMatchesData();
  }, [user?.id]);

  const loadMatchesData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load all three types of data in parallel
      const [mutual, liked, likesMe] = await Promise.all([
        MatchingService.getMutualMatches(user.id),
        MatchingService.getLikedProfiles(user.id),
        MatchingService.getProfilesWhoLikeMe(user.id)
      ]);
      
      setMutualMatches(mutual);
      setWhoILike(liked);
      setWhoLikesMe(likesMe);
    } catch (error) {
      console.error('Failed to load matches data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get display name based on account type
  const getDisplayName = (profile: Profile) => {
    if (profile.accountType === 'couple' && profile.displayName2) {
      return `${profile.displayName} & ${profile.displayName2}`;
    }
    return profile.displayName || 'Anonymous';
  };

  // Handle message button click
  const handleMessageClick = (profile: Profile) => {
    // Navigate to messages page - in future, can pass profile ID to open specific conversation
    navigate('/messages');
  };

  const renderMatchCard = (match: Profile, type: 'match' | 'liked' | 'likes') => (
    <Card
      key={match.id}
      className={`${spiceTheme.components.card} animate-fade-in hover:scale-105 transform transition-all duration-300`}
      data-testid={`match-card-${match.id}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Profile Image */}
          <img
            src={match.photos?.[0] || 'https://via.placeholder.com/200x200?text=No+Photo'}
            alt={getDisplayName(match)}
            className="w-20 h-20 rounded-lg object-cover"
          />
          
          {/* Match Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className={`font-semibold text-lg ${spiceTheme.components.text.gradient}`}>
                  {getDisplayName(match)}
                </h3>
                <p className="text-white/60 text-sm">
                  {match.age || 'Age N/A'}
                  {match.age2 && match.accountType === 'couple' && ` & ${match.age2}`}
                  {match.location && ` • ${match.location}`}
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
              {match.bio || 'No bio available'}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge className="bg-transparent text-pink-400 border-pink-500/50">
                {match.accountType}
              </Badge>
              <Button
                onClick={() => handleMessageClick(match)}
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
