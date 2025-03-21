import React from 'react';

interface UserStatusProps {
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showBorder?: boolean;
}

const UserStatus: React.FC<UserStatusProps> = ({
  status,
  size = 'medium',
  className = '',
  showBorder = true,
}) => {
  // Size mapping for the dot
  const sizeMap = {
    small: { size: '12px' },
    medium: { size: '16px' },
    large: { size: '20px' },
  };

  const { size: dotSize } = sizeMap[size];
  const borderSize = showBorder ? '3px' : '0';
  
  // Status color mapping
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'rgb(67, 181, 129)'; // Discord green
      case 'idle': return 'rgb(250, 166, 26)'; // Discord yellow
      case 'dnd': return 'rgb(240, 71, 71)'; // Discord red
      case 'invisible':
      case 'offline':
      default: return 'rgb(116, 127, 141)'; // Discord gray
    }
  };

  // Status text mapping for accessibility
  const statusText = {
    online: 'Online',
    offline: 'Offline',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    invisible: 'Invisible',
  };

  // Container styles (colored circle)
  const containerStyles: React.CSSProperties = {
    height: dotSize,
    width: dotSize,
    backgroundColor: getStatusColor(),
    borderRadius: '50%',
    display: 'inline-block',
    border: showBorder ? `${borderSize} solid #202225` : 'none',
  };

  return (
    <span 
      className={className}
      style={containerStyles}
      aria-label={`Status: ${statusText[status]}`}
      title={`Status: ${statusText[status]}`}
    />
  );
};

export default UserStatus; 