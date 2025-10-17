import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Calendar, MessageSquare, MapPin, Heart, Star, Shield, Crown, ArrowRight } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

// Mock data - will be replaced with real API calls
const mockOnlineUsers = [
  {
    id: '1',
    name: 'Alex & Jordan',
    age: 29,
    location: 'New York, NY',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
    isVerified: true,
    isPremium: true,
    accountType: 'Couple',
    lastActive: 'Online now',
    distance: '2.5 km'
  },
  {
    id: '2',
    name: 'Emma',
    age: 27,
    location: 'Brooklyn, NY',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    isVerified: true,
    isPremium: false,
    accountType: 'Single',
    lastActive: 'Online now',
    distance: '4.2 km'
  },
];

type OnlineUser = typeof mockOnlineUsers[0];

// Modal Component
function UserDetailModal({ user, isOpen, onClose }: {
  user: OnlineUser | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-xl flex items-center space-x-2">
            <span>{user.name}</span>
            {user.isVerified && <Shield className="h-5 w-5 text-blue-400" />}
            {user.isPremium && <Crown className="h-5 w-5 text-yellow-400" />}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {user.accountType} profile • {user.age} years old
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-full h-64 object-cover rounded-lg"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-white/60" />
                <span className="text-white/80">{user.location}</span>
              </div>
              <Badge className={user.lastActive === 'Online now' ? 'bg-green-500' : 'bg-orange-500'}>
                {user.lastActive}
              </Badge>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">
              Send Message
            </Button>
            <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserCard({ user, onClick }: { user: OnlineUser; onClick: () => void }) {
  return (
    <Card
      className="bg-black/50 border-pink-500/30 p-4 hover:border-pink-500/60 transition-all duration-300 min-w-[200px] cursor-pointer"
      onClick={onClick}
      data-testid={`user-card-${user.id}`}
    >
      <div className="relative">
        <img
          src={user.profileImage}
          alt={user.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
        {user.isVerified && (
          <Badge className="absolute top-2 right-2 bg-blue-500/90 text-white border-0 text-xs">
            ✓
          </Badge>
        )}
        {user.isPremium && (
          <Star className="absolute top-2 left-2 h-4 w-4 text-yellow-400 fill-current" />
        )}
        <div className="absolute bottom-2 left-2">
          <Badge className={user.lastActive === 'Online now' ? 'bg-green-500' : 'bg-orange-500'}>
            {user.lastActive === 'Online now' ? '● Online' : user.lastActive}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{user.name}</h3>
          <span className="text-white/60 text-xs">{user.age}</span>
        </div>

        <div className="flex items-center text-xs text-white/60">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{user.distance}</span>
        </div>

        <Badge variant="outline" className="text-xs border-pink-500/50 text-pink-400">
          {user.accountType}
        </Badge>
      </div>
    </Card>
  );
}

export const CommunityPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const handleUserClick = (user: OnlineUser) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  return (
    <SpiceBackground className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>Community</h1>
        <p className={spiceTheme.components.text.subtitle}>Connect with verified members in your area</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">

        {/* Users Online Section */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">Members Online</h2>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                {mockOnlineUsers.length} online
              </Badge>
            </div>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {mockOnlineUsers.map((user, index) => (
              <div 
                key={user.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <UserCard user={user} onClick={() => handleUserClick(user)} />
              </div>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
            </div>
            <Button
              variant="ghost"
              className="text-pink-400 hover:bg-pink-500/10 p-2"
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Card className={`${spiceTheme.components.card} p-6`}>
            <div className="text-center py-8 text-white/60">
              <Calendar className="h-12 w-12 text-pink-400/50 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Exclusive Events Coming Soon</h3>
              <p className="text-sm">VIP members get early access to lifestyle events</p>
            </div>
          </Card>
        </section>

        {/* ISO Posts Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">ISO Posts</h2>
            </div>
            <Button
              variant="ghost"
              className="text-pink-400 hover:bg-pink-500/10 p-2"
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Card className={`${spiceTheme.components.card} p-6`}>
            <div className="text-center py-8 text-white/60">
              <MessageSquare className="h-12 w-12 text-pink-400/50 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">In Search Of (ISO) Posts</h3>
              <p className="text-sm">Share what you're looking for with the community</p>
            </div>
          </Card>
        </section>

      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
      />

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
