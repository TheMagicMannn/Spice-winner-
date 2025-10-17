import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Crown, Shield } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'Luxury Rooftop Mixer',
    date: '2025-08-22',
    time: '8:00 PM - 12:00 AM',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600',
    attendees: 45,
    maxCapacity: 80,
    isVipOnly: true,
    price: 75,
    description: 'Join us for an exclusive evening of sophisticated connections at one of Manhattan\'s premier rooftop venues.',
    category: 'Social Mixer',
  },
  {
    id: '2',
    title: 'Wine & Dine Experience',
    date: '2025-08-25',
    time: '7:00 PM - 10:00 PM',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
    attendees: 28,
    maxCapacity: 40,
    isVipOnly: false,
    price: 50,
    description: 'An intimate dinner experience featuring fine wines and gourmet cuisine in a private setting.',
    category: 'Dining',
  },
  {
    id: '3',
    title: 'Lifestyle Lounge Weekend',
    date: '2025-08-29',
    time: '9:00 PM - 2:00 AM',
    location: 'Queens, NY',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    attendees: 62,
    maxCapacity: 100,
    isVipOnly: true,
    price: 100,
    description: 'Our signature weekend event featuring multiple themed rooms, live entertainment, and exclusive play areas.',
    category: 'Lifestyle Party',
  },
  {
    id: '4',
    title: 'Beach Club Day Party',
    date: '2025-09-01',
    time: '12:00 PM - 6:00 PM',
    location: 'Long Island, NY',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    attendees: 35,
    maxCapacity: 60,
    isVipOnly: false,
    price: 60,
    description: 'Summer vibes with cocktails, music, and mingling by the water at an exclusive beach club.',
    category: 'Outdoor',
  },
  {
    id: '5',
    title: 'Masquerade Ball',
    date: '2025-09-05',
    time: '8:00 PM - 1:00 AM',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
    attendees: 88,
    maxCapacity: 120,
    isVipOnly: true,
    price: 125,
    description: 'An elegant masked ball featuring live music, champagne, and mystery connections in a stunning ballroom.',
    category: 'Formal Event',
  },
  {
    id: '6',
    title: 'Speed Dating Night',
    date: '2025-09-08',
    time: '7:30 PM - 10:00 PM',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
    attendees: 22,
    maxCapacity: 30,
    isVipOnly: false,
    price: 35,
    description: 'Fast-paced, fun evening of quick connections with like-minded singles and couples.',
    category: 'Speed Dating',
  },
];

interface EventCardProps {
  event: typeof mockEvents[0];
}

function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.maxCapacity - event.attendees;
  const isAlmostFull = spotsLeft <= 10;

  return (
    <Card className={`${spiceTheme.components.card} overflow-hidden animate-fade-in hover:scale-[1.02] transition-transform duration-300`}>
      <div className="relative h-48">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {event.isVipOnly && (
          <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-black font-semibold">
            <Crown className="h-3 w-3 mr-1" />
            VIP Only
          </Badge>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-1">{event.title}</h3>
          <Badge className={spiceTheme.components.badge.pink}>{event.category}</Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center text-sm text-white/80">
          <Calendar className="h-4 w-4 mr-2 text-pink-400" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center text-sm text-white/80">
          <Clock className="h-4 w-4 mr-2 text-pink-400" />
          <span>{event.time}</span>
        </div>

        <div className="flex items-center text-sm text-white/80">
          <MapPin className="h-4 w-4 mr-2 text-pink-400" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-white/80">
            <Users className="h-4 w-4 mr-2 text-pink-400" />
            <span>{event.attendees} attending</span>
          </div>
          <Badge className={isAlmostFull ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}>
            {spotsLeft} spots left
          </Badge>
        </div>

        <p className="text-sm text-white/70 line-clamp-2">{event.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-lg font-bold text-pink-400">${event.price}</div>
          <Button className={spiceTheme.components.button.gradient}>
            Reserve Spot
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SpiceBackground className="min-h-screen flex flex-col pb-20">
      {/* Header with Back Button */}
      <div className={`${spiceTheme.components.header} flex items-center`}>
        <Button
          variant="ghost"
          onClick={() => navigate('/community')}
          className="mr-3 text-pink-400 hover:bg-pink-500/10 p-2"
          data-testid="back-to-community-button"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>Upcoming Events</h1>
          <p className={spiceTheme.components.text.subtitle}>Exclusive lifestyle events for verified members</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event, index) => (
            <div 
              key={event.id} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {/* Empty State (if no events) */}
        {mockEvents.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-pink-400/50 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No Events Yet</h3>
            <p className="text-white/60">Check back soon for exciting events!</p>
          </div>
        )}
      </div>

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
