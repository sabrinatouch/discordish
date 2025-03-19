import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  server_id: string;
}

const ChannelList: React.FC = () => {
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { serverId } = useParams<{ serverId: string }>();
  const location = useLocation();

  React.useEffect(() => {
    const fetchChannels = async () => {
      if (!serverId) return;

      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .eq('server_id', serverId)
          .order('name');

        if (error) throw error;
        setChannels(data || []);
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [serverId]);

  if (loading) {
    return (
      <div className="w-60 h-screen bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-60 h-screen bg-gray-800 flex flex-col">
      {/* Server Header */}
      <div className="h-12 flex items-center px-4 border-b border-gray-700">
        <h2 className="text-white font-semibold">Server Name</h2>
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

      {/* Add Channel Button */}
      <div className="p-2">
        <button className="w-full flex items-center px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Channel
        </button>
      </div>
    </div>
  );
};

export default ChannelList; 