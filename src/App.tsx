import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Sidebar from './components/layout/Sidebar';
import ChannelList from './components/layout/ChannelList';
import ChatView from './components/messages/ChatView';
import UserProfile from './components/user/UserProfile';
import Settings from './components/user/Settings';
import DirectMessagesContainer from './components/messages/DirectMessagesContainer';

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
              <div className="flex h-screen">
                <Sidebar />
                <ChannelList />
                <ChatView />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/channels/@me"
          element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <Sidebar />
                <DirectMessagesContainer />
              </div>
            </ProtectedRoute>
          }
        />

        {/* User Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 bg-gray-700">
                  <UserProfile />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 bg-gray-700">
                  <Settings />
                </div>
              </div>
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
      </Routes>
    </Router>
  );
};

export default App;
