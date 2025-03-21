import React from 'react';
import StatusIndicator from './StatusIndicator';

interface UserAvatarProps {
  username: string;
  avatarUrl: string | null;
  status?: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl,
  status = 'offline',
  size = 'medium',
  showStatus = true,
  className = '',
}) => {
  // Size mapping for avatar container
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-20 h-20',
  };

  // Size mapping for text when no avatar
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-2xl',
  };

  // Status size mapping - converting avatar size to appropriate status size
  const statusSizeMap = {
    small: 'small',
    medium: 'small',
    large: 'medium',
  } as const;

  // Determine positioning offsets for status indicator to overlay the avatar
  const getStatusPositionStyle = () => {
    switch (size) {
      case 'small':
        return { right: '0', bottom: '0', transform: 'translate(25%, 25%)' };
      case 'medium':
        return { right: '0', bottom: '0', transform: 'translate(25%, 25%)' };
      case 'large':
        return { right: '0', bottom: '0', transform: 'translate(25%, 25%)' };
      default:
        return { right: '0', bottom: '0', transform: 'translate(25%, 25%)' };
    }
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gray-600 flex items-center justify-center overflow-hidden`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            width={'40px'}
            height={'40px'}
            className="rounded-full object-cover"
          />
        ) : (
          <span className={`${textSizeClasses[size]} text-white`}>
            {username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {showStatus && (
        <div 
          className="absolute z-10"
          style={getStatusPositionStyle()}
        >
          <StatusIndicator 
            status={status} 
            showLabel={false} 
            size={statusSizeMap[size]} 
            className="p-0 m-0" 
            statusClassName="border-2 border-gray-800" 
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatar; 