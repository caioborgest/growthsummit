import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@growthsummit.com.br',
    name: 'Administrador',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'participante@email.com',
    name: 'João Silva',
    phone: '(88) 99999-9999',
    role: 'participant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    email: 'mentor@email.com',
    name: 'Dr. Fernando Lima',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    email: 'empresa@email.com',
    name: 'Empresa ABC',
    role: 'company',
    createdAt: '2024-01-20',
  },
  {
    id: '5',
    email: 'startup@email.com',
    name: 'TechStart Brasil',
    role: 'startup',
    avatar: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
    createdAt: '2024-01-25',
  },
  {
    id: '6',
    email: 'patrocinador@email.com',
    name: 'TechCorp Brasil',
    role: 'sponsor',
    createdAt: '2024-01-30',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === '123456') {
      setUser(foundUser);
    } else {
      throw new Error('Credenciais inválidas');
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasRole = useCallback((roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole,
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
