'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (shop: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const user = await response.json();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      });
    }
  };

  const login = async (shop: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Validate shop domain
      if (!shop.trim()) {
        throw new Error('Shop domain is required');
      }

      // Initiate OAuth flow
      const response = await fetch('/api/auth/shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop: shop.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate login');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Shopify OAuth
      window.location.href = authUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Redirect to home page
        window.location.href = '/';
      } else {
        throw new Error('Failed to logout');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
      throw error;
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  return {
    ...state,
    login,
    logout,
    refreshUser,
  };
}