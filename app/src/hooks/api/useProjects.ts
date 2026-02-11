import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { useProject } from '@/contexts/ProjectContext';
import type { Project } from '@/types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.detail(id), 'stats'] as const,
};

// Hook para listar projetos
export function useProjectsQuery(filters?: Record<string, any>) {
  return useQuery({
    queryKey: projectKeys.list(filters || {}),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.projects.base, {
        params: filters,
      });
      return response.data as Project[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar projeto por ID
export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.projects.byId(id));
      return response.data as Project;
    },
    enabled: !!id,
  });
}

// Hook para estatísticas do projeto
export function useProjectStatsQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.projects.stats(id));
      return response.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

// Hook para CRUD de projetos
export function useProjectsMutation() {
  const queryClient = useQueryClient();
  const { setSelectedProject } = useProject();
  
  // Criar projeto
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post(endpoints.projects.base, data);
      return response.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
  
  // Atualizar projeto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await apiClient.patch(endpoints.projects.byId(id), data);
      return response.data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
  
  // Deletar projeto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.projects.byId(id));
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    },
  });
  
  // Selecionar projeto
  const selectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(endpoints.projects.select(id));
      return response.data as Project;
    },
    onSuccess: (data) => {
      setSelectedProject(data);
      queryClient.setQueryData(projectKeys.detail(data.id), data);
    },
  });
  
  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    select: selectMutation.mutateAsync,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
