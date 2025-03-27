import { handleSupabaseError, supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_messate_at: string;
  is_active: boolean;
  participants: string[];
}

export const conversationService = {
    async getAllExistingConversations(currentUserId: string) {
        // Check for existing conversation
        try{
            const { data: existingConversations, error } = await supabase
            .from('conversations')
            .select('*')
            .contains('participants', [currentUserId]);

            if (error) {
            // Handle error (e.g., log it, throw it, etc.)
            console.error('Error fetching conversations:', error);
            throw error;
            }
            return existingConversations || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            handleSupabaseError(error);
            return [];
        }
    },

    async searchForConversationByParticipantsBoolean(userId1: string, userId2: string): Promise<boolean> {
        const participants = [userId1, userId2].sort();
        const { count, error } = await supabase
            .from('conversations')
            .select('id', { count: 'exact',head: true })
            .contains('participants', participants)

        if (error || !count) {
            console.log('conversations.ts: searchForConversationByParticipantsBoolean: Conversation does not exist');
            return false;
        }

        console.log('conversations.ts: searchForConversationByParticipantsBoolean:', count);
        return count > 0;
    },

    // Get a conversation by ID
    async getConversation(conversationId: string) {    
        try {
            // Check for existing conversation
            const { data: existingConversation, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

            if (error) {
                console.error('Error fetching conversation:', error);
                handleSupabaseError(error);
                return null;
            }

            // Return the conversation ID if it exists, otherwise return null
            return existingConversation ? existingConversation.id : null;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            handleSupabaseError(error);
            return null;
        }
    },

    async getConversationByParticipants(userId1: string, userId2: string) {
        const participants = [userId1, userId2].sort();
        const { data: existingConversation, error } = await supabase
            .from('conversations')
            .select('*')
            .contains('participants', participants)
            .single();

        if (error) {
            console.error('Error searching for conversation:', error);
            handleSupabaseError(error);
            return null;
        }

        return existingConversation ? existingConversation.id : null;
    },

    async getConversationParticipants(conversationId: string, currentUserId: string) {
        const { data: conversation, error } = await supabase
        .from('conversations')
        .select('participants')
        .eq('id', conversationId)
        .single();

        if (error) {
            console.error('Error fetching conversation participants:', error);
            handleSupabaseError(error);
            return [];
        }
        
        // Filter out the current user from the participants
        const filteredParticipants = conversation?.participants.filter((id: string) => id !== currentUserId);
        return filteredParticipants || [];
    },

    async createConversation(userId1: string, userId2: string) {
        const participants = [userId1, userId2].sort();
    
        // Insert new conversation
        const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
            participants,
        })
        .select('id')
        .single();
    
        if (error) {
        // Handle error (e.g., log it, throw it, etc.)
        console.error('Error creating new conversation:', error);
        throw error;
        }
    
        return newConversation.id;
    },
};

