import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { channelService } from '../../services/channels';
import { serverService } from '../../services/servers';
import { userService } from '../../services/users';
import { authService } from '../../services/auth';
import { subscriptionService } from '../../services/subscription';
import UserAvatar from '../user/UserAvatar';
import { supabase } from '../../lib/supabase';

interface Server {
  id: string;
  name: string;
  icon_url: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  bio: string | null;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [servers, setServers] = useState<Server[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle server click to navigate to the first channel
  const handleServerClick = async (serverId: string) => {
    try {
      // Use the channel service to fetch the first channel
      const firstChannel = await channelService.getFirstChannelForServer(serverId);
      
      if (firstChannel) {
        // Navigate directly to the first channel
        navigate(`/channels/${serverId}/${firstChannel.id}`);
      } else {
        // Fall back to server route if no channels
        navigate(`/channels/${serverId}`);
      }
    } catch (error) {
      // If any error, fall back to server route
      console.error('Error navigating to server:', error);
      navigate(`/channels/${serverId}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user auth info first
        const currentAuthUser = await authService.getCurrentUser();
        if (!currentAuthUser) return;
        console.log('Fetched auth userId', currentAuthUser.username);
        
        // Fetch servers using serverService
        const serverData = await serverService.getAllServersMemberOf(currentAuthUser.id);
        setServers(serverData || []);
        console.log('Fetched servers for auth user', serverData);

        // Get the full user profile from userService for additional fields
        const userProfile = await userService.getUserProfile(currentAuthUser.id);
        if (userProfile) {
          setProfile(userProfile as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to server changes using the subscription service
    const serverSubscription = subscriptionService.subscribeToServers<Server>((payload) => {
      if (payload.eventType === 'INSERT') {
        setServers(prev => [...prev, payload.new as Server]);
      } else if (payload.eventType === 'DELETE') {
        setServers(prev => prev.filter(server => server.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        setServers(prev =>
          prev.map(server =>
            server.id === payload.new.id ? (payload.new as Server) : server
          )
        );
      }
    });

    // Subscribe to profile changes
    // const profileSubscription = subscriptionService.subscribeToUserChanges<UserProfile>((payload) => {
    //   console.log("profileSubscription detected");
    //   setProfile(payload.new as UserProfile);
    // });

    // Subscribe to profile changes
    console.log('Sidebar.tsx: Setting up profile subscription...');
    const profileSubscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('Sidebar.tsx: Received profile update:', payload.new);
          setProfile(payload.new as UserProfile);
        }
      )
      .subscribe();

    return () => {
      serverSubscription();
      profileSubscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-60 h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-60 h-screen bg-gray-900 flex flex-col">
      {/* Server List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {/* Home Button */}
          <Link
            to="/channels/@me"
            className={`flex items-center justify-center w-10 h-10 rounded-xl hover:rounded-2xl transition-all duration-200 ${
              location.pathname === '/channels/@me' ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <svg className="text-white w-40 h-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>

          {/* Server List */}
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => handleServerClick(server.id)}
              className={`flex items-center justify-center w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 ${
                location.pathname.startsWith(`/channels/${server.id}`) ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {server.icon_url ? (
                <img
                  src={server.icon_url}
                  alt={server.name}
                  width={'40px'}
                  height={'40px'}
                  className="rounded-xl"
                />
              ) : (
                <span className="text-white text-lg font-semibold">
                  {server.name.charAt(0)}
                </span>
              )}
            </button>
          ))}

          {/* Add Server Button */}
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 hover:rounded-2xl transition-all duration-200">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="relative z-10 p-2">
        <div className="bg-gray-800 rounded-lg shadow-lg p-2">
          <Link
            to="/profile"
            className="flex items-center space-x-3 mb-2 p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <UserAvatar 
              username={profile?.username || 'User'} 
              avatarUrl={profile?.avatar_url || null} 
              status={profile?.status || 'offline'} 
              size="small"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.username}
              </p>
              <div className="flex items-center">
                <span className="ml-1 text-xs text-gray-400 capitalize">
                  {profile?.status}
                </span>
              </div>
            </div>
          </Link>

          {/* User Settings Button */}
          <Link
            to="/settings"
            className="flex items-center w-full p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-300">User Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 