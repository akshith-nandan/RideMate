import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Navigation, AlertCircle } from 'lucide-react';
const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirection based on role
        const profile = await login(email, password); // just verification
        const token = localStorage.getItem('token');
        
        // Use a timeout to ensure state synchronizes
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to login. Connect server.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-[calc(screen-16)] bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-brand-yellow text-brand-dark p-3 rounded-2xl font-black flex items-center justify-center shadow-lg">
            <Navigation className="h-6 w-6 fill-current transform rotate-45" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign In to RideMate
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Or{' '}
          <Link to="/signup" className="font-semibold text-brand-yellow hover:text-yellow-400 transition-colors">
            create a new account
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 animate-shake">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-300">
                Email Address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-300">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                />
              </div>
            </div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
