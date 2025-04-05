import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  preferredLanguage: string;
}

interface RegisterData {
  username: string;
  email: string;
  displayName: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (username: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', {
      username,
      password,
    });
    
    const data = await response.json();
    setUser(data);
  };
  
  const logout = async () => {
    await apiRequest('POST', '/api/auth/logout');
    setUser(null);
  };
  
  const register = async (data: RegisterData) => {
    await apiRequest('POST', '/api/auth/register', data);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}