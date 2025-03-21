import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface CreateChannelData {
  name: string;
  type: 'text' | 'voice';
  server_id: string;
}

export interface UpdateChannelData {
  name?: string;
  type?: 'text' | 'voice';
}

export const channelService = {
  async createChannel(channelData: CreateChannelData) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([channelData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getServerChannels(serverId: string) {
    try {
      console.log('Fetching channels for server ID:', serverId);
      
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching channels:', error);
        throw error;
      }
      
      console.log('Channel fetch response:', data);
      return data;
    } catch (error) {
      console.error('Error in getServerChannels:', error);
      handleSupabaseError(error);
      return []; // Return empty array to prevent undefined errors
    }
  },

  async getChannel(channelId: string) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          server:servers (
            id,
            name,
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
          )
        `)
        .eq('id', channelId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async updateChannel(channelId: string, updateData: UpdateChannelData) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .update(updateData)
        .eq('id', channelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async deleteChannel(channelId: string) {
    try {
      // Delete all messages in the channel first
      const { error: messageError } = await supabase
        .from('messages')
        .delete()
        .eq('channel_id', channelId);

      if (messageError) throw messageError;

      // Delete the channel
      const { error: channelError } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (channelError) throw channelError;
    } catch (error) {
      handleSupabaseError(error);
    }
  },
}; 