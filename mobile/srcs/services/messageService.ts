import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// ... (Interface definitions for Message, Conversation, etc. can be added here from the original file)

export class MessageService {
  static async getConversations(userId: string): Promise<any[]> {
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (matchError) throw matchError;
    if (!matches) return [];

    const conversations = await Promise.all(matches.map(async (match) => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const { data: profile } = await supabase.from('profiles').select('display_name, photos').eq('id', otherUserId).single();
      const { data: lastMessage } = await supabase.from('messages').select('content, created_at').eq('match_id', match.id).order('created_at', { ascending: false }).limit(1).single();
      const { count: unreadCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('match_id', match.id).eq('is_read', false).neq('sender_id', userId);

      return {
        id: match.id,
        name: profile?.display_name || 'User',
        photo: profile?.photos?.[0],
        lastMessage: lastMessage?.content,
        lastMessageAt: lastMessage?.created_at,
        unreadCount: unreadCount || 0,
      };
    }));

    return conversations;
  }

  static async getMessages(matchId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async sendMessage(matchId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ match_id: matchId, sender_id: senderId, content: content, message_type: 'text' }]);

    if (error) throw error;
    return data;
  }

  static subscribeToMessages(matchId: string, onMessage: (message: any) => void): RealtimeChannel {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (payload) => {
        onMessage(payload.new);
      })
      .subscribe();

    return channel;
  }
}
