import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app start
  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Invalid token, remove it
        authService.setToken(null);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      // Invalid token, remove it
      authService.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        authService.setToken(tokens.accessToken);
        setUser(user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  // Register function
  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        authService.setToken(tokens.accessToken);
        setUser(user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Check auth on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 