import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Calendar, MessageSquare, MapPin, Heart, Star, Shield, Crown, ArrowRight, Clock } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { mockEvents, Event } from '@/data/mockEvents';
import { mockISOPosts, ISOPost } from '@/data/mockISOPosts';

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
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle className={`text-pink-400 text-xl flex items-center space-x-2 ${spiceTheme.components.text.gradient}`}>
            <span>{user.name}</span>
            {user.isVerified && <Shield className="h-5 w-5 text-blue-400" />}
            {user.isPremium && <Crown className="h-5 w-5 text-yellow-400" />}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {user.accountType} profile • {user.age} years old
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-pink-400" />
                <span className="text-white/80">{user.location}</span>
              </div>
              <Badge className={user.lastActive === 'Online now' ? spiceTheme.components.badge.online : 'bg-orange-500'}>
                {user.lastActive}
              </Badge>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button className={`flex-1 ${spiceTheme.components.button.gradient}`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button className={`${spiceTheme.components.button.secondary} px-4`}>
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
      className={`${spiceTheme.components.card} p-4 min-w-[200px] cursor-pointer hover:scale-105 transform transition-all duration-300 animate-glow`}
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
          <Badge className={`absolute top-2 right-2 ${spiceTheme.components.badge.verified} text-xs p-1`}>
            <Shield className="h-3 w-3" />
          </Badge>
        )}
        {user.isPremium && (
          <Crown className="absolute top-2 left-2 h-4 w-4 text-yellow-400 fill-current" />
        )}
        <div className="absolute bottom-2 left-2">
          <Badge className={user.lastActive === 'Online now' ? spiceTheme.components.badge.online : 'bg-orange-500'}>
            {user.lastActive === 'Online now' ? '● Online' : user.lastActive}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${spiceTheme.components.text.gradient} text-sm`}>{user.name}</h3>
          <span className="text-white/60 text-xs">{user.age}</span>
        </div>

        <div className="flex items-center text-xs text-white/60">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{user.distance}</span>
        </div>

        <Badge className={`text-xs ${spiceTheme.components.badge.pink}`}>
          {user.accountType}
        </Badge>
      </div>
    </Card>
  );
}

// Event Preview Card Component
function EventPreviewCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const spotsLeft = event.maxCapacity - event.attendees;

  return (
    <Card
      className={`${spiceTheme.components.card} min-w-[280px] overflow-hidden cursor-pointer hover:scale-105 transform transition-all duration-300 animate-glow`}
      onClick={onClick}
      data-testid={`event-preview-${event.id}`}
    >
      <div className="relative h-40">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {event.isVipOnly && (
          <Badge className="absolute top-2 right-2 bg-yellow-500/90 text-black font-semibold text-xs">
            <Crown className="h-3 w-3 mr-1" />
            VIP
          </Badge>
        )}
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{event.title}</h3>
          <Badge className={`${spiceTheme.components.badge.pink} text-xs`}>{event.category}</Badge>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center text-xs text-white/80">
          <Calendar className="h-3 w-3 mr-1 text-pink-400" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-white/80">
            <MapPin className="h-3 w-3 mr-1 text-pink-400" />
            <span>{event.location}</span>
          </div>
          <Badge className={spotsLeft <= 10 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs' : 'bg-green-500/20 text-green-400 border-green-500/50 text-xs'}>
            {spotsLeft} spots
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-sm font-bold text-pink-400">${event.price}</span>
          <span className="text-xs text-white/60">{event.attendees} attending</span>
        </div>
      </div>
    </Card>
  );
}

// Event Detail Modal Component
function EventDetailModal({ event, isOpen, onClose }: { event: Event | null; isOpen: boolean; onClose: () => void }) {
  if (!event) return null;

  const spotsLeft = event.maxCapacity - event.attendees;
  const isAlmostFull = spotsLeft <= 10;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-pink-400 text-2xl flex items-center space-x-2 ${spiceTheme.components.text.gradient}`}>
            <span>{event.title}</span>
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {event.category}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            {event.isVipOnly && (
              <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-black font-semibold">
                <Crown className="h-4 w-4 mr-1" />
                VIP Only Event
              </Badge>
            )}
          </div>

          <p className="text-white/80 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-white/80">
                <Calendar className="h-5 w-5 mr-3 text-pink-400" />
                <div>
                  <div className="text-xs text-white/60">Date</div>
                  <div className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              <div className="flex items-center text-white/80">
                <Clock className="h-5 w-5 mr-3 text-pink-400" />
                <div>
                  <div className="text-xs text-white/60">Time</div>
                  <div className="font-semibold">{event.time}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-white/80">
                <MapPin className="h-5 w-5 mr-3 text-pink-400" />
                <div>
                  <div className="text-xs text-white/60">Location</div>
                  <div className="font-semibold">{event.location}</div>
                </div>
              </div>

              <div className="flex items-center text-white/80">
                <Users className="h-5 w-5 mr-3 text-pink-400" />
                <div>
                  <div className="text-xs text-white/60">Attendance</div>
                  <div className="font-semibold">{event.attendees} / {event.maxCapacity}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-pink-500/10 rounded-lg border border-pink-500/30">
            <div>
              <div className="text-sm text-white/60">Event Price</div>
              <div className="text-3xl font-bold text-pink-400">${event.price}</div>
            </div>
            <Badge className={isAlmostFull ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}>
              {spotsLeft} spots left
            </Badge>
          </div>

          <Button className={`w-full ${spiceTheme.components.button.gradient} text-lg py-6`}>
            Reserve Your Spot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ISO Post Preview Card Component
