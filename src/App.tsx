import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Outlet, useNavigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Sidebar from './components/layout/Sidebar';
import ChannelList from './components/layout/ChannelList';
import ChatView from './components/messages/ChatView';
import UserProfile from './components/user/UserProfile';
import Settings from './components/user/Settings';
import DirectMessagesContainer from './components/directmessages/DirectMessagesContainer';
import UserList from './components/server/UserList'
import { channelService } from './services/channels';
import StatusTest from './components/user/StatusTest';
import { UserProvider, useUser } from './contexts/UserContext';
import PublicRoute from './components/auth/PublicRoute';

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
  const { user, loading } = useUser();

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
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          {/* Status test route */}
          <Route path="/status-test" element={<StatusTest />} />
          
          <Route path="/" element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
            {/* Redirect root to channel list */}
            <Route path="" element={<Navigate to="/channels/@me" replace />} />
            
            {/* Direct messages routes */}
            <Route path="channels/@me" element={<DirectMessagesContainer />} />
            <Route path="channels/@me/:conversationId" element={<DirectMessagesContainer />} />
            
            {/* User profile and settings */}
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Server and channel routes */}
            <Route path="channels/:serverId" element={<ServerChannelRedirect />} />
            <Route path="channels/:serverId/:channelId" element={
              <div className="flex flex-1 h-full">
                <ChannelList />
                <ChatView />
                <UserList />
              </div>
            } />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/channels/@me" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
