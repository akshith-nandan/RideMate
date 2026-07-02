import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Phone, Lock, AlertCircle, Navigation, Zap } from 'lucide-react';

const SignupPage = () => {
  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  
  // Email signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('passenger');
  const [otp, setOtp] = useState('');
  
  // Signup flow state: 'details' or 'otp'
  const [signupStep, setSignupStep] = useState('details');
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'google'
  
  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Submit details and send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !role) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      const result = await sendOTP(phone);
      if (result.success) {
        setSignupStep('otp');
        setError('');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOTPSignup = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter OTP');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      // First verify the OTP
      const verifyResult = await verifyOTP(phone, otp, name, role);
      if (verifyResult.success) {
        // OTP verification successful, now signup with email
        const signupResult = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password, role })
        }).then(res => res.json());
        
        if (signupResult.success) {
          navigate('/');
        } else {
          setError(signupResult.message || 'Failed to create account');
        }
      } else {
        setError(verifyResult.message || 'Failed to verify OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-brand-yellow text-brand-dark p-3 rounded-2xl font-black flex items-center justify-center shadow-lg">
            <Navigation className="h-6 w-6 fill-current transform rotate-45" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create your RideMate account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-yellow hover:text-yellow-400 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          
          {/* Auth Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setAuthMethod('email'); setError(''); setSignupStep('details'); }}
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
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 mb-6">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Signup Form */}
          {authMethod === 'email' && (
            <form className="space-y-5" onSubmit={signupStep === 'details' ? handleSendOTP : handleVerifyOTPSignup}>
              {signupStep === 'details' ? (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-300">
                      Full Name
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <UserPlus className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

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
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-slate-300">
                      Mobile Number (OTP will be sent here)
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Phone className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your mobile number"
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
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-bold text-slate-300">
                      Account Type
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm font-medium"
                    >
                      <option value="passenger">Passenger</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-brand-dark bg-brand-yellow hover:bg-yellow-400 focus:outline-none shadow-lg shadow-yellow-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP to Phone'}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-brand-indigo/5 border border-brand-indigo/15 rounded-lg p-3 text-sm text-slate-300">
                    OTP sent to +91{phone.slice(-10)}
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
                    {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSignupStep('details'); setOtp(''); }}
                    className="w-full py-2 px-4 text-sm font-medium text-brand-yellow hover:text-yellow-400 transition-colors"
                  >
                    Back to Details
                  </button>
                </>
              )}
            </form>
          )}

          {/* Google Signup */}
          {authMethod === 'google' && (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">
                Click the button below to sign up with Google
              </p>
              <button
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-700 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all"
              >
                <Zap className="h-5 w-5" />
                Sign up with Google
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

export default SignupPage;