function ISOPostPreviewCard({ post, onClick }: { post: ISOPost; onClick: () => void }) {
  return (
    <Card
      className={`${spiceTheme.components.card} min-w-[280px] p-4 cursor-pointer hover:scale-105 hover:border-pink-500/50 transform transition-all duration-300`}
      onClick={onClick}
      data-testid={`iso-preview-${post.id}`}
    >
      <div className="flex items-start space-x-3 mb-3">
        <div className="relative">
          <img
            src={post.authorImage}
            alt={post.author}
            className="w-12 h-12 rounded-full object-cover"
          />
          {post.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <Shield className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className={`font-semibold text-sm truncate ${spiceTheme.components.text.gradient}`}>{post.author}</h3>
            {post.isPremium && <Crown className="h-3 w-3 text-yellow-400 fill-current flex-shrink-0" />}
          </div>
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <Badge className={`text-xs ${spiceTheme.components.badge.pink}`}>
              {post.accountType}
            </Badge>
            <span>•</span>
            <span>{post.postedAt}</span>
          </div>
        </div>
      </div>

      <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2">{post.title}</h4>
      <p className="text-white/70 text-xs leading-relaxed line-clamp-3 mb-3">{post.content}</p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-white/60">
          <span className="flex items-center">
            <Heart className="h-3 w-3 mr-1" />
            {post.likes}
          </span>
          <span className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            {post.responses}
          </span>
        </div>
        <MapPin className="h-3 w-3 text-pink-400" />
      </div>
    </Card>
  );
}

// ISO Post Detail Modal Component
function ISOPostDetailModal({ post, isOpen, onClose }: { post: ISOPost | null; isOpen: boolean; onClose: () => void }) {
  const [isLiked, setIsLiked] = useState(false);

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="w-16 h-16 rounded-full object-cover"
                />
                {post.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className={`text-pink-400 text-xl flex items-center space-x-2 ${spiceTheme.components.text.gradient}`}>
                  <span>{post.author}</span>
                  {post.isPremium && <Crown className="h-5 w-5 text-yellow-400 fill-current" />}
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  {post.accountType} • {post.postedAt}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-white font-bold text-xl mb-3">{post.title}</h3>
            <p className="text-white/80 leading-relaxed">{post.content}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-pink-500/10 text-pink-300 border-pink-500/30"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center text-white/70 p-3 bg-white/5 rounded-lg">
            <MapPin className="h-5 w-5 mr-2 text-pink-400" />
            <span>{post.location}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-2 text-white/60 hover:text-pink-400 transition-colors"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                <span className="font-semibold">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <div className="flex items-center space-x-2 text-white/60">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">{post.responses} responses</span>
              </div>
            </div>
          </div>

          <Button className={`w-full ${spiceTheme.components.button.gradient} text-lg py-6`}>
            <MessageSquare className="h-5 w-5 mr-2" />
            Send Response
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const CommunityPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedISOPost, setSelectedISOPost] = useState<ISOPost | null>(null);
  const [showISOPostDetail, setShowISOPostDetail] = useState(false);

  const handleUserClick = (user: OnlineUser) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleISOPostClick = (post: ISOPost) => {
    setSelectedISOPost(post);
    setShowISOPostDetail(true);
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
              onClick={() => window.location.hash = '/events'}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {mockEvents.slice(0, 4).map((event, index) => (
              <div 
                key={event.id} 
                className="animate-fade-in snap-start"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EventPreviewCard event={event} onClick={() => handleEventClick(event)} />
              </div>
            ))}
          </div>
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
              onClick={() => window.location.hash = '/iso'}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {mockISOPosts.slice(0, 4).map((post, index) => (
              <div 
                key={post.id} 
                className="animate-fade-in snap-start"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ISOPostPreviewCard post={post} onClick={() => handleISOPostClick(post)} />
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Modals */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => setShowEventDetail(false)}
      />

      <ISOPostDetailModal
        post={selectedISOPost}
        isOpen={showISOPostDetail}
        onClose={() => setShowISOPostDetail(false)}
      />

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
