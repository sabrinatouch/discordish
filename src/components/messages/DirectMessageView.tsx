import React, { useState, useEffect, useRef } from 'react';
import { directMessageService, DirectMessage } from '../../services/directMessages';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../user/UserAvatar';
import StatusIndicator from '../user/StatusIndicator';

interface DirectMessageViewProps {
  otherUserId: string;
  otherUsername: string;
  otherUserAvatar?: string | null;
}

const DirectMessageView: React.FC<DirectMessageViewProps> = ({
  otherUserId,
  otherUsername,
  otherUserAvatar,
}) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        loadMessages(user.id);
      }
    };
    getCurrentUser();
  }, [otherUserId]);

  const loadMessages = async (userId: string) => {
    try {
      const messages = await directMessageService.getDirectMessages(userId, otherUserId);
      setMessages(messages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    const setupSubscription = async () => {
      const unsubscribe = await directMessageService.subscribeToDirectMessages(
        currentUserId,
        otherUserId,
        (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
        }
      );
      unsubscribeRef.current = unsubscribe;
    };

    setupSubscription();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    try {
      const sentMessage = await directMessageService.sendDirectMessage({
        content: newMessage,
        receiver_id: otherUserId,
      });
      
      // Update local state immediately
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
      <div className="flex items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <UserAvatar
            username={otherUsername}
            avatarUrl={otherUserAvatar || null}
            status="online"
            size="medium"
          />
          <div>
            <h2 className="text-lg font-semibold text-white">{otherUsername}</h2>
            <StatusIndicator status="online" size="small" />
          </div>
        </div>
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
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
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