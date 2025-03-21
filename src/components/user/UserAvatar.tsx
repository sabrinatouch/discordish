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

  return (
    <div className={`relative inline-flex ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gray-600 flex items-center justify-center overflow-hidden`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-full rounded-full object-cover"
          />
        ) : (
          <span className={`${textSizeClasses[size]} text-white`}>
            {username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {showStatus && (
        <div 
          className="absolute z-10 right-0 bottom-0"
        >
          <StatusIndicator 
            status={status} 
            showLabel={false} 
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatar; 