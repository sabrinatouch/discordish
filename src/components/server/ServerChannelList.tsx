import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { channelService } from '../../services/channels';
import { serverService } from '../../services/servers';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  server_id: string;
}

interface Server {
  id: string;
  name: string;
  icon_url: string | null;
}

const ServerChannelList: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const location = useLocation();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch server data using serverService
        const serverData = await serverService.getServer(serverId!);
        setCurrentServer(serverData);

        // Fetch channels using channelService
        const channelData = await channelService.getServerChannels(serverId!);
        setChannels(channelData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to channel changes
    const subscription = supabase
      .channel(`channels:${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChannels(prev => [...prev, payload.new as Channel]);
          } else if (payload.eventType === 'DELETE') {
            setChannels(prev => prev.filter(channel => channel.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setChannels(prev =>
              prev.map(channel =>
                channel.id === payload.new.id ? (payload.new as Channel) : channel
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [serverId]);

  if (loading) {
    return (
      <div className="w-60 h-screen bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!currentServer) {
    return (
      <div className="w-60 h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white">Server not found</div>
      </div>
    );
  }

  return (
    <div className="h-full overflowy-y-auto bg-discord-darker">
      {/* Server Header */}
      <div className="h-12 flex items-center px-4 border-b border-gray-700">
        <h2 className="text-white font-semibold">{currentServer.name}</h2>
      </div>

      {/* Add Channel Button */}
      <div className="p-2">
        <button className="w-full flex items-center px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Channel
        </button>
      </div>
      
      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              to={`/channels/${serverId}/${channel.id}`}
              className={`flex items-center px-2 py-1 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                location.pathname === `/channels/${serverId}/${channel.id}` ? 'bg-gray-700 text-white' : ''
              }`}
            >
              <span className="text-lg mr-2">#</span>
              {channel.name}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ServerChannelList; 