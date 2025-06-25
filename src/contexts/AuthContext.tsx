import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Auth types
interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birth?: string;
  avatarPath?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API service functions
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3457/api';
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiCall('/auth/me');
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data as AuthResponse;
        localStorage.setItem('auth_token', tokens.accessToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data as AuthResponse;
        localStorage.setItem('auth_token', tokens.accessToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 