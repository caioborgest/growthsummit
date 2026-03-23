import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
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
          const response = await apiClient.post(endpoints.auth.login, {
            email,
            password,
          });
          
          const { user, accessToken, refreshToken } = response.data;
          
          safeStorage.setItem('accessToken', accessToken);
          safeStorage.setItem('refreshToken', refreshToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Erro ao fazer login',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post(endpoints.auth.register, data);
          
          const { user, accessToken, refreshToken } = response.data;
          
          safeStorage.setItem('accessToken', accessToken);
          safeStorage.setItem('refreshToken', refreshToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Erro ao criar conta',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Logout
      logout: async () => {
        try {
          await apiClient.post(endpoints.auth.logout);
        } finally {
          safeStorage.removeItem('accessToken');
          safeStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },
      
      // Refresh token
      refreshToken: async () => {
        try {
          const refreshToken = safeStorage.getItem('refreshToken');
          const response = await apiClient.post(endpoints.auth.refresh, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
        } catch (error) {
          // Refresh falhou - fazer logout
          get().logout();
        }
      },
      
      // Fetch profile
      fetchProfile: async () => {
        try {
          const response = await apiClient.get(endpoints.auth.me);
          set({
            user: response.data,
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
          const response = await apiClient.patch(endpoints.users.profile, data);
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Erro ao atualizar perfil',
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
