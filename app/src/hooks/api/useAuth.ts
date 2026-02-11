import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { User } from '@/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Hook de autenticação com React Query
export function useAuth() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  
  // Query para buscar perfil
  const profileQuery = useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.auth.me);
      return response.data as User;
    },
    enabled: authStore.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiClient.post(endpoints.auth.login, { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(authKeys.profile(), data.user);
      authStore.fetchProfile();
    },
  });
  
  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const response = await apiClient.post(endpoints.auth.register, data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(authKeys.profile(), data.user);
    },
  });
  
  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(endpoints.auth.logout);
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      authStore.logout();
    },
  });
  
  return {
    // State
    user: profileQuery.data || authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: profileQuery.isLoading || loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
    
    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchProfile: profileQuery.refetch,
  };
}
