import React from 'react';
import StatusIndicator from './StatusIndicator';
import UserStatus from './UserStatus';
import UserAvatar from './UserAvatar';

const StatusTest: React.FC = () => {
  return (
    <div className="p-6 bg-discord-dark text-white">
      <h1 className="text-2xl font-bold mb-6">Status Indicators</h1>
      
      <div className="space-y-8">
        {/* Status Indicator Component */}
        <section>
          <h2 className="text-xl font-semibold mb-4">StatusIndicator Component</h2>
          <div className="space-y-2">
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Small</h3>
              <div className="space-y-2">
                <StatusIndicator status="online" />
                <StatusIndicator status="idle" />
                <StatusIndicator status="dnd" />
                <StatusIndicator status="offline" />
                <StatusIndicator status="invisible" />
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Medium</h3>
              <div className="space-y-2">
                <StatusIndicator status="online" size="medium" />
                <StatusIndicator status="idle" size="medium" />
                <StatusIndicator status="dnd" size="medium" />
                <StatusIndicator status="offline" size="medium" />
                <StatusIndicator status="invisible" size="medium" />
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Large</h3>
              <div className="space-y-2">
                <StatusIndicator status="online" size="large" />
                <StatusIndicator status="idle" size="large" />
                <StatusIndicator status="dnd" size="large" />
                <StatusIndicator status="offline" size="large" />
                <StatusIndicator status="invisible" size="large" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Raw UserStatus Component */}
        <section>
          <h2 className="text-xl font-semibold mb-4">UserStatus Components</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <h3 className="text-md font-medium mb-2">Small</h3>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <UserStatus status="online" size="small" />
                  <span className="text-xs mt-1">Online</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="idle" size="small" />
                  <span className="text-xs mt-1">Idle</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="dnd" size="small" />
                  <span className="text-xs mt-1">DND</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="offline" size="small" />
                  <span className="text-xs mt-1">Offline</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="invisible" size="small" />
                  <span className="text-xs mt-1">Invisible</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Medium</h3>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <UserStatus status="online" size="medium" />
                  <span className="text-xs mt-1">Online</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="idle" size="medium" />
                  <span className="text-xs mt-1">Idle</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="dnd" size="medium" />
                  <span className="text-xs mt-1">DND</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="offline" size="medium" />
                  <span className="text-xs mt-1">Offline</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="invisible" size="medium" />
                  <span className="text-xs mt-1">Invisible</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Large</h3>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <UserStatus status="online" size="large" />
                  <span className="text-xs mt-1">Online</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="idle" size="large" />
                  <span className="text-xs mt-1">Idle</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="dnd" size="large" />
                  <span className="text-xs mt-1">DND</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="offline" size="large" />
                  <span className="text-xs mt-1">Offline</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserStatus status="invisible" size="large" />
                  <span className="text-xs mt-1">Invisible</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* UserAvatar with Status */}
        <section>
          <h2 className="text-xl font-semibold mb-4">UserAvatar with Status</h2>
          <div className="flex flex-wrap gap-6">
            <UserAvatar username="User 1" avatarUrl="/avatar1.png" status="online" size="small" />
            <UserAvatar username="User 2" avatarUrl="/avatar2.png" status="idle" size="small" />
            <UserAvatar username="User 3" avatarUrl="/avatar3.png" status="dnd" size="small" />
            <UserAvatar username="User 4" avatarUrl="/avatar4.png" status="offline" size="small" />
            <UserAvatar username="User 5" avatarUrl="/avatar5.png" status="invisible" size="small" />
          </div>
          
          <div className="flex flex-wrap gap-6 mt-4">
            <UserAvatar username="User 1" avatarUrl="/avatar1.png" status="online" size="medium" />
            <UserAvatar username="User 2" avatarUrl="/avatar2.png" status="idle" size="medium" />
            <UserAvatar username="User 3" avatarUrl="/avatar3.png" status="dnd" size="medium" />
            <UserAvatar username="User 4" avatarUrl="/avatar4.png" status="offline" size="medium" />
            <UserAvatar username="User 5" avatarUrl="/avatar5.png" status="invisible" size="medium" />
          </div>
          
          <div className="flex flex-wrap gap-6 mt-4">
            <UserAvatar username="User 1" avatarUrl="/avatar1.png" status="online" size="large" />
            <UserAvatar username="User 2" avatarUrl="/avatar2.png" status="idle" size="large" />
            <UserAvatar username="User 3" avatarUrl="/avatar3.png" status="dnd" size="large" />
            <UserAvatar username="User 4" avatarUrl="/avatar4.png" status="offline" size="large" />
            <UserAvatar username="User 5" avatarUrl="/avatar5.png" status="invisible" size="large" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatusTest; 