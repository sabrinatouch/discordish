import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  status: string;
}

export const authService = {
  async signUp({ email, password, username }: SignUpData): Promise<{ user: UserProfile; session: Session | null }> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile in the users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            username,
            email,
            avatar_url: '',
            status: 'online',
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        user: profileData,
        session: authData.session,
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async login({ email, password }: LoginData): Promise<{ user: UserProfile; session: Session }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: profileData,
        session: data.session,
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return null;

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return profileData;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },
}; 