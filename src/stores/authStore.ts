import { create } from 'zustand';
import axios from 'axios';

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

// API base URL
const API_URL = 'http://localhost:8000/api';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Call the backend API for authentication
      const response = await axios.post(`${API_URL}/token`, {
        username: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      
      // Get user info
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      const userData = userResponse.data;
      
      // Store user data and token
      set({ 
        isAuthenticated: true, 
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        },
        token: access_token,
        isLoading: false
      });
      
      // Store token in localStorage for persistence
      localStorage.setItem('auth_token', access_token);
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Invalid email or password. Please try again.' 
      });
      return false;
    }
  },
  
  logout: () => {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    
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

// Initialize auth state from localStorage on app load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    // Validate token and get user info
    axios.get(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      const userData = response.data;
      
      useAuthStore.setState({ 
        isAuthenticated: true, 
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        },
        token: token
      });
    })
    .catch(() => {
      // Token is invalid or expired
      localStorage.removeItem('auth_token');
    });
  }
}