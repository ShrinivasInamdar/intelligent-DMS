import { create } from 'zustand';
import api from '../api/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/token', {
        username: email,
        password: password
      });
      
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Get user info
      const userResponse = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      set({ 
        isAuthenticated: true, 
        user: userResponse.data,
        token: access_token,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.'
      });
      return false;
    }
  },
  
  logout: () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    set({ 
      isAuthenticated: false, 
      user: null,
      token: null
    });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));