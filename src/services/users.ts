import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  bio: string | null;
  created_at: string;
}

export interface UserUpdateData {
  username?: string;
  avatar_url?: string;
  status?: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  bio?: string;
}

export const userService = {
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async updateUserProfile(userId: string, userData: UserUpdateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async updateUserStatus(userId: string, status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible') {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId)
        .select('status')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async searchUsers(query: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },
}; 