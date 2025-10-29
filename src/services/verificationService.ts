// src/services/verificationService.ts
import { supabase } from './supabase';

export type VerificationMethod = 'selfie' | 'fetlife';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface VerificationRequest {
  id?: string;
  user_id?: string;
  method: VerificationMethod;
  status?: VerificationStatus;
  email: string;
  
  // Selfie method fields
  selfie_photo_url?: string;
  verification_date?: string;
  
  // FetLife method fields
  fetlife_profile_url?: string;
  fetlife_screenshot_url?: string;
  
  // Couple account - Partner 2
  partner2_email?: string;
  partner2_selfie_photo_url?: string;
  partner2_fetlife_profile_url?: string;
  partner2_fetlife_screenshot_url?: string;
  
  // Admin review fields
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface VerificationSubmission {
  method: VerificationMethod;
  email: string;
  
  // For selfie method
  selfieFile?: File;
  verificationDate?: string;
  
  // For FetLife method
  fetlifeProfileUrl?: string;
  fetlifeScreenshotFile?: File;
  
  // For couple accounts
  partner2Email?: string;
  partner2SelfieFile?: File;
  partner2FetlifeProfileUrl?: string;
  partner2FetlifeScreenshotFile?: File;
}

class VerificationService {
  /**
   * Check if user has an existing verification request
   */
  async getExistingRequest(userId: string): Promise<VerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching verification request:', error);
      return null;
    }
  }

  /**
   * Upload verification photo to storage
   */
  async uploadVerificationPhoto(userId: string, file: File, fileType: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${fileType}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('verification-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }

    // Get public URL (note: bucket is private, so this URL requires auth)
    const { data: { publicUrl } } = supabase.storage
      .from('verification-uploads')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Submit verification request
   */
  async submitVerification(
    userId: string,
    submission: VerificationSubmission
  ): Promise<VerificationRequest> {
    try {
      // Check for existing pending request
      const existing = await this.getExistingRequest(userId);
      if (existing && existing.status === 'pending') {
        throw new Error('You already have a pending verification request. Please wait for admin review.');
      }

      const requestData: Partial<VerificationRequest> = {
        user_id: userId,
        method: submission.method,
        email: submission.email,
        status: 'pending'
      };

      // Handle selfie method
      if (submission.method === 'selfie') {
        if (!submission.selfieFile || !submission.verificationDate) {
          throw new Error('Selfie photo and verification date are required');
        }

        // Upload selfie photo
        const selfieUrl = await this.uploadVerificationPhoto(userId, submission.selfieFile, 'selfie');
        requestData.selfie_photo_url = selfieUrl;
        requestData.verification_date = submission.verificationDate;

        // Handle couple account partner 2
        if (submission.partner2Email && submission.partner2SelfieFile) {
          const partner2SelfieUrl = await this.uploadVerificationPhoto(
            userId,
            submission.partner2SelfieFile,
            'partner2_selfie'
          );
          requestData.partner2_email = submission.partner2Email;
          requestData.partner2_selfie_photo_url = partner2SelfieUrl;
        }
      }

      // Handle FetLife method
      if (submission.method === 'fetlife') {
        if (!submission.fetlifeProfileUrl || !submission.fetlifeScreenshotFile) {
          throw new Error('FetLife profile URL and screenshot are required');
        }

        // Upload FetLife screenshot
        const screenshotUrl = await this.uploadVerificationPhoto(
          userId,
          submission.fetlifeScreenshotFile,
          'fetlife_screenshot'
        );
        requestData.fetlife_profile_url = submission.fetlifeProfileUrl;
        requestData.fetlife_screenshot_url = screenshotUrl;

        // Handle couple account partner 2
        if (submission.partner2Email && submission.partner2FetlifeProfileUrl && submission.partner2FetlifeScreenshotFile) {
          const partner2ScreenshotUrl = await this.uploadVerificationPhoto(
            userId,
            submission.partner2FetlifeScreenshotFile,
            'partner2_fetlife_screenshot'
          );
          requestData.partner2_email = submission.partner2Email;
          requestData.partner2_fetlife_profile_url = submission.partner2FetlifeProfileUrl;
          requestData.partner2_fetlife_screenshot_url = partner2ScreenshotUrl;
        }
      }

      // Insert verification request
      const { data, error } = await supabase
        .from('verification_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      throw new Error(error.message || 'Failed to submit verification request');
    }
  }

  /**
   * Get all pending verification requests (Admin only)
   */
  async getPendingVerifications(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (
            display_name,
            display_name2,
            account_type,
            photos
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      throw error;
    }
  }

  /**
   * Get all verification requests (Admin only)
   */
  async getAllVerifications(status?: VerificationStatus): Promise<any[]> {
    try {
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (
            display_name,
            display_name2,
            account_type,
            photos
          )
        `);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching verifications:', error);
      throw error;
    }
  }

  /**
   * Approve verification request (Admin only)
   */
  async approveVerification(requestId: string, adminId: string, adminNotes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  }

  /**
   * Reject verification request (Admin only)
   */
  async rejectVerification(
    requestId: string,
    adminId: string,
    rejectionReason: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for verification photo (Admin only)
   */
  async getVerificationPhotoUrl(path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('verification-uploads')
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  /**
   * Check if current user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data?.is_admin || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

export const verificationService = new VerificationService();
