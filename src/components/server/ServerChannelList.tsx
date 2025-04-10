import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { channelService, CreateChannelData } from '../../services/channels';
import { serverService } from '../../services/servers';
import { subscriptionService } from '../../services/subscription';
import { Dialog, DialogBackdrop } from '@headlessui/react'

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
  const [open, setOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch server data using serverService
        const serverData = await serverService.getServer(serverId!);
        setCurrentServer(serverData);

        // Fetch channels using channelService
        fetchServerChannels();
        // const channelData = await channelService.getServerChannels(serverId!);
        // setChannels(channelData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverId]);

  useEffect(() => { 
    // Subscribe to channel changes
    const unsubscribe = subscriptionService.subscribeToServerChannels(serverId!,
      (payload) => {
        console.log('ServerChannelList.tsx: server channel changes', payload.new);
        setChannels(prev => [...prev, payload.new as Channel]);
      }
    )

    return () => {
      unsubscribe();
    };
  }, [serverId]);

  const fetchServerChannels = async () => {
    const channelData = await channelService.getServerChannels(serverId!);
    setChannels(channelData || []);
  }

  const handleAddChannelButton = () => {
    setOpen(true);
  }

  const handleCreateChannel = async () => {
    console.log("handleCreateChannel");

    if (!serverId) return;

    await channelService.createChannel({
      name: newChannelName,
      type: 'text',
      server_id: serverId
    });
    
    fetchServerChannels();
    setOpen(false);
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
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
        <button 
          onClick={() => {handleAddChannelButton()}}
          className="w-full flex items-center px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Channel
        </button>
      </div>

      {/* Add Channel Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-zinc-900/80 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto px-4">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="bg-[#2B2D31] p-8 rounded-md w-full max-w-[480px]">
              <div className="text-left mb-8">
                  <h2 className="text-2xl font-bold text-white">Create Channel</h2>
                  <p className="text-[#B5BAC1] mt-1">(ex. "introductions", "server info", "memes")</p>
              </div>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label htmlFor="newChannelName" className="uppercase block text-xs text-left font-bold text-[#B5BAC1] mb-2">
                      Channel Name
                  </label>
                  <input
                  id="newChannelName"
                  type="newChannelName"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E1F22] text-[#DBDEE1] placeholder-[#949BA4] rounded-[3px] border border-[#1E1F22] focus:border-[#5865F2] focus:ring-0 text-sm"
                  placeholder="new-channel"
                  />
                </div>
                <div className="mt-2 text-right">
                  <button
                      type="button"
                      data-autofocus
                      className="w-35"
                      onClick={() => setOpen(false)}
                  >
                    <div className="py-2.5 px-4 text-discord-accent rounded-[3px] font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      Cancel
                    </div>
                  </button>
                  <button
                      type="button"
                      className="w-35"
                      onClick={() => handleCreateChannel()}
                  >
                    <div className="py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-[3px] font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      Create Channel
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Dialog>
      
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