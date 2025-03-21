import React from 'react';
import UserStatus from './UserStatus';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  statusClassName?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showLabel = true,
  size = 'small',
  className = '',
  style = {},
  statusClassName = '',
}) => {
  // Status text mapping with more descriptive labels
  const statusText = {
    online: 'Online',
    offline: 'Offline',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    invisible: 'Invisible',
  };

  // Get status color for text
  const getStatusTextColor = () => {
    switch (status) {
      case 'online': return 'rgb(67, 181, 129)'; // Discord green
      case 'idle': return 'rgb(250, 166, 26)'; // Discord yellow
      case 'dnd': return 'rgb(240, 71, 71)'; // Discord red
      case 'invisible':
      case 'offline':
      default: return 'rgb(116, 127, 141)'; // Discord gray
    }
  };

  const textColorStyle = {
    color: getStatusTextColor(),
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} style={style}>
      <UserStatus 
        status={status} 
        size={size} 
        className={statusClassName} 
        showBorder={true}
      />
      
      {showLabel && (
        <span className="text-sm" style={textColorStyle}>
          {statusText[status]}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator; 