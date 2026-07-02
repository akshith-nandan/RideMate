import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Navigation, AlertCircle, Eye, EyeOff, LogIn, Zap, Phone } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'google'
  
  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  // Email login handler
  const handleEmailLogin = async (e) => {
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
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to login. Check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
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
          
          {/* Auth Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setAuthMethod('email'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                authMethod === 'email'
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => { setAuthMethod('google'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                authMethod === 'google'
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Zap className="h-4 w-4" />
              Google
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 mb-6 animate-shake">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Login Form */}
          {authMethod === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailLogin}>
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
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center text-slate-300">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="form-checkbox h-4 w-4 text-brand-yellow bg-slate-800 rounded" />
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-brand-yellow font-medium hover:underline">Forgot?</a>
              </div>

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
            </form>
          )}

          {/* OTP Login Form */}
          {authMethod === 'otp' && (
            <form className="space-y-6" onSubmit={otpStep === 'phone' ? handleSendOTP : handleVerifyOTPLogin}>
              {otpStep === 'phone' ? (
                <>
                  <div>
                    <label htmlFor="otpPhone" className="block text-sm font-bold text-slate-300">
                      Phone Number
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Phone className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="otpPhone"
                        type="tel"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        placeholder="Your mobile number"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      We'll send a 6-digit code to verify your number
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-brand-indigo/5 border border-brand-indigo/15 rounded-lg p-3 text-sm text-slate-300">
                    OTP sent to +91{otpPhone.slice(-10)}
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-sm font-bold text-slate-300">
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      maxLength="6"
                      className="mt-2 block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium text-center tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpStep('phone')}
                    className="w-full py-2 px-4 text-sm font-medium text-brand-yellow hover:text-yellow-400 transition-colors"
                  >
                    Change Phone Number
                  </button>
                </>
              )}
            </form>
          )}

          {/* Google Login */}
          {authMethod === 'google' && (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">
                Click the button below to sign in with Google
              </p>
              <button
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-700 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all"
              >
                <Zap className="h-5 w-5" />
                Sign in with Google
              </button>
              <p className="text-xs text-slate-500 mt-4">
                Note: Integrate Google Sign-In SDK for this feature
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
