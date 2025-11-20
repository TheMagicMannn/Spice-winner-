// src/services/privateContentService.ts
import { supabase } from './supabase';

export interface PrivateContent {
  id: string;
  owner_id: string;
  content_type: 'photo' | 'video';
  storage_path: string;
  thumbnail_path?: string;
  description?: string;
  uploaded_at: string;
  is_active: boolean;
}

export interface PrivateContentAccess {
  id: string;
  owner_id: string;
  granted_to_id: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export class PrivateContentService {
  /**
   * Get user's private content
   */
  static async getUserPrivateContent(userId: string): Promise<PrivateContent[]> {
    try {
      const { data, error } = await supabase
        .from('private_content')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching private content:', error);
      throw error;
    }
  }

  /**
   * Get private content with access check
   */
  static async getPrivateContentWithAccess(
    ownerId: string,
    viewerId: string
  ): Promise<PrivateContent[]> {
    try {
      // First check if viewer has access
      const hasAccess = await this.checkAccess(ownerId, viewerId);
      
      if (!hasAccess && ownerId !== viewerId) {
        return [];
      }

      const { data, error } = await supabase
        .from('private_content')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching private content with access:', error);
      throw error;
    }
  }

  /**
   * Upload private content
   */
  static async uploadPrivateContent(
    userId: string,
    file: File,
    contentType: 'photo' | 'video',
    description?: string
  ): Promise<PrivateContent> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('private-content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL (though it's protected by RLS)
      const { data: urlData } = supabase.storage
        .from('private-content')
        .getPublicUrl(fileName);

      // Create database record
      const { data, error } = await supabase
        .from('private_content')
        .insert({
          owner_id: userId,
          content_type: contentType,
          storage_path: uploadData.path,
          description: description
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading private content:', error);
      throw error;
    }
  }

  /**
   * Delete private content
   */
  static async deletePrivateContent(contentId: string): Promise<void> {
    try {
      // Get content info first
      const { data: content, error: fetchError } = await supabase
        .from('private_content')
        .select('storage_path')
        .eq('id', contentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('private-content')
        .remove([content.storage_path]);

      if (storageError) console.error('Storage deletion error:', storageError);

      // Delete from database
      const { error } = await supabase
        .from('private_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting private content:', error);
      throw error;
    }
  }

  /**
   * Grant access to private content
   */
  static async grantAccess(
    ownerId: string,
    grantedToId: string,
    expiresAt?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('grant_private_content_access', {
        p_owner_id: ownerId,
        p_granted_to_id: grantedToId,
        p_expires_at: expiresAt || null
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  }

  /**
   * Revoke access to private content
   */
  static async revokeAccess(ownerId: string, grantedToId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('revoke_private_content_access', {
        p_owner_id: ownerId,
        p_granted_to_id: grantedToId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error revoking access:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to private content
   */
  static async checkAccess(ownerId: string, viewerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_private_content_access', {
        p_owner_id: ownerId,
        p_viewer_id: viewerId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }

  /**
   * Get users who have access to owner's private content
   */
  static async getUsersWithAccess(ownerId: string): Promise<Array<{
    user_id: string;
    granted_at: string;
    expires_at?: string;
    display_name?: string;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_users_with_private_access', {
        p_owner_id: ownerId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting users with access:', error);
      throw error;
    }
  }

  /**
   * Get storage URL for private content
   */
  static getPrivateContentUrl(storagePath: string): string {
    const { data } = supabase.storage
      .from('private-content')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  }
}

export default PrivateContentService;
