import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Crown, Shield, Plus, Search, MessageSquare, DollarSign } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { eventService, Event, EVENT_CATEGORY_OPTIONS } from '@/services/eventService';
import { CreateEventModal } from '@/components/CreateEventModal';

interface EventCardProps {
  event: Event;
  onClick: () => void;
  onAuthorClick: (authorId: string) => void;
}

function EventCard({ event, onClick, onAuthorClick }: EventCardProps) {
  const getDisplayName = () => {
    if (event.account_type === 'couple' && event.display_name2) {
      return `${event.display_name || 'User'} & ${event.display_name2}`;
    }
    return event.display_name || 'User';
  };

  const getAuthorDetails = () => {
    const details = [];
    
    if (event.age) {
      if (event.account_type === 'couple' && event.age2) {
        details.push(`${event.age} & ${event.age2}`);
      } else {
        details.push(`${event.age}`);
      }
    }
    
    if (event.gender) {
      if (event.account_type === 'couple' && event.gender2) {
        details.push(`${event.gender}/${event.gender2}`);
      } else {
        details.push(event.gender);
      }
    }
    
    return details.join(' • ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const spotsLeft = event.max_capacity - (event.attendees_count || 0);
  const isAlmostFull = spotsLeft <= 10;

  return (
    <Card 
      className={`${spiceTheme.components.card} overflow-hidden animate-fade-in hover:border-pink-500/50 transition-all duration-300 cursor-pointer`}
      data-testid={`event-${event.id}`}
    >
      {/* Event Image */}
      <div className="relative h-48">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
        
        {/* Category Badge */}
        <Badge className="absolute top-3 right-3 bg-pink-500/90 text-white font-semibold">
          {event.category}
        </Badge>

        {/* Price Badge */}
        {event.price > 0 && (
          <Badge className="absolute top-3 left-3 bg-green-500/90 text-white font-semibold flex items-center">
            <DollarSign className="h-3 w-3 mr-0.5" />
            {event.price}
          </Badge>
        )}
        {event.price === 0 && (
          <Badge className="absolute top-3 left-3 bg-blue-500/90 text-white font-semibold">
            FREE
          </Badge>
        )}
      </div>

      {/* Author Info */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAuthorClick(event.author_id);
          }}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity w-full"
          data-testid={`author-link-${event.id}`}
        >
          <div className="relative">
            <img
              src={event.photos?.[0] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400'}
              alt={getDisplayName()}
              className="w-10 h-10 rounded-full object-cover"
            />
            {event.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold text-sm ${spiceTheme.components.text.gradient}`}>
                {getDisplayName()}
              </h3>
              {event.membership_tier === 'vip' && <Crown className="h-3 w-3 text-yellow-400 fill-current" />}
            </div>
            {getAuthorDetails() && (
              <div className="text-xs text-white/50">
                {getAuthorDetails()}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Event Content - Clickable */}
      <div className="p-4 space-y-3" onClick={onClick}>
        <h4 className="text-white font-semibold text-lg line-clamp-2">{event.title}</h4>
        
        {/* Date and Time */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-white/80">
            <Calendar className="h-4 w-4 mr-2 text-pink-400" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center text-sm text-white/80">
            <Clock className="h-4 w-4 mr-2 text-pink-400" />
            <span>{formatTime(event.event_time)}</span>
          </div>
          <div className="flex items-center text-sm text-white/80">
            <MapPin className="h-4 w-4 mr-2 text-pink-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/70 line-clamp-2">{event.description}</p>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge className="bg-white/5 text-white/60 border-white/20 text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Capacity and Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center text-white/70">
              <Users className="h-4 w-4 mr-1 text-pink-400" />
              <span>{event.attendees_count || 0}</span>
            </div>
            <div className="flex items-center text-white/70">
              <MessageSquare className="h-4 w-4 mr-1 text-pink-400" />
              <span>{event.comments_count || 0}</span>
            </div>
          </div>
          <Badge className={isAlmostFull ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs' : 'bg-green-500/20 text-green-400 border-green-500/50 text-xs'}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
          </Badge>
        </div>
      </div>

      {/* View Button */}
      <div className="px-4 pb-4">
        <Button 
          className={`${spiceTheme.components.button.gradient} w-full text-sm`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Event Details
        </Button>
      </div>
    </Card>
  );
}

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create tabs array with "All" first
  const tabs = ['All', ...EVENT_CATEGORY_OPTIONS];

  useEffect(() => {
    loadEvents();
  }, [activeTab, searchQuery]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const categoryFilter = activeTab === 'All' ? undefined : activeTab;
      const eventsData = await eventService.getAllEvents(categoryFilter, searchQuery);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (data: {
    title: string;
    description: string;
    location: string;
    event_date: string;
    event_time: string;
    category: string;
    max_capacity: number;
    price: number;
    tags: string[];
    image?: File | null;
  }) => {
    if (!user) return;

    try {
      // Upload image if provided
      let imageUrl = null;
      if (data.image) {
        imageUrl = await eventService.uploadEventImage(user.id, data.image);
      }

      // Create event
      await eventService.createEvent(user.id, {
        title: data.title,
        description: data.description,
        location: data.location,
        event_date: data.event_date,
        event_time: data.event_time,
        category: data.category,
        max_capacity: data.max_capacity,
        price: data.price,
        tags: data.tags,
        image_url: imageUrl
      });

      await loadEvents(); // Reload events
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const handleEventClick = (eventId: string) => {
    // TODO: Navigate to event detail page when implemented
    console.log('Event clicked:', eventId);
  };

  const handleAuthorClick = (authorId: string) => {
    navigate(`/user/${authorId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <SpiceBackground className="min-h-screen flex flex-col pb-20">
      {/* Header with Back Button */}
      <div className={`${spiceTheme.components.header}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1">
            <Button
              variant="ghost"
              onClick={() => navigate('/community')}
              className="mr-3 text-pink-400 hover:bg-pink-500/10 p-2"
              data-testid="back-to-community-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>Events</h1>
              <p className={spiceTheme.components.text.subtitle}>Discover and create lifestyle events</p>
            </div>
          </div>
          {user && (
            <Button 
              className={spiceTheme.components.button.gradient}
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="create-event-button"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search events..."
            className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40 pl-10"
            data-testid="search-input"
          />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-pink-400/50 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">
              {searchQuery ? 'No events found' : 'No Events Yet'}
            </h3>
            <p className="text-white/60 mb-4">
              {searchQuery ? 'Try a different search term' : 'Be the first to create an event!'}
            </p>
            {user && !searchQuery && (
              <Button 
                className={spiceTheme.components.button.gradient}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div 
                key={event.id} 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EventCard 
                  event={event} 
                  onClick={() => handleEventClick(event.id)}
                  onAuthorClick={handleAuthorClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {user && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
          mode="create"
        />
      )}

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
