import React, { useEffect, useState } from 'react';
import DirectMessageList from './DirectMessagesList';
import DirectMessageView from './DirectMessagesView';
import { Conversation } from '../../services/conversations';
import { useUser } from '../../contexts/UserContext';
import { useParams } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
}

const DirectMessagesContainer: React.FC = () => {
  const { user } = useUser();
  const { conversationId: paramConversationId } = useParams<{ conversationId: string }>();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(paramConversationId || null);

  useEffect(() => {
    if (paramConversationId) {
      setSelectedConversationId(paramConversationId);
    }
  }, [paramConversationId]);

  return (
    <div className="flex h-full">
      {/* Direct Messages List */}
      <div className="w-64 border-r border-gray-700">
        <DirectMessageList
          onSelectConversation={(conversation: Conversation) => setSelectedConversationId(conversation.id)}
          selectedConversationId={selectedConversationId || undefined}
          currentUserId={user.id}
        />
      </div>

      {/* Direct Message View */}
      <div className="flex-1">
        {selectedConversationId ? (
          <DirectMessageView
            conversationId={selectedConversationId}
            currentUserId={user.id}
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