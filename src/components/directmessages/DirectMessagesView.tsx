import React, { useState, useEffect, useRef } from 'react';
import { directMessageService, DirectMessage } from '../../services/directMessages';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../user/UserAvatar';
import { conversationService } from '../../services/conversations';
import { UserProfile, userService } from '../../services/users';

interface DirectMessageViewProps {
  conversationId: string;
  currentUserId: string;
}

const DirectMessageView: React.FC<DirectMessageViewProps> = ({
  conversationId,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUserProfiles, setOtherUserProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const currentParticipants = await conversationService.getConversationParticipants(conversationId, currentUserId);
        const messages = await directMessageService.getDirectMessages(conversationId);

        const profiles = await Promise.all(
          currentParticipants.map((participantId: string) => userService.getUserProfile(participantId))
        );

        setOtherUserProfiles(profiles);
        setMessages(messages);
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b border-gray-700" style={{ padding: '10px' }}>
        {otherUserProfiles.map((otherUserProfile) => (
          <div key={otherUserProfile.id} className="flex items-center space-x-3">
            <UserAvatar
              username={otherUserProfile.username}
              avatarUrl={otherUserProfile.avatar_url || null}
              status={otherUserProfile.status as "online" | "offline" | "idle" | "dnd" | "invisible" | undefined}
              size="medium"
            />
            <div>
              <h2 className="text-lg font-semibold text-white">{otherUserProfile.username}</h2>
            </div>
          </div>
        ))}
      </div>

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