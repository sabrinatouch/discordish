import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    notifications: true,
    language: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleThemeChange = async (theme: Settings['theme']) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme,
        });

      if (error) throw error;
      setSettings(prev => ({ ...prev, theme }));
      setSuccess('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      setError('Failed to update theme');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newValue = !settings.notifications;
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notifications: newValue,
        });

      if (error) throw error;
      setSettings(prev => ({ ...prev, notifications: newValue }));
      setSuccess('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notifications:', error);
      setError('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          language,
        });

      if (error) throw error;
      setSettings(prev => ({ ...prev, language }));
      setSuccess('Language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
      setError('Failed to update language');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded text-green-500">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Theme Settings */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Theme</h3>
          <div className="flex space-x-2">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                disabled={loading}
                className={`px-4 py-2 rounded capitalize ${
                  settings.theme === theme
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Notifications</h3>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={handleNotificationToggle}
              disabled={loading}
              className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-300">Enable notifications</span>
          </label>
        </div>

        {/* Language Settings */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Language</h3>
          <select
            value={settings.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        {/* Account Settings */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Account</h3>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 