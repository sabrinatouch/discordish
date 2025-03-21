import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../user/UserAvatar';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
}

interface DirectMessageListProps {
  onSelectUser: (user: User) => void;
  selectedUserId?: string;
}

const DirectMessageList: React.FC<DirectMessageListProps> = ({
  onSelectUser,
  selectedUserId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        console.log('Current user:', user);
        if (user) {
          setCurrentUserId(user.id);
          await loadUsers(user.id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setError('Failed to get current user');
        setLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  const loadUsers = async (userId: string) => {
    try {
      console.log('Loading users for userId:', userId);
      // Get all users except the current user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', userId)
        .order('username');

      if (error) {
        console.error('Error loading users:', error);
        throw error;
      }

      console.log('Loaded users:', data);
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUsers:', error);
      setError('Failed to load users');
      setLoading(false);
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
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Direct Messages</h2>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center">No users found</p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  selectedUserId === user.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
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
        </div>
      </div>
    </div>
  );
};

export default DirectMessageList; 