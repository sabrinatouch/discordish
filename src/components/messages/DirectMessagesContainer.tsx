import React, { useState } from 'react';
import DirectMessageList from './DirectMessageList';
import DirectMessageView from './DirectMessageView';
import { Conversation } from '../../services/conversations';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
}

const DirectMessagesContainer: React.FC = () => {
  //const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  // const handleSelectUser = (user: User) => {
  //   setSelectedUser(user);
  // };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="flex h-full">
      {/* Direct Messages List */}
      <div className="w-64 border-r border-gray-700">
        <DirectMessageList
          //onSelectUser={handleSelectUser}
          onSelectConversation={handleSelectConversation}
          //selectedUserId={selectedUser?.id}
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      {/* Direct Message View */}
      <div className="flex-1">
        {selectedConversation ? (
          <DirectMessageView
            conversationId={selectedConversation.id}
          />
        ) : (
          <div className="flex items-center justify-center p-4 h-full text-gray-400">
            <p>Select a user to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesContainer; 