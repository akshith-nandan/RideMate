import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Load user on page load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      const refToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAccessToken(token);
        setRefreshToken(refToken);
        
        const data = await api.getProfile();
        if (data.success) {
          setUser(data.user);
          setVehicle(data.vehicle);
        } else {
          // Try to refresh token
          if (refToken) {
            const refreshData = await api.refreshToken(refToken);
            if (refreshData.success) {
              localStorage.setItem('accessToken', refreshData.accessToken);
              setAccessToken(refreshData.accessToken);
              setUser(refreshData.user);
            } else {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.login(email, password);
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);

        // Fetch vehicle details
        const profile = await api.getProfile();
        if (profile.success) {
          setVehicle(profile.vehicle);
        }
        return { success: true };
      } else {
        setAuthError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = 'Failed to connect to backend';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, phone, password, role) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.signup(name, email, phone, password, role);
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);
        setVehicle(null);
        return { success: true };
      } else {
        setAuthError(data.message || 'Signup failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = 'Failed to connect to backend';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // OTP Login
  const sendOTP = async (phone) => {
    setAuthError(null);
    try {
      const data = await api.sendOTP(phone);
      if (data.success) {
        return { success: true, otp: data.otp }; // otp only in dev
      } else {
        setAuthError(data.message || 'Failed to send OTP');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = 'Failed to send OTP';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const verifyOTP = async (phone, otp, name, role) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.verifyOTP(phone, otp, name, role);
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);
        setVehicle(null);
        return { success: true };
      } else {
        setAuthError(data.message || 'OTP verification failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = 'Failed to verify OTP';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth
  const googleLogin = async (token) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.googleAuth(token);
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);
        setVehicle(null);
        return { success: true };
      } else {
        setAuthError(data.message || 'Google login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = 'Failed to login with Google';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout(refreshToken);
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setVehicle(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshUserToken = async () => {
    if (!refreshToken) return false;
    
    try {
      const data = await api.refreshToken(refreshToken);
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        setAccessToken(data.accessToken);
        setUser(data.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const data = await api.getProfile();
      if (data.success) {
        setUser(data.user);
        setVehicle(data.vehicle);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const value = {
    user,
    vehicle,
    loading,
    authError,
    accessToken,
    refreshToken,
    login,
    signup,
    logout,
    sendOTP,
    verifyOTP,
    googleLogin,
    refreshUserToken,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};