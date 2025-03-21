import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { messageService } from '../../services/messages';
import { authService } from '../../services/auth';
import { subscriptionService } from '../../services/subscription';
import UserAvatar from '../user/UserAvatar';

interface Message {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { channelId } = useParams<{ channelId: string }>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!channelId) return;
        
        const data = await messageService.getChatMessages(channelId);
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages using subscriptionService
    const unsubscribe = channelId ? 
      subscriptionService.subscribeToMessages<Message>(
        channelId,
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
          }
        }
      ) : () => {};

    return () => {
      unsubscribe();
    };
  }, [channelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId) return;

    try {
      // Get current user from authService
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      const messageData = {
        content: newMessage.trim(),
        user_id: currentUser.id,
        channel_id: channelId,
      };

      const data = await messageService.sendMessage(messageData);
      if (data) {
        setMessages(prev => [...prev, data]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Clear the message input despite the error
      setNewMessage('');
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
    <div className="flex-1 h-screen bg-gray-700 flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <UserAvatar 
              username={message.user.username}
              avatarUrl={message.user.avatar_url}
              size="medium"
              showStatus={false}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{message.user.username}</span>
                <span className="text-gray-400 text-sm">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-300 mt-1">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-600">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView; 