import { supabase } from './supabase';

// Event category options
export const EVENT_CATEGORY_OPTIONS = [
  'Hotel Takeover',
  'House Party',
  'Community Munch',
  'Meet and Greet',
  'Swingers Club Events',
  'Workshop/Education',
  'Private Play Events'
];

export interface Event {
  id: string;
  author_id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  category: string;
  max_capacity: number;
  price: number;
  tags: string[];
  image_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  
  // Author details (from join)
  display_name?: string;
  display_name2?: string;
  account_type?: 'individual' | 'couple';
  photos?: string[];
  is_verified?: boolean;
  membership_tier?: string;
  author_location?: string;
  age?: number;
  age2?: number;
  gender?: string;
  gender2?: string;
  orientation?: string;
  orientation2?: string;
  
  // Counts
  attendees_count?: number;
  comments_count?: number;
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  
  // User details (from join)
  display_name?: string;
  display_name2?: string;
  account_type?: 'individual' | 'couple';
  photos?: string[];
  is_verified?: boolean;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'denied';
  created_at: string;
  
  // User details (from join)
  display_name?: string;
  display_name2?: string;
  account_type?: 'individual' | 'couple';
  photos?: string[];
  is_verified?: boolean;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  category: string;
  max_capacity: number;
  price: number;
  tags: string[];
  image_url?: string | null;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  location?: string;
  event_date?: string;
  event_time?: string;
  category?: string;
  max_capacity?: number;
  price?: number;
  tags?: string[];
  image_url?: string | null;
}

class EventService {
  /**
   * Upload event image to Supabase storage
   */
  async uploadEventImage(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  }

  /**
   * Delete event image from Supabase storage
   */
  async deleteEventImage(imageUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = imageUrl.split('/event-images/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('event-images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event image:', error);
      // Don't throw - we don't want to block event deletion if image deletion fails
    }
  }

  /**
   * Fetch all active future events with author details
   */
  async getAllEvents(categoryFilter?: string, searchQuery?: string): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          profiles:author_id (
            display_name,
            display_name2,
            account_type,
            photos,
            is_verified,
            membership_tier,
            location,
            age,
            age2,
            gender,
            gender2,
            orientation,
            orientation2
          )
        `)
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0]); // Only future events

      // Apply category filter
      if (categoryFilter && categoryFilter !== 'All') {
        query = query.eq('category', categoryFilter);
      }

      // Apply search filter
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('event_date', { ascending: true }).order('event_time', { ascending: true });

      if (error) throw error;

      // Get attendees and comments count for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (event) => {
          const [attendeesResult, commentsResult] = await Promise.all([
            supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
            supabase.from('event_comments').select('id', { count: 'exact', head: true }).eq('event_id', event.id)
          ]);

          return {
            ...event,
            display_name: event.profiles?.display_name,
            display_name2: event.profiles?.display_name2,
            account_type: event.profiles?.account_type,
            photos: event.profiles?.photos,
            is_verified: event.profiles?.is_verified,
            membership_tier: event.profiles?.membership_tier,
            author_location: event.profiles?.location,
            age: event.profiles?.age,
            age2: event.profiles?.age2,
            gender: event.profiles?.gender,
            gender2: event.profiles?.gender2,
            orientation: event.profiles?.orientation,
            orientation2: event.profiles?.orientation2,
            attendees_count: attendeesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );

      return eventsWithCounts;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Fetch a single event by ID with author details
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      // Verify session before making API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const error: any = new Error('Authentication required. Please log in again.');
        error.status = 401;
        throw error;
      }

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:author_id (
            display_name,
            display_name2,
            account_type,
            photos,
            is_verified,
            membership_tier,
            location,
            age,
            age2,
            gender,
            gender2,
            orientation,
            orientation2
          )
        `)
        .eq('id', eventId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.message?.includes('JWT') || error.message?.includes('session')) {
          const authError: any = new Error('Session expired. Please log in again.');
          authError.status = 401;
          throw authError;
        }
        throw error;
      }
      if (!data) return null;

      // Get attendees and comments count
      const [attendeesResult, commentsResult] = await Promise.all([
        supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
        supabase.from('event_comments').select('id', { count: 'exact', head: true }).eq('event_id', eventId)
      ]);

      return {
        ...data,
        display_name: data.profiles?.display_name,
        display_name2: data.profiles?.display_name2,
        account_type: data.profiles?.account_type,
        photos: data.profiles?.photos,
        is_verified: data.profiles?.is_verified,
        membership_tier: data.profiles?.membership_tier,
        author_location: data.profiles?.location,
        age: data.profiles?.age,
        age2: data.profiles?.age2,
        gender: data.profiles?.gender,
        gender2: data.profiles?.gender2,
        orientation: data.profiles?.orientation,
        orientation2: data.profiles?.orientation2,
        attendees_count: attendeesResult.count || 0,
        comments_count: commentsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Fetch events by a specific user
   */
  async getEventsByUser(userId: string): Promise<Event[]> {
    try {
      // Verify session before making API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const error: any = new Error('Authentication required. Please log in again.');
        error.status = 401;
        throw error;
      }

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:author_id (
            display_name,
            display_name2,
            account_type,
            photos,
            is_verified,
            membership_tier,
            location,
            age,
            age2,
            gender,
            gender2,
            orientation,
            orientation2
          )
        `)
        .eq('author_id', userId)
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true });

      if (error) {
        if (error.message?.includes('JWT') || error.message?.includes('session')) {
          const authError: any = new Error('Session expired. Please log in again.');
          authError.status = 401;
          throw authError;
        }
        throw error;
      }

      // Get attendees and comments count for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (event) => {
          const [attendeesResult, commentsResult] = await Promise.all([
            supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
            supabase.from('event_comments').select('id', { count: 'exact', head: true }).eq('event_id', event.id)
          ]);

          return {
            ...event,
            display_name: event.profiles?.display_name,
            display_name2: event.profiles?.display_name2,
            account_type: event.profiles?.account_type,
            photos: event.profiles?.photos,
            is_verified: event.profiles?.is_verified,
            membership_tier: event.profiles?.membership_tier,
            author_location: event.profiles?.location,
            age: event.profiles?.age,
            age2: event.profiles?.age2,
            gender: event.profiles?.gender,
            gender2: event.profiles?.gender2,
            orientation: event.profiles?.orientation,
            orientation2: event.profiles?.orientation2,
            attendees_count: attendeesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );

      return eventsWithCounts;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(userId: string, eventData: CreateEventData): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          author_id: userId,
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          event_date: eventData.event_date,
          event_time: eventData.event_time,
          category: eventData.category,
          max_capacity: eventData.max_capacity,
          price: eventData.price,
          tags: eventData.tags,
          image_url: eventData.image_url || null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete event with author details
      const fullEvent = await this.getEventById(data.id);
      return fullEvent!;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, userId: string, updates: UpdateEventData): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('author_id', userId) // Ensure user owns the event
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete updated event
      const fullEvent = await this.getEventById(data.id);
      return fullEvent!;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event (soft delete by setting is_active to false)
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      // Verify user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to delete an event. Please refresh the page and try again.');
      }

      // Verify session user matches the userId parameter
      if (session.user.id !== userId) {
        throw new Error('Authentication mismatch. Please refresh the page and try again.');
      }

      // First verify the event exists and user owns it
      const { data: eventCheck, error: checkError } = await supabase
        .from('events')
        .select('id, author_id, is_active, image_url')
        .eq('id', eventId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error('Event not found or already deleted');
        }
        throw new Error('Failed to verify event ownership');
      }

      if (!eventCheck) {
        throw new Error('Event not found');
      }

      if (eventCheck.author_id !== userId) {
        throw new Error('You do not have permission to delete this event');
      }

      if (!eventCheck.is_active) {
        throw new Error('This event has already been deleted');
      }

      // Delete the event image if exists
      if (eventCheck.image_url) {
        await this.deleteEventImage(eventCheck.image_url);
      }

      // Perform the soft delete
      const { data, error } = await supabase
        .from('events')
        .update({ is_active: false })
        .eq('id', eventId)
        .eq('author_id', userId)
        .select();

      if (error) {
        if (error.code === '42501') {
          throw new Error('Permission denied. Please refresh the page and try again.');
        }
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Event deletion failed - no rows updated.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Attend an event (RSVP)
   */
  async attendEvent(eventId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: userId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error attending event:', error);
      throw error;
    }
  }

  /**
   * Unattend an event (cancel RSVP)
   */
  async unattendEvent(eventId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unattending event:', error);
      throw error;
    }
  }

  /**
   * Check if user is attending an event
   */
  async hasUserAttendedEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      // Consider pending or confirmed as "attending"
      return !!data && (data.status === 'pending' || data.status === 'confirmed');
    } catch (error) {
      console.error('Error checking attendance status:', error);
      return false;
    }
  }

  /**
   * Get attendee status for a user
   */
  async getAttendeeStatus(eventId: string, userId: string): Promise<'pending' | 'confirmed' | 'denied' | null> {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (error) {
        // 406 means column doesn't exist (status column not added yet)
        // PGRST116 means no rows found
        if (error.code === 'PGRST116' || error.message?.includes('406')) {
          console.warn('Status column may not exist yet. Run EVENT_ATTENDEE_APPROVAL_SCHEMA.sql');
          return null;
        }
        throw error;
      }
      return data?.status || null;
    } catch (error) {
      console.error('Error checking attendee status:', error);
      return null;
    }
  }

  /**
   * Approve an attendee (host only)
   */
  async approveAttendee(eventId: string, attendeeId: string, hostId: string): Promise<void> {
    try {
      // Verify host owns the event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('author_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      if (event.author_id !== hostId) {
        throw new Error('Only the event host can approve attendees');
      }

      const { error } = await supabase
        .from('event_attendees')
        .update({ status: 'confirmed' })
        .eq('id', attendeeId)
        .eq('event_id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving attendee:', error);
      throw error;
    }
  }

  /**
   * Deny an attendee (host only)
   */
  async denyAttendee(eventId: string, attendeeId: string, hostId: string): Promise<void> {
    try {
      // Verify host owns the event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('author_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      if (event.author_id !== hostId) {
        throw new Error('Only the event host can deny attendees');
      }

      const { error } = await supabase
        .from('event_attendees')
        .update({ status: 'denied' })
        .eq('id', attendeeId)
        .eq('event_id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error denying attendee:', error);
      throw error;
    }
  }

  /**
   * Get users attending an event
   */
  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    try {
      // Verify session before making API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn('No valid session when fetching attendees');
        return []; // Return empty array instead of throwing
      }

      // First get attendees
      const { data: attendees, error: attendeesError } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (attendeesError) {
        // Log the error but don't break the page
        console.warn('Could not fetch attendees (likely RLS policy issue):', attendeesError);
        // Return empty array - page will still load, just without attendees
        return [];
      }

      if (!attendees || attendees.length === 0) {
        return [];
      }

      // Then get profile data for each attendee
      const attendeesWithProfiles = await Promise.all(
        attendees.map(async (attendee) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, display_name2, account_type, photos, is_verified')
            .eq('id', attendee.user_id)
            .single();

          if (profileError) {
            console.warn(`Could not fetch profile for user ${attendee.user_id}:`, profileError);
          }

          return {
            ...attendee,
            display_name: profile?.display_name,
            display_name2: profile?.display_name2,
            account_type: profile?.account_type,
            photos: profile?.photos,
            is_verified: profile?.is_verified
          };
        })
      );

      return attendeesWithProfiles;
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      // Return empty array instead of throwing - allows page to load
      return [];
    }
  }

  /**
   * Add a comment to an event
   */
  async addComment(eventId: string, userId: string, content: string): Promise<EventComment> {
    try {
      // Insert comment first
      const { data, error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: userId,
          content: content
        })
        .select('*')
        .single();

      if (error) throw error;

      // Then fetch profile separately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, display_name2, account_type, photos, is_verified')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn(`Could not fetch profile for user ${userId}:`, profileError);
      }

      return {
        ...data,
        display_name: profile?.display_name,
        display_name2: profile?.display_name2,
        account_type: profile?.account_type,
        photos: profile?.photos,
        is_verified: profile?.is_verified
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for an event
   */
  async getEventComments(eventId: string): Promise<EventComment[]> {
    try {
      // Verify session before making API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn('No valid session when fetching comments');
        return []; // Return empty array instead of throwing
      }

      // First get comments
      const { data: comments, error: commentsError } = await supabase
        .from('event_comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        // Log the error but don't break the page
        console.warn('Could not fetch comments (likely RLS policy issue):', commentsError);
        // Return empty array - page will still load, just without comments
        return [];
      }

      if (!comments || comments.length === 0) {
        return [];
      }

      // Then get profile data for each commenter
      const commentsWithProfiles = await Promise.all(
        comments.map(async (comment) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, display_name2, account_type, photos, is_verified')
            .eq('id', comment.user_id)
            .single();

          if (profileError) {
            console.warn(`Could not fetch profile for user ${comment.user_id}:`, profileError);
          }

          return {
            ...comment,
            display_name: profile?.display_name,
            display_name2: profile?.display_name2,
            account_type: profile?.account_type,
            photos: profile?.photos,
            is_verified: profile?.is_verified
          };
        })
      );

      return commentsWithProfiles;
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Return empty array instead of throwing - allows page to load
      return [];
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
