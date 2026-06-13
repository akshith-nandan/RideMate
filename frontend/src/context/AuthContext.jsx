import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // Load user on page load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getProfile();
        if (data.success) {
          setUser(data.user);
          setVehicle(data.vehicle);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
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
        localStorage.setItem('token', data.token);
        setUser(data.user);
        
        // Fetch vehicle details after login
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
        localStorage.setItem('token', data.token);
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
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setVehicle(null);
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
    login,
    signup,
    logout,
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