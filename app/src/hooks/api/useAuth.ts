import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { User as AppUser } from '@/types';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Mapeia usuário do auth para o tipo User da aplicação
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
        role: user.user_metadata?.role || 'user',
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: user.created_at,
      } as unknown as AppUser;
    },
    enabled: authStore.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      // Supabase já trata persistência automaticamente se configurado no client
      if (data.user) {
        queryClient.setQueryData(authKeys.profile(), {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuário',
        });
        authStore.fetchProfile();
      }
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
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
          }
        }
      });
      if (error) throw error;
      return signUpData;
    },
    onSuccess: (data: any) => {
      if (data.user) {
        queryClient.setQueryData(authKeys.profile(), {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
        });
      }
    },
  });
  
  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
    },
    onSuccess: () => {
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
