import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { serverMemberService } from '../../services/serverMembers';
import { userService, UserProfile } from '../../services/users';
import UserAvatar from '../user/UserAvatar';

const ServerUserList: React.FC = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { serverId } = useParams<{ serverId: string }>();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const serverMembers = await serverMemberService.getServerMembers(serverId!);
        console.log('Loading server members for serverId:', serverId);
        console.log('Loaded server members:', serverMembers);

        const userPromises = serverMembers.map(async (member) => {
          const userData = await userService.getUserProfile(member.user_id);
          return { ...member, ...userData };
        });

        const users = await Promise.all(userPromises);
        setMembers(users);
      } catch (error) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [serverId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-54 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Server Members</h2>
        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-gray-400 text-center">No users found</p>
          ) : (
            members.map((member) => (
              <button
                key={member.id}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors
                    ${member.status === 'offline' || member.status === 'invisible' ? 'opacity-25' : ''} 
                `}
              >
                <div className="relative">
                    <UserAvatar
                        key={member.id} 
                        username={member.username}
                        avatarUrl={member.avatar_url}
                        status={member.status}
                        size="medium"
                    />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-white font-medium">{member.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerUserList; 