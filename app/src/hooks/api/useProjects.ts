import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
      let query: any = supabase.from('projetos_growth_experience' as any).select('*');
      
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Project[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar projeto por ID
export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('projetos_growth_experience' as any)
        .select('*')
        .eq('id', id)
        .single());

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });
}

// Hook para estatísticas do projeto
export function useProjectStatsQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: async () => {
      // Suposta RPC ou agregação direta para estatísticas
      const { data, error } = await supabase.rpc('get_project_stats', { p_project_id: id });
      
      if (error) {
        // Fallback se a RPC não existir
        const { count: inscriptions } = await (supabase
          .from('inscricoes_growth_experience' as any)
          .select('*', { count: 'exact', head: true })
          .eq('project_id', id));
          
        return { inscriptions_count: inscriptions || 0 };
      }
      return data;
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
      const { data: newProject, error } = await (supabase
        .from('projetos_growth_experience' as any)
        .insert(data)
        .select()
        .single());

      if (error) throw error;
      return newProject as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
  
  // Atualizar projeto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const { data: updatedProject, error } = await (supabase
        .from('projetos_growth_experience' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single());

      if (error) throw error;
      return updatedProject as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
  
  // Deletar projeto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('projetos_growth_experience' as any)
        .delete()
        .eq('id', id));

      if (error) throw error;
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
      const { data, error } = await (supabase
        .from('projetos_growth_experience' as any)
        .select('*')
        .eq('id', id)
        .single());

      if (error) throw error;
      return data as Project;
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
