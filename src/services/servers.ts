import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface Server {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
}

export interface ServerData {
  name: string;
  icon_url?: string;
}

export const serverService = {
  async getServer(serverId: string) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async getUserServers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('owner_id', userId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async createServer(serverData: ServerData, userId: string) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .insert([{
          ...serverData,
          owner_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async updateServer(serverId: string, serverData: Partial<ServerData>) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .update(serverData)
        .eq('id', serverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async deleteServer(serverId: string) {
    try {
      const { error } = await supabase
        .from('servers')
        .delete()
        .eq('id', serverId);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }
}; 