import React, { useState, useEffect, useRef } from 'react';
import { directMessageService, DirectMessage } from '../../services/directMessages';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../user/UserAvatar';
import { subscriptionService } from '../../services/subscription';
import { conversationService, Conversation } from '../../services/conversations';
import { UserProfile, userService } from '../../services/users';

interface DirectMessageViewProps {
  conversationId: string;
}

const DirectMessageView: React.FC<DirectMessageViewProps> = ({
  conversationId,
}) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(conversationId);
  const [otherUsers, setOtherUsers] = useState<UserProfile[]>([]);
  const [currentParticipants, setCurrentParticipants] = useState<string[]>([]);
  const [currentOtherParticipants, setCurrentOtherParticipants] = useState<string[]>([]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        loadConversation(conversationId);
      }
    };
    getCurrentUser();
  }, [conversationId]);

  useEffect(() => {
    if (!currentUserId) return;

    console.log('DirectMessageView.tsx: Setting up conversation subscription...');
    const conversationSubscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'direct_messages',
      }, 
      (payload) => {
        // Handle changes to the conversation
        console.log('DirectMessageView.tsx: Received new direct message:', payload.new);
        setMessages(payload.new as DirectMessage[]);
      })
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
    };
  }, [currentUserId, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (conversationId: string) => {
    try {
      //const currentParticipants = await conversationService.getConversationParticipants(conversationId);
      const messages = await directMessageService.getDirectMessages(conversationId);

      setCurrentParticipants(currentParticipants);
      setMessages(messages);
      setLoading(false);

      console.log('currentParticipants', currentParticipants);

      const filteredParticipants = currentParticipants.filter((id: string) => id !== currentUserId);
      console.log('filteredParticipants', filteredParticipants);

      filteredParticipants.forEach(async (participantId: string) => {
        const user = await userService.getUserProfile(participantId);
        setOtherUsers((prev) => [...prev, user]);
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // const handleSendMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newMessage.trim() || !currentUserId) return;

  //   try {
  //     const sentMessage = await directMessageService.sendDirectMessage({
  //       content: newMessage,
  //       receiver_id: otherUserId,
  //     });
      
  //     // Update local state immediately
  //     setMessages(prev => [...prev, sentMessage]);
  //     setNewMessage('');
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-700" style={{ padding: '10px' }}>
          {/* {otherUsers.map((otherUser) => (
            <div key={otherUser.id} className="flex items-center space-x-3">
            <UserAvatar
              key={otherUser.id}
              username={otherUser.username}
              avatarUrl={otherUser.avatar_url || null}
              status={otherUser.status as "online" | "offline" | "idle" | "dnd" | "invisible" | undefined}
              size="medium"
            />
            <div>
              <h2 className="text-lg font-semibold text-white">{otherUser.username}</h2>
              </div>
            </div>
          ))} */}
          <p>other user</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {/* <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700"> */}
      <form onSubmit={() => {}} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectMessageView; 