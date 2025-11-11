import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  Crown, 
  Shield, 
  MessageSquare, 
  DollarSign,
  Edit3,
  Trash2,
  UserPlus,
  UserMinus,
  CheckCircle
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { eventService, Event, EventComment, EventAttendee } from '@/services/eventService';
import { CreateEventModal } from '@/components/CreateEventModal';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/services/supabase';

export const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attendeeStatus, setAttendeeStatus] = useState<'pending' | 'confirmed' | 'denied' | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId, user]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      // Verify authentication session exists before making API calls
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session found:', sessionError);
        alert('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      // Load event data - this is critical
      const eventData = await eventService.getEventById(eventId);
      
      if (!eventData) {
        navigate('/events');
        return;
      }
      
      setEvent(eventData);
      
      // Load comments and attendees - these are non-critical
      // If they fail due to RLS issues, page still loads with empty lists
      try {
        const [commentsData, attendeesData] = await Promise.all([
          eventService.getEventComments(eventId),
          eventService.getEventAttendees(eventId)
        ]);
        
        setComments(commentsData || []);
        setAttendees(attendeesData || []);
      } catch (secondaryError) {
        console.warn('Could not load attendees/comments (non-critical):', secondaryError);
        // Set empty arrays so page still works
        setComments([]);
        setAttendees([]);
      }
      
      // Check if current user is attending
      if (user) {
        try {
          const userIsAttending = await eventService.hasUserAttendedEvent(eventId, user.id);
          setIsAttending(userIsAttending);
          
          // Get detailed status
          const status = await eventService.getAttendeeStatus(eventId, user.id);
          setAttendeeStatus(status);
        } catch (attendanceError) {
          console.warn('Could not check attendance status:', attendanceError);
          setIsAttending(false);
          setAttendeeStatus(null);
        }
      }
    } catch (error: any) {
      console.error('Error loading event data:', error);
      
      // Handle authentication errors
      if (error?.message?.includes('JWT') || error?.message?.includes('session') || error?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      navigate('/events');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
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

  const getDisplayName = () => {
    if (!event) return 'User';
    if (event.account_type === 'couple' && event.display_name2) {
      return `${event.display_name || 'User'} & ${event.display_name2}`;
    }
    return event.display_name || 'User';
  };

  const getAuthorDetails = () => {
    if (!event) return '';
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
    
    if (event.author_location) {
      details.push(event.author_location);
    }
    
    return details.join(' • ');
  };

  const handleRSVP = async () => {
    if (!user || !eventId) return;
    
    setIsSubmittingRSVP(true);
    try {
      if (isAttending) {
        await eventService.unattendEvent(eventId, user.id);
        setIsAttending(false);
      } else {
        await eventService.attendEvent(eventId, user.id);
        setIsAttending(true);
      }
      // Reload attendees
      const attendeesData = await eventService.getEventAttendees(eventId);
      setAttendees(attendeesData);
      // Update event to reflect new count
      if (event) {
        setEvent({
          ...event,
          attendees_count: attendeesData.length
        });
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP. Please try again.');
    } finally {
      setIsSubmittingRSVP(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !eventId || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const comment = await eventService.addComment(eventId, user.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      // Update event comment count
      if (event) {
        setEvent({
          ...event,
          comments_count: (event.comments_count || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditEvent = async (data: {
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
    if (!user || !eventId || !event) return;

    try {
      // Upload new image if provided
      let imageUrl = event.image_url;
      if (data.image) {
        imageUrl = await eventService.uploadEventImage(user.id, data.image);
      }

      // Update event
      const updatedEvent = await eventService.updateEvent(eventId, user.id, {
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

      setEvent(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !eventId) return;
    
    setIsDeleting(true);
    try {
      await eventService.deleteEvent(eventId, user.id);
      navigate('/events');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(error.message || 'Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAuthorClick = () => {
    if (event?.author_id) {
      navigate(`/user/${event.author_id}`);
    }
  };

  const handleApproveAttendee = async (attendeeId: string) => {
    if (!user || !eventId) return;
    
    setIsProcessingApproval(attendeeId);
    try {
      await eventService.approveAttendee(eventId, attendeeId, user.id);
      // Reload attendees
      const attendeesData = await eventService.getEventAttendees(eventId);
      setAttendees(attendeesData || []);
    } catch (error) {
      console.error('Error approving attendee:', error);
      alert('Failed to approve attendee. Please try again.');
    } finally {
      setIsProcessingApproval(null);
    }
  };

  const handleDenyAttendee = async (attendeeId: string) => {
    if (!user || !eventId) return;
    
    setIsProcessingApproval(attendeeId);
    try {
      await eventService.denyAttendee(eventId, attendeeId, user.id);
      // Reload attendees
      const attendeesData = await eventService.getEventAttendees(eventId);
      setAttendees(attendeesData || []);
    } catch (error) {
      console.error('Error denying attendee:', error);
      alert('Failed to deny attendee. Please try again.');
    } finally {
      setIsProcessingApproval(null);
    }
  };

  const isAuthor = user && event && user.id === event.author_id;
  // Only count confirmed attendees for spots calculation
  const confirmedAttendeesCount = attendees.filter(a => a.status === 'confirmed').length;
  const pendingAttendeesCount = attendees.filter(a => a.status === 'pending').length;
  const spotsLeft = event ? event.max_capacity - confirmedAttendeesCount : 0;
  const isEventFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;

  if (isLoading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center pb-20">
        <Spinner />
      </SpiceBackground>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <SpiceBackground className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className={`${spiceTheme.components.header}`}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
            className="mr-3 text-pink-400 hover:bg-pink-500/10 p-2"
            data-testid="back-to-events-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>Event Details</h1>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-blue-400 hover:bg-blue-500/10"
                data-testid="edit-event-button"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:bg-red-500/10"
                data-testid="delete-event-button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-red-500/30 p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-semibold mb-4">Cancel Event?</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to cancel this event? This action cannot be undone. All attendees will be notified.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-white hover:bg-white/10"
                disabled={isDeleting}
              >
                Keep Event
              </Button>
              <Button
                onClick={handleDeleteEvent}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={isDeleting}
                data-testid="confirm-delete-event"
              >
                {isDeleting ? 'Canceling...' : 'Cancel Event'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Event Image & Info */}
        <Card className={`${spiceTheme.components.card} overflow-hidden animate-fade-in`}>
          {/* Event Image */}
          <div className="relative h-64">
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

          <div className="p-6 space-y-4">
            {/* Title */}
            <h2 className="text-white font-bold text-2xl">{event.title}</h2>

            {/* Date, Time, Location */}
            <div className="space-y-3">
              <div className="flex items-center text-white/90">
                <Calendar className="h-5 w-5 mr-3 text-pink-400 flex-shrink-0" />
                <span className="font-medium">{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center text-white/90">
                <Clock className="h-5 w-5 mr-3 text-pink-400 flex-shrink-0" />
                <span className="font-medium">{formatTime(event.event_time)}</span>
              </div>
              <div className="flex items-start text-white/90">
                <MapPin className="h-5 w-5 mr-3 text-pink-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>

            {/* Capacity & Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center space-x-4 text-white/70">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-pink-400" />
                  <span className="font-medium">{attendees.length} attending</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-pink-400" />
                  <span className="font-medium">{comments.length} comments</span>
                </div>
              </div>
              <Badge className={
                isEventFull 
                  ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                  : isAlmostFull 
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' 
                    : 'bg-green-500/20 text-green-400 border-green-500/50'
              }>
                {isEventFull ? 'FULL' : `${spotsLeft} spots left`}
              </Badge>
            </div>

            {/* RSVP Button */}
            {user && !isAuthor && (
              <Button
                onClick={handleRSVP}
                disabled={isSubmittingRSVP || (isEventFull && !isAttending)}
                className={`w-full ${
                  isAttending 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50' 
                    : spiceTheme.components.button.gradient
                }`}
                data-testid="rsvp-button"
              >
                {isSubmittingRSVP ? (
                  'Processing...'
                ) : isAttending ? (
                  <>
                    <UserMinus className="h-5 w-5 mr-2" />
                    Cancel RSVP
                  </>
                ) : isEventFull ? (
                  'Event Full'
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    RSVP to Attend
                  </>
                )}
              </Button>
            )}

            {isAuthor && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                <p className="text-blue-400 text-sm font-medium">You are the host of this event</p>
              </div>
            )}
          </div>
        </Card>

        {/* Event Description */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <div className="p-6 space-y-4">
            <h3 className="text-white font-semibold text-xl">About This Event</h3>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{event.description}</p>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-purple-500/10 text-purple-300 border-purple-500/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Host Information */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <div className="p-6 space-y-4">
            <h3 className="text-white font-semibold text-xl mb-4">Hosted By</h3>
            <button
              onClick={handleAuthorClick}
              className="flex items-center space-x-4 hover:bg-white/5 p-3 rounded-lg transition-all w-full text-left"
              data-testid="author-profile-link"
            >
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={event.photos?.[0]} />
                  <AvatarFallback className="bg-pink-500/20 text-pink-400 text-xl">
                    {event.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                {event.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-semibold ${spiceTheme.components.text.gradient}`}>
                    {getDisplayName()}
                  </h4>
                  {event.membership_tier === 'vip' && (
                    <Crown className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
                </div>
                {getAuthorDetails() && (
                  <p className="text-white/60 text-sm mt-1">{getAuthorDetails()}</p>
                )}
              </div>
            </button>
          </div>
        </Card>

        {/* Attendees */}
        {attendees.length > 0 && (
          <Card className={`${spiceTheme.components.card} animate-fade-in`}>
            <div className="p-6 space-y-4">
              <h3 className="text-white font-semibold text-xl">
                Attendees ({attendees.length})
              </h3>
              <div className="space-y-3">
                {attendees.map((attendee) => (
                  <button
                    key={attendee.id}
                    onClick={() => navigate(`/user/${attendee.user_id}`)}
                    className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-all w-full text-left"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.photos?.[0]} />
                        <AvatarFallback className="bg-pink-500/20 text-pink-400">
                          {attendee.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {attendee.is_verified && (
                        <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-blue-400 bg-black rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {attendee.account_type === 'couple' && attendee.display_name2
                          ? `${attendee.display_name} & ${attendee.display_name2}`
                          : attendee.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Comments Section */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <div className="p-6 space-y-4">
            <h3 className="text-white font-semibold text-xl">
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            {user && (
              <div className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">{newComment.length}/500</span>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className={spiceTheme.components.button.gradient}
                    size="sm"
                    data-testid="add-comment-button"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}

            <Separator className="bg-white/10" />

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-pink-400/50 mx-auto mb-3" />
                <p className="text-white/60">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={comment.photos?.[0]} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-400">
                        {comment.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium text-sm">
                            {comment.account_type === 'couple' && comment.display_name2
                              ? `${comment.display_name} & ${comment.display_name2}`
                              : comment.display_name}
                          </span>
                          {comment.is_verified && (
                            <CheckCircle className="h-3 w-3 text-blue-400" />
                          )}
                        </div>
                        <span className="text-white/40 text-xs">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Event Modal */}
      {user && isAuthor && (
        <CreateEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditEvent}
          initialData={event}
          mode="edit"
        />
      )}

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
