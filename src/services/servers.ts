import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface CreateServerData {
  name: string;
  description: string;
  icon_url: string;
  owner_id: string;
}

export interface UpdateServerData {
  name?: string;
  description?: string;
  icon_url?: string;
}

export const serverService = {
  async createServer(serverData: CreateServerData) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .insert([serverData])
        .select()
        .single();

      if (error) throw error;

      // Create server member record for the owner
      const { error: memberError } = await supabase
        .from('server_members')
        .insert([
          {
            server_id: data.id,
            user_id: serverData.owner_id,
            role: 'owner',
          },
        ]);

      if (memberError) throw memberError;

      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getServer(serverId: string) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select(`
          *,
          server_members (
            user_id,
            role,
            users (
              id,
              username,
              avatar_url,
              status
            )
          )
        `)
        .eq('id', serverId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async deleteServer(serverId: string) {
    try {
      // Delete server members first
      const { error: memberError } = await supabase
        .from('server_members')
        .delete()
        .eq('server_id', serverId);

      if (memberError) throw memberError;

      // Delete server
      const { error: serverError } = await supabase
        .from('servers')
        .delete()
        .eq('id', serverId);

      if (serverError) throw serverError;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getUserServers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('server_members')
        .select(`
          servers (
            id,
            name,
            description,
            icon_url,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(member => member.servers);
    } catch (error) {
      handleSupabaseError(error);
    }
  },
}; 