import React, { createContext, useState, useContext, useEffect } from 'react';
import { testBackend } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First test backend connection
      await testBackend();
      setBackendConnected(true);
      console.log('✅ Backend connected');

      // Then check if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        const { userAPI } = await import('../utils/api.js');
        const response = await userAPI.getProfile();
        setUser(response.data);
        console.log('✅ User profile loaded');
      } else {
        console.log('ℹ️ No token found, user not logged in');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setBackendConnected(false);
      // Clear invalid token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      console.log('✅ Auth loading complete');
    }
  };

  const login = async (username, password) => {
    try {
      const { authAPI } = await import('../utils/api.js');
      const response = await authAPI.login({ username, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      console.log('✅ Login successful');
      
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const signup = async (email, username, password) => {
    try {
      const { authAPI } = await import('../utils/api.js');
      const response = await authAPI.signup({ email, username, password });
      const { token, ...userData } = response.data;
      
      localStorage.removeItem('token');
      localStorage.setItem('token', token);
      setUser(userData);
      console.log('✅ Signup successful');
      
      return userData;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log('✅ Logout successful');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    backendConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};