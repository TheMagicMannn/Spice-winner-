import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ArrowLeft, 
  Lock, 
  Globe, 
  MessageCircle, 
  TrendingUp,
  Heart,
  Sparkles,
  Crown
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { useAuth } from '@/hooks/useAuth';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  privacy: 'public' | 'private';
  category: string;
  isJoined: boolean;
  isPremium: boolean;
}

export const SpiceGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data for community groups
  const groups: CommunityGroup[] = [
    {
      id: '1',
      name: 'Beginners Welcome',
      description: 'A supportive space for those new to the lifestyle. Ask questions, share experiences, and learn together.',
      memberCount: 1247,
      privacy: 'public',
      category: 'Lifestyle',
      isJoined: false,
      isPremium: false
    },
    {
      id: '2',
      name: 'Couples Connection',
      description: 'Exclusive group for couples exploring together. Share stories, tips, and connect with other couples.',
      memberCount: 892,
      privacy: 'private',
      category: 'Couples',
      isJoined: true,
      isPremium: false
    },
    {
      id: '3',
      name: 'Local Meetups & Events',
      description: 'Coordinate and discuss local events, meetups, and lifestyle parties in your area.',
      memberCount: 2156,
      privacy: 'public',
      category: 'Events',
      isJoined: false,
      isPremium: false
    },
    {
      id: '4',
      name: 'VIP Elite Circle',
      description: 'Premium members only. Exclusive discussions, events, and networking opportunities.',
      memberCount: 458,
      privacy: 'private',
      category: 'Premium',
      isJoined: false,
      isPremium: true
    },
    {
      id: '5',
      name: 'Kink & BDSM Discussion',
      description: 'Open conversations about kinks, BDSM practices, safety, and education.',
      memberCount: 1634,
      privacy: 'public',
      category: 'Education',
      isJoined: true,
      isPremium: false
    },
    {
      id: '6',
      name: 'Poly & Non-Monogamy',
      description: 'Support and discussion for polyamorous relationships and ethical non-monogamy.',
      memberCount: 967,
      privacy: 'public',
      category: 'Lifestyle',
      isJoined: false,
      isPremium: false
    },
    {
      id: '7',
      name: 'Travel & Lifestyle Resorts',
      description: 'Discuss lifestyle-friendly resorts, vacation spots, and travel experiences.',
      memberCount: 723,
      privacy: 'public',
      category: 'Travel',
      isJoined: false,
      isPremium: false
    },
    {
      id: '8',
      name: 'Women Only Space',
      description: 'A safe space for women to discuss, share, and support each other.',
      memberCount: 1089,
      privacy: 'private',
      category: 'Support',
      isJoined: false,
      isPremium: false
    }
  ];

  const categories = ['all', 'Lifestyle', 'Couples', 'Events', 'Education', 'Travel', 'Support', 'Premium'];

  const filteredGroups = selectedCategory === 'all' 
    ? groups 
    : groups.filter(g => g.category === selectedCategory);

  const handleJoinGroup = (groupId: string) => {
    // TODO: Implement join group functionality
    console.log('Joining group:', groupId);
  };

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className={`text-2xl ${spiceTheme.components.text.title}`} data-testid="page-title">
              SPICE Groups
            </h1>
            <p className={spiceTheme.components.text.subtitle}>
              Connect with your community
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={
                selectedCategory === category
                  ? 'bg-pink-600 hover:bg-pink-700 text-white whitespace-nowrap'
                  : 'border-pink-500/50 text-pink-400 hover:bg-pink-500/10 whitespace-nowrap'
              }
              data-testid={`category-${category}`}
            >
              {category === 'all' ? 'All Groups' : category}
            </Button>
          ))}
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className={`${spiceTheme.components.card} animate-fade-in hover:scale-[1.02] transition-all`}
              data-testid={`group-card-${group.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className={`text-lg ${spiceTheme.components.text.gradient}`}>
                        {group.name}
                      </CardTitle>
                      {group.isPremium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 text-xs">
                        {group.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-white/60 border-white/30 text-xs"
                      >
                        {group.privacy === 'private' ? (
                          <><Lock className="h-3 w-3 mr-1" /> Private</>
                        ) : (
                          <><Globe className="h-3 w-3 mr-1" /> Public</>
                        )}
                      </Badge>
                      <span className="text-white/60 text-xs flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {group.memberCount.toLocaleString()} members
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70 text-sm leading-relaxed">
                  {group.description}
                </p>
                <div className="flex gap-2">
                  {group.isJoined ? (
                    <>
                      <Button
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className={spiceTheme.components.button.gradient}
                        data-testid={`view-group-${group.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View Group
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white/70 hover:bg-white/10"
                        data-testid={`leave-group-${group.id}`}
                      >
                        Leave
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleJoinGroup(group.id)}
                      className={
                        group.isPremium
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                          : spiceTheme.components.button.gradient
                      }
                      disabled={group.isPremium && user?.profile?.membershipTier !== 'vip'}
                      data-testid={`join-group-${group.id}`}
                    >
                      {group.isPremium && user?.profile?.membershipTier !== 'vip' ? (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          VIP Only
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Join Group
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <Sparkles className="h-16 w-16 text-pink-400/50 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Groups Found</h3>
            <p className="text-white/60 text-sm">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};

export default SpiceGroupsPage;
