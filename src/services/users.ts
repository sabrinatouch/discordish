import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatar_url?: string;
  status?: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
}

export const userService = {
  async getProfile(userId: string) {
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
    }
  },

  async updateProfile(userId: string, updateData: UpdateProfileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
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