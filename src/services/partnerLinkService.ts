// Partner Link Service - Handles partner linking functionality
import { supabase } from './supabase';
import { PartnerLink, Visibility } from '../types/profile';

export const partnerLinkService = {
  /**
   * Search for existing SPICE user by email or username
   */
  searchUser: async (emailOrUsername: string): Promise<{ found: boolean; user?: any; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, displayName, email')
        .or(`email.eq.${emailOrUsername},displayName.ilike.%${emailOrUsername}%`)
        .limit(5);

      if (error) throw error;

      return {
        found: data && data.length > 0,
        user: data && data.length > 0 ? data : null,
      };
    } catch (error: any) {
      console.error('Error searching user:', error);
      return {
        found: false,
        error: error.message || 'Failed to search user',
      };
    }
  },

  /**
   * Send partner link invite
   */
  sendInvite: async (
    partnerId: string,
    relationshipType: string,
    visibility: Visibility
  ): Promise<{ success: boolean; link?: PartnerLink; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const linkData = {
        user_id: user.id,
        partner_id: partnerId,
        status: 'pending',
        relationship_type: relationshipType,
        visibility: visibility,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('partner_links')
        .insert(linkData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        link: {
          id: data.id,
          userId: data.user_id,
          partnerId: data.partner_id,
          status: data.status,
          relationshipType: data.relationship_type,
          visibility: data.visibility,
          createdAt: data.created_at,
        },
      };
    } catch (error: any) {
      console.error('Error sending invite:', error);
      return {
        success: false,
        error: error.message || 'Failed to send invite',
      };
    }
  },

  /**
   * Accept partner link invite
   */
  acceptInvite: async (linkId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('partner_links')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', linkId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      return {
        success: false,
        error: error.message || 'Failed to accept invite',
      };
    }
  },

  /**
   * Reject partner link invite
   */
  rejectInvite: async (linkId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('partner_links')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', linkId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error rejecting invite:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject invite',
      };
    }
  },

  /**
   * Get current user's partner links
   */
  getMyLinks: async (): Promise<{ success: boolean; links?: PartnerLink[]; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('partner_links')
        .select('*')
        .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`);

      if (error) throw error;

      const links: PartnerLink[] = data.map(link => ({
        id: link.id,
        userId: link.user_id,
        partnerId: link.partner_id,
        status: link.status,
        relationshipType: link.relationship_type,
        visibility: link.visibility,
        createdAt: link.created_at,
        updatedAt: link.updated_at,
      }));

      return { success: true, links };
    } catch (error: any) {
      console.error('Error getting links:', error);
      return {
        success: false,
        error: error.message || 'Failed to get partner links',
      };
    }
  },

  /**
   * Unlink partner
   */
  unlinkPartner: async (linkId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('partner_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error unlinking partner:', error);
      return {
        success: false,
        error: error.message || 'Failed to unlink partner',
      };
    }
  },
};
