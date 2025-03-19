import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface SendMessageData {
  content: string;
  channel_id: string;
  user_id: string;
  file_url?: string;
  reply_to_id?: string;
}

export interface UpdateMessageData {
  content?: string;
  file_url?: string;
}

export const messageService = {
  async sendMessage(messageData: SendMessageData) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          user:users (
            id,
            username,
            avatar_url,
            status
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getChannelMessages(channelId: string, limit: number = 50, before?: Date) {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          user:users (
            id,
            username,
            avatar_url,
            status
          ),
          reactions (
            id,
            emoji,
            user:users (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async deleteMessage(messageId: string) {
    try {
      // Delete reactions first
      const { error: reactionError } = await supabase
        .from('reactions')
        .delete()
        .eq('message_id', messageId);

      if (reactionError) throw reactionError;

      // Delete the message
      const { error: messageError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (messageError) throw messageError;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async searchMessages(query: string, channelId?: string, limit: number = 50) {
    try {
      let searchQuery = supabase
        .from('messages')
        .select(`
          *,
          user:users (
            id,
            username,
            avatar_url,
            status
          ),
          reactions (
            id,
            emoji,
            user:users (
              id,
              username,
              avatar_url
            )
          )
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (channelId) {
        searchQuery = searchQuery.eq('channel_id', channelId);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },
}; 