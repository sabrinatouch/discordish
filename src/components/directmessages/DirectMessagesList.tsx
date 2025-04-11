import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../user/UserAvatar';
import { Conversation, conversationService } from '../../services/conversations';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscription';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
}

interface DirectMessageListProps {
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
}

const DirectMessageList: React.FC<DirectMessageListProps> = ({
  onSelectConversation,
  currentUserId
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const conversationsEndRef = useRef<HTMLDivElement>(null);
  const [userDetails, setUserDetails] = useState<{ [key: string]: User }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        //console.log('DirectMessagesList.tsx: Loading assets...');
        //console.log('DirectMessagesList.tsx: Current user:', currentUserId);
        if (currentUserId) {
          loadUsers(currentUserId);
          loadExistingConversations(currentUserId);
        }
      } catch (error) {
        //console.error('Error getting current user:', error);
        setError('Failed to get current user');
        setLoading(false);
      }
    };
    loadAssets();

  }, [currentUserId]);

  useEffect(() => {
    conversationsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  useEffect(() => {
    // Subscribe to new conversations involving the current user
    const unsubscribe = subscriptionService.subscribeToConversations_ForUser<Conversation>(
      currentUserId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          console.log('DirectMessagesList.tsx: New conversation detected:', payload.new);
          setConversations((prevConversations) => [...prevConversations, payload.new]);
          loadExistingConversations(currentUserId); // This made it work
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const handleSelectUser = async (selectedUser: User) => {
    try {
      setIsModalOpen(false);
      if (!currentUserId) {
        //console.error('No current user ID found');
        return;
      }

      //console.log('Current user ID:', currentUserId);
      //console.log('Selected user ID:', selectedUser.id);

      const checkConversationExists = await conversationService.searchForConversationByParticipantsBoolean(
        currentUserId,
        selectedUser.id
      );

      let conversationId: string;

      //console.log('DirectMessagesList.tsx: checkConversationExists:', checkConversationExists);
      if (checkConversationExists) {
        const existingConversationId = await conversationService.getConversationByParticipants(
          currentUserId,
          selectedUser.id
        );
        conversationId = existingConversationId;
      } else {
        //console.log('DirectMessagesList.tsx: Creating new conversation...');
        conversationId = await conversationService.createConversation(
          currentUserId,
          selectedUser.id
        );
        //console.log('New conversation created:', conversationId);
        loadExistingConversations(currentUserId);
      }

      // Navigate to the conversation
      navigate(`/channels/@me/${conversationId}`);
    } catch (error) {
      console.error('Error handling user selection:', error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    //console.log('DirectMessagesList.tsx: handleSelectConversation...');
    onSelectConversation(conversation);
  };

  const loadExistingConversations = async (currentUserId: string) => {
    try {
      const conversations = await conversationService.getAllExistingConversations(currentUserId);
      //console.log('Loaded conversations:', conversations);

      // Fetch user details for each conversation
      const userDetailsMap: { [key: string]: User } = {};
      await Promise.all(conversations.map(async (conversation) => {
        const otherUserId = conversation.participants.find((id: string) => id !== currentUserId);
        if (otherUserId && !userDetailsMap[otherUserId]) {
          const { data: otherUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', otherUserId)
            .single();

          if (error) {
            console.error('Error fetching user for conversation:', error);
            //throw error;
          }

          userDetailsMap[otherUserId] = otherUser;
        }
      }));

      setUserDetails(userDetailsMap);
      setConversations(conversations);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadConversations:', error);
      //setLoading(false);
    }
  };

  const loadUsers = async (userId: string) => {
    try {
      //console.log('Loading users for userId:', userId);
      // Get all users except the current user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', userId)
        .order('username');

      if (error) {
        console.error('Error loading users:', error);
        //throw error;
      }

      //console.log('Loaded users:', data);
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUsers:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-discord-darker">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white mb-4">Direct Messages</h2>
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 hover:rounded-2xl transition-all duration-200"
            onClick={() => {
              setIsModalOpen(!isModalOpen);
            }}
          >
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className={`${isModalOpen ? 'block' : 'hidden'} absolute z-20 top-15 mt-2 w-56 rounded-md bg-gray-800 p-4 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in`}>
            <ul className="space-y-2">
              {users.length === 0 ? (
                <p className="text-gray-400 text-center">No users found</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors`}
                  >
                    <div className="relative">
                      <UserAvatar
                        username={user.username}
                        avatarUrl={user.avatar_url}
                        status={user.status}
                        size="medium"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{user.username}</p>
                    </div>
                  </button>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {conversations.length === 0 ? (
            <p className="text-gray-400 text-center">No conversations found</p>
          ) : (
            conversations.map((conversation) => {
              const otherUserId = conversation.participants.find((id: string) => id !== currentUserId);
              const otherUser = otherUserId ? userDetails[otherUserId] : null;
              return (
                <div key={conversation.id}>
                  <Link 
                    to={`/channels/@me/${conversation.id}`}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <button
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors`}
                    >
                      <div className="relative">
                        <UserAvatar
                          username={otherUser?.username || ''}
                          avatarUrl={otherUser?.avatar_url || null}
                          status={otherUser?.status || 'offline'}
                          size="medium"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{otherUser?.username || ''}</p>
                      </div>
                    </button>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessageList;