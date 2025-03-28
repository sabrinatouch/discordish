import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_ids: string[];
  content: string;
  created_at: string;
  conversation_id: string;
}

export interface SendDirectMessageData {
  content: string;
  receiver_ids: string[];
  conversation_id: string;
}

export const directMessageService = {
  async getDirectMessages(conversationId: string): Promise<DirectMessage[]> {
    try {
      const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching direct messages:', error);
        throw error;
      }
    
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async sendDirectMessage(messageData: SendDirectMessageData): Promise<DirectMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('direct_messages')
        .insert([
          {
            sender_id: user.id,
            receiver_ids: messageData.receiver_ids,
            content: messageData.content,
            conversation_id: messageData.conversation_id,
          },
        ])
        .select(`
          *,
          sender:users!direct_messages_sender_id_fkey (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  },

  async subscribeToDirectMessages(userId: string, otherUserId: string, callback: (message: DirectMessage) => void) {
    const subscription = supabase
      .channel(`direct_messages:${userId}:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id=eq.${userId},receiver_id=eq.${otherUserId}),and(sender_id=eq.${otherUserId},receiver_id=eq.${userId}))`,
        },
        async (payload) => {
          try {
            const { data: message, error } = await supabase
              .from('direct_messages')
              .select(`
                *,
                sender:users!direct_messages_sender_id_fkey (
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching new message:', error);
              return;
            }

            if (message) {
              callback(message);
            }
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}; 