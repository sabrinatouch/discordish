import React, { useState } from 'react';
import DirectMessageList from './DirectMessageList';
import DirectMessageView from './DirectMessageView';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
}

const DirectMessagesContainer: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex h-full">
      {/* Direct Messages List */}
      <div className="w-64 border-r border-gray-700">
        <DirectMessageList
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUser?.id}
        />
      </div>

      {/* Direct Message View */}
      <div className="flex-1">
        {selectedUser ? (
          <DirectMessageView
            otherUserId={selectedUser.id}
            otherUsername={selectedUser.username}
            otherUserAvatar={selectedUser.avatar_url}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select a user to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesContainer; 