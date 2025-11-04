import { supabase } from './supabase';

export interface ISOPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  location: string;
  tags: string[];
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
  
  // Counts
  likes_count?: number;
  comments_count?: number;
}

export interface ISOComment {
  id: string;
  post_id: string;
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

export interface ISOLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  
  // User details (from join)
  display_name?: string;
  display_name2?: string;
  account_type?: 'individual' | 'couple';
  photos?: string[];
  is_verified?: boolean;
}

export interface CreateISOPostData {
  title: string;
  content: string;
  location: string;
  tags: string[];
}

export interface UpdateISOPostData {
  title?: string;
  content?: string;
  location?: string;
  tags?: string[];
}

class ISOPostService {
  /**
   * Fetch all active ISO posts with author details
   */
  async getAllPosts(): Promise<ISOPost[]> {
    try {
      const { data, error } = await supabase
        .from('iso_posts')
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
            age2
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes and comments count for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from('iso_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('iso_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id)
          ]);

          return {
            ...post,
            display_name: post.profiles?.display_name,
            display_name2: post.profiles?.display_name2,
            account_type: post.profiles?.account_type,
            photos: post.profiles?.photos,
            is_verified: post.profiles?.is_verified,
            membership_tier: post.profiles?.membership_tier,
            author_location: post.profiles?.location,
            age: post.profiles?.age,
            age2: post.profiles?.age2,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );

      return postsWithCounts;
    } catch (error) {
      console.error('Error fetching ISO posts:', error);
      throw error;
    }
  }

  /**
   * Fetch a single ISO post by ID with author details
   */
  async getPostById(postId: string): Promise<ISOPost | null> {
    try {
      const { data, error } = await supabase
        .from('iso_posts')
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
            age2
          )
        `)
        .eq('id', postId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Get likes and comments count
      const [likesResult, commentsResult] = await Promise.all([
        supabase.from('iso_likes').select('id', { count: 'exact', head: true }).eq('post_id', postId),
        supabase.from('iso_comments').select('id', { count: 'exact', head: true }).eq('post_id', postId)
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
        likes_count: likesResult.count || 0,
        comments_count: commentsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching ISO post:', error);
      throw error;
    }
  }

  /**
   * Fetch ISO posts by a specific user
   */
  async getPostsByUser(userId: string): Promise<ISOPost[]> {
    try {
      const { data, error } = await supabase
        .from('iso_posts')
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
            age2
          )
        `)
        .eq('author_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes and comments count for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from('iso_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('iso_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id)
          ]);

          return {
            ...post,
            display_name: post.profiles?.display_name,
            display_name2: post.profiles?.display_name2,
            account_type: post.profiles?.account_type,
            photos: post.profiles?.photos,
            is_verified: post.profiles?.is_verified,
            membership_tier: post.profiles?.membership_tier,
            author_location: post.profiles?.location,
            age: post.profiles?.age,
            age2: post.profiles?.age2,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );

      return postsWithCounts;
    } catch (error) {
      console.error('Error fetching user ISO posts:', error);
      throw error;
    }
  }

  /**
   * Create a new ISO post
   */
  async createPost(userId: string, postData: CreateISOPostData): Promise<ISOPost> {
    try {
      const { data, error } = await supabase
        .from('iso_posts')
        .insert({
          author_id: userId,
          title: postData.title,
          content: postData.content,
          location: postData.location,
          tags: postData.tags,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete post with author details
      const fullPost = await this.getPostById(data.id);
      return fullPost!;
    } catch (error) {
      console.error('Error creating ISO post:', error);
      throw error;
    }
  }

  /**
   * Update an existing ISO post
   */
  async updatePost(postId: string, userId: string, updates: UpdateISOPostData): Promise<ISOPost> {
    try {
      const { data, error } = await supabase
        .from('iso_posts')
        .update(updates)
        .eq('id', postId)
        .eq('author_id', userId) // Ensure user owns the post
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete updated post
      const fullPost = await this.getPostById(data.id);
      return fullPost!;
    } catch (error) {
      console.error('Error updating ISO post:', error);
      throw error;
    }
  }

  /**
   * Delete an ISO post (soft delete by setting is_active to false)
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('iso_posts')
        .update({ is_active: false })
        .eq('id', postId)
        .eq('author_id', userId); // Ensure user owns the post

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting ISO post:', error);
      throw error;
    }
  }

  /**
   * Like an ISO post
   */
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('iso_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error liking ISO post:', error);
      throw error;
    }
  }

  /**
   * Unlike an ISO post
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('iso_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking ISO post:', error);
      throw error;
    }
  }

  /**
   * Check if user has liked a post
   */
  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('iso_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  /**
   * Get users who liked a post
   */
  async getPostLikes(postId: string): Promise<ISOLike[]> {
    try {
      const { data, error } = await supabase
        .from('iso_likes')
        .select(`
          *,
          profiles:user_id (
            display_name,
            display_name2,
            account_type,
            photos,
            is_verified
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(like => ({
        ...like,
        display_name: like.profiles?.display_name,
        display_name2: like.profiles?.display_name2,
        account_type: like.profiles?.account_type,
        photos: like.profiles?.photos,
        is_verified: like.profiles?.is_verified
      }));
    } catch (error) {
      console.error('Error fetching post likes:', error);
      throw error;
    }
  }

  /**
   * Add a comment to an ISO post
   */
  async addComment(postId: string, userId: string, content: string): Promise<ISOComment> {
    try {
      const { data, error } = await supabase
        .from('iso_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content
        })
        .select(`
          *,
          profiles:user_id (
            display_name,
            display_name2,
            account_type,
            photos,
            is_verified
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        display_name: data.profiles?.display_name,
        display_name2: data.profiles?.display_name2,
        account_type: data.profiles?.account_type,
        photos: data.profiles?.photos,
        is_verified: data.profiles?.is_verified
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for an ISO post
   */
  async getPostComments(postId: string): Promise<ISOComment[]> {
    try {
      const { data, error } = await supabase
        .from('iso_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            display_name2,
            account_type,
            photos,
            is_verified
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(comment => ({
        ...comment,
        display_name: comment.profiles?.display_name,
        display_name2: comment.profiles?.display_name2,
        account_type: comment.profiles?.account_type,
        photos: comment.profiles?.photos,
        is_verified: comment.profiles?.is_verified
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('iso_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // Ensure user owns the comment

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const isoPostService = new ISOPostService();
