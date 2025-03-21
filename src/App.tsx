import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Sidebar from './components/layout/Sidebar';
import ChannelList from './components/layout/ChannelList';
import ChatView from './components/messages/ChatView';
import UserProfile from './components/user/UserProfile';
import Settings from './components/user/Settings';
import DirectMessagesContainer from './components/messages/DirectMessagesContainer';
import { channelService } from './services/channels';

// Component to handle server redirect with proper URL parameters
const ServerChannelRedirect: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        // Use the channel service to fetch the first channel
        const firstChannel = await channelService.getFirstChannelForServer(serverId!);
          
        if (!firstChannel) {
          setError('No channels found in this server');
          return;
        }
        
        // Navigate to the first channel
        navigate(`/channels/${serverId}/${firstChannel.id}`, { replace: true });
      } catch (error) {
        console.error('Error in channel redirect:', error);
        setError('Error loading server');
      }
    };

    fetchAndRedirect();
  }, [serverId, navigate]);

  // If there's an error, show it
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center p-8 bg-gray-800 rounded-lg">
          <div className="text-xl mb-4">{error}</div>
          <button 
            onClick={() => navigate('/channels/@me')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading spinner while fetching
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
};

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Layout for channel and direct message routes
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen">
    <Sidebar />
    {children}
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/channels/:serverId/:channelId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ChannelList />
                <ChatView />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/channels/@me"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DirectMessagesContainer />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* User Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="flex-1 bg-gray-700">
                  <UserProfile />
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="flex-1 bg-gray-700">
                  <Settings />
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login or home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/channels/@me" replace />
            </ProtectedRoute>
          }
        />

        {/* Redirect server-only route to first channel */}
        <Route
          path="/channels/:serverId"
          element={
            <ProtectedRoute>
              <ServerChannelRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
