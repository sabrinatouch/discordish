import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, session } = await authService.login({
        email,
        password,
      });

      if (error) throw error;

      if (user && session) {
        navigate('/channels/@me');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (e: React.SyntheticEvent) => {
    console.log('handleGuestLogin');
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, session } = await authService.login({
        email: 'guest@email.com',
        password: 'guestpw',
      });

      if (error) throw error;

      if (user && session) {
        navigate('/channels/@me');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1F22] px-4">
      <div className="bg-[#2B2D31] p-8 rounded-md shadow-2xl w-full max-w-[480px]">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
          <p className="text-[#B5BAC1] mt-1">We're so excited to see you again!</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="uppercase block text-xs font-bold text-[#B5BAC1] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E1F22] text-[#DBDEE1] placeholder-[#949BA4] rounded-[3px] border border-[#1E1F22] focus:border-[#5865F2] focus:ring-0 text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="uppercase block text-xs font-bold text-[#B5BAC1] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E1F22] text-[#DBDEE1] placeholder-[#949BA4] rounded-[3px] border border-[#1E1F22] focus:border-[#5865F2] focus:ring-0 text-sm"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <div className="text-[#FA777C] text-sm font-medium bg-[#FA777C]/10 p-3 rounded">
              {error}
            </div>
          )}
          <div className="mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              <div className="py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-[3px] font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {loading ? 'Logging in...' : 'Log In'}
              </div>
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-[#949BA4]">
          Visiting to check out the app?{' '}
          <button onClick={handleGuestLogin} className="text-[#00A8FC] hover:underline">
            Login as Guest
          </button>
        </p>
        <p className="mt-4 text-sm text-[#949BA4]">
          Need an account?{' '}
          <Link to="/signup" className="text-[#00A8FC] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 