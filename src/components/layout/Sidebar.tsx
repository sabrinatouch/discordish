import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Server {
  id: string;
  name: string;
  icon_url: string | null;
}

interface DMChannel {
  id: string;
  name: string;
  avatar_url: string | null;
}

const Sidebar: React.FC = () => {
  const [servers, setServers] = React.useState<Server[]>([]);
  const [dmChannels, setDmChannels] = React.useState<DMChannel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    const fetchServers = async () => {
      try {
        const { data, error } = await supabase
          .from('servers')
          .select('*')
          .order('name');

        if (error) throw error;
        setServers(data || []);
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };

    const fetchDMChannels = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('direct_messages')
          .select('*, users!direct_messages_user_id_fkey(*)')
          .eq('user_id', user.id);

        if (error) throw error;
        setDmChannels(data || []);
      } catch (error) {
        console.error('Error fetching DM channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
    fetchDMChannels();
  }, []);

  return (
    <div className="w-60 h-screen bg-gray-900 flex flex-col">
      {/* Server List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {/* Home Button */}
          <Link
            to="/channels/@me"
            className={`flex items-center justify-center w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 ${
              location.pathname === '/channels/@me' ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>

          {/* Server List */}
          {servers.map((server) => (
            <Link
              key={server.id}
              to={`/channels/${server.id}`}
              className={`flex items-center justify-center w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 ${
                location.pathname === `/channels/${server.id}` ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {server.icon_url ? (
                <img
                  src={server.icon_url}
                  alt={server.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-white text-lg font-semibold">
                  {server.name.charAt(0)}
                </span>
              )}
            </Link>
          ))}

          {/* Add Server Button */}
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 hover:rounded-2xl transition-all duration-200">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Settings */}
      <div className="p-2">
        <button className="flex items-center w-full p-2 rounded hover:bg-gray-700 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="ml-3 text-sm text-gray-300">User Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 