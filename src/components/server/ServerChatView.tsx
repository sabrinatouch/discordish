import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { messageService } from '../../services/messages';
import { subscriptionService } from '../../services/subscription';
import { useUser } from '../../contexts/UserContext';
import UserAvatar from '../user/UserAvatar';
import { Message } from '../../services/messages';

const ServerChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { channelId } = useParams<{ channelId: string }>();
  const { user } = useUser();

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
        console.log("ServerChatView.tsx: fetched messages", messages);
      }
    };

    fetchMessages();
  }, [channelId]);

  useEffect(() => {
    // Subscribe to channel based off channelId to listen for new messages in channel
    if (!channelId) return;
    
    const unsubscribe = subscriptionService.subscribeToMessages<Message>(channelId,
      (payload) => {
        console.log('ServerChatView.tsx: new message:', payload.new);
        setMessages(prev => [...prev, payload.new]);
    });

    return () => {
      unsubscribe();
    };
  }, [channelId]);

  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        user_id: user.id,
        channel_id: channelId,
      };

      await messageService.sendMessage(messageData);

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
    <div className="flex flex-col h-full bg-discord-darkest">
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

export default ServerChatView; 