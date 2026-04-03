import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { safeStorage } from '@/utils/safeStorage';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          const user = data.user;
          const mappedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
            role: user.user_metadata?.role || 'user',
            createdAt: user.created_at,
          };
          
          set({
            user: mappedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao fazer login',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: signUpData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.name,
                phone: data.phone,
                role: data.role || 'user',
              }
            }
          });
          
          if (error) throw error;
          
          const user = signUpData.user!;
          const mappedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || 'Usuário',
            role: user.user_metadata?.role || 'user',
            createdAt: user.created_at,
          };
          
          set({
            user: mappedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao criar conta',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Logout
      logout: async () => {
        try {
          await supabase.auth.signOut();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },
      
      // Refresh token (Supabase faz automaticamente se configurado)
      refreshToken: async () => {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          get().logout();
        }
      },
      
      // Fetch profile
      fetchProfile: async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          const mappedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
            role: user.user_metadata?.role || 'user',
            createdAt: user.created_at,
          };

          set({
            user: mappedUser,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
      
      // Update profile
      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const { data: updatedData, error } = await supabase.auth.updateUser({
            data: {
              full_name: data.name,
              avatar_url: (data as any).avatar_url || (data as any).avatarUrl,
            }
          });
          
          if (error) throw error;
          
          const user = updatedData.user;
          const mappedUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || 'Usuário',
            role: user.user_metadata?.role || 'user',
            createdAt: user.created_at,
          };

          set({
            user: mappedUser,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Erro ao atualizar perfil',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
