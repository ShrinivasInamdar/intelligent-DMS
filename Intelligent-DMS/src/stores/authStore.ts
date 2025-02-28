import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock user data for demonstration
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin'
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Set to true for development, would be false in production
  user: mockUser, // Mock user for development
  login: async (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    if (email && password) {
      set({ isAuthenticated: true, user: mockUser });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  }
}));