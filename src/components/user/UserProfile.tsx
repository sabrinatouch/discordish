import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'idle' | 'dnd' | 'invisible';
  bio: string | null;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: 'User',
    avatar_url: null,
    status: 'offline',
    bio: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('UserProfile: Starting profile fetch...');
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('UserProfile: Current auth user:', user?.id);
        
        if (!user) {
          console.log('UserProfile: No authenticated user found');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('UserProfile: Error fetching profile:', error);
          throw error;
        }
        
        console.log('UserProfile: Successfully fetched profile:', data);
        setProfile(data);
      } catch (error) {
        console.error('UserProfile: Error in fetchProfile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
    console.log('UserProfile: Setting up profile subscription...');
    const subscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('UserProfile: Received profile update:', payload.new);
          setProfile(payload.new as UserProfile);
        }
      )
      .subscribe();

    return () => {
      console.log('UserProfile: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleStatusChange = async (newStatus: UserProfile['status']) => {
    console.log('UserProfile: Attempting to update status to:', newStatus);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', profile.id);

      if (error) {
        console.error('UserProfile: Error updating status:', error);
        throw error;
      }
      console.log('UserProfile: Successfully updated status');
      setProfile(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('UserProfile: Error in handleStatusChange:', error);
      setError('Failed to update status');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('UserProfile: Starting profile update...');
    const formData = new FormData(e.currentTarget);
    const updates = {
      username: formData.get('username') as string,
      bio: formData.get('bio') as string,
    };
    console.log('UserProfile: Update data:', updates);

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', profile.id);

      if (error) {
        console.error('UserProfile: Error updating profile:', error);
        throw error;
      }
      console.log('UserProfile: Successfully updated profile');
      setProfile(prev => ({ ...prev, ...updates }));
      setIsEditing(false);
    } catch (error) {
      console.error('UserProfile: Error in handleProfileUpdate:', error);
      setError('Failed to update profile');
    }
  };

  if (loading) {
    console.log('UserProfile: Rendering loading state');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  console.log('UserProfile: Rendering with profile:', profile);
  return (
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full rounded-full"
              />
            ) : (
              <span className="text-2xl text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800 ${
              profile.status === 'online'
                ? 'bg-green-500'
                : profile.status === 'idle'
                ? 'bg-yellow-500'
                : profile.status === 'dnd'
                ? 'bg-red-500'
                : profile.status === 'invisible'
                ? 'bg-gray-400'
                : 'bg-gray-500'
            }`}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{profile.username}</h2>
          <p className="text-gray-400 capitalize">{profile.status}</p>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={profile.username}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio || ''}
              rows={3}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Status</h3>
            <div className="flex space-x-2">
              {(['online', 'idle', 'dnd', 'offline', 'invisible'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded capitalize ${
                    profile.status === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Bio</h3>
            <p className="text-gray-300">{profile.bio || 'No bio yet'}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
};

export default UserProfile; 