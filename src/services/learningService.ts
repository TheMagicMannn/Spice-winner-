import { supabase } from '@/services/supabase';

export interface ModuleProgress {
  id?: string;
  user_id: string;
  module_id: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress_percentage: number;
  quiz_score?: number;
  quiz_attempts: number;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PathBadge {
  id?: string;
  user_id: string;
  path_id: string;
  path_title: string;
  earned_at: string;
  created_at?: string;
}

class LearningService {
  /**
   * Get user's module progress
   */
  async getUserModuleProgress(userId: string, moduleId: string): Promise<ModuleProgress | null> {
    const { data, error } = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching module progress:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all module progress for a user
   */
  async getAllUserProgress(userId: string): Promise<ModuleProgress[]> {
    const { data, error } = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching all progress:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Start a module (mark as in-progress)
   */
  async startModule(userId: string, moduleId: string): Promise<ModuleProgress | null> {
    // Check if progress already exists
    const existing = await this.getUserModuleProgress(userId, moduleId);
    
    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('user_module_progress')
      .insert({
        user_id: userId,
        module_id: moduleId,
        status: 'in-progress',
        progress_percentage: 0,
        quiz_attempts: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting module:', error);
      return null;
    }

    return data;
  }

  /**
   * Update module progress
   */
  async updateModuleProgress(
    userId: string, 
    moduleId: string, 
    progressPercentage: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from('user_module_progress')
      .update({
        progress_percentage: progressPercentage,
        status: progressPercentage >= 100 ? 'completed' : 'in-progress',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('module_id', moduleId);

    if (error) {
      console.error('Error updating progress:', error);
      return false;
    }

    return true;
  }

  /**
   * Complete a module with quiz score
   */
  async completeModule(
    userId: string, 
    moduleId: string, 
    quizScore: number
  ): Promise<boolean> {
    const existing = await this.getUserModuleProgress(userId, moduleId);
    
    const { error } = await supabase
      .from('user_module_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        status: 'completed',
        progress_percentage: 100,
        quiz_score: quizScore,
        quiz_attempts: (existing?.quiz_attempts || 0) + 1,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error completing module:', error);
      return false;
    }

    return true;
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(userId: string): Promise<PathBadge[]> {
    const { data, error } = await supabase
      .from('learning_path_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Award a path completion badge
   */
  async awardPathBadge(
    userId: string, 
    pathId: string, 
    pathTitle: string
  ): Promise<PathBadge | null> {
    // Check if badge already exists
    const { data: existing } = await supabase
      .from('learning_path_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('path_id', pathId)
      .single();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('learning_path_badges')
      .insert({
        user_id: userId,
        path_id: pathId,
        path_title: pathTitle,
        earned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      return null;
    }

    return data;
  }

  /**
   * Check if user has completed all modules in a path
   */
  async checkPathCompletion(userId: string, pathId: string, moduleIds: string[]): Promise<boolean> {
    const progress = await this.getAllUserProgress(userId);
    
    const completedModules = progress.filter(p => 
      moduleIds.includes(p.module_id) && p.status === 'completed'
    );

    return completedModules.length === moduleIds.length;
  }
}

export const learningService = new LearningService();
