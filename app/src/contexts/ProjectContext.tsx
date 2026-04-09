import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import type { Project } from '@/types';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projectId: string | null;
  isProjectSelected: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    try {
      const saved = safeStorage.getItem('selectedProject');
      return saved ? JSON.parse(saved) : null;
    } catch {
      // localStorage corrompido ou JSON inválido — limpar e iniciar sem projeto selecionado
      safeStorage.removeItem('selectedProject');
      return null;
    }
  });

  const urlProjectId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('project') : null;

  useEffect(() => {
    // 1. Prioridade: Parâmetro da URL (projeto externo ou embed)
    if (urlProjectId) {
      const isAlreadySelected = selectedProject && 
        (selectedProject.id === urlProjectId || selectedProject.slug === urlProjectId);

      if (!isAlreadySelected) {
        // 🕵️ Tentar buscar do Supabase: Aceita ID (UUID) OU Slug (Texto)
        (async () => {
          try {
            const isUrlUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlProjectId);
            let query = supabase.from('projects' as any).select('*');
            
            if (isUrlUUID) {
              query = query.eq('id', urlProjectId);
            } else {
              query = query.eq('slug', urlProjectId);
            }
            
            const { data, error } = await query.maybeSingle();
            
            if (!error && data) {
              const mapped = Object.entries(data).reduce((acc: any, [key, val]) => {
                const camelKey = key.replace(/(_[a-z])/g, group => group.toUpperCase().replace('_', ''));
                acc[camelKey] = val;
                return acc;
              }, {} as any);
              setSelectedProject(mapped);
            }
          } catch (err) {
            logger.error('ProjectContext: Erro ao buscar projeto via URL:', err);
          }
        })();
      }
    }

    // 2. Persistência
    if (selectedProject) {
      // Pequena validação para evitar salvar slugs como 'id' por acidente (legado ou URL corrupta)
      const isIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedProject.id);
      if (isIdUUID) {
        safeStorage.setItem('selectedProject', JSON.stringify(selectedProject));
      } else {
        // Se o ID for slug, não salve — deixe a recuperação via URL buscar do Supabase novamente
        logger.debug('ProjectContext: ID atual não é UUID, pulando persistência.');
      }
    } else if (!urlProjectId) {
      // Só remove se não tiver projeto na URL também
      safeStorage.removeItem('selectedProject');
    }
  }, [selectedProject, urlProjectId]);

  const handleSetProject = useCallback((project: Project | null) => {
    setSelectedProject(current => {
      // Se estamos limpando o projeto, sempre permite
      if (!project) return null;
      // Se não tinha projeto antes, sempre permite
      if (!current) return project;
      
      // Permitir atualização se o ID for diferente OU se algum campo de settings mudou
      // (Comparações rasas de ID e stringificação de settings para detecção de mudança)
      const hasIdChanged = current.id !== project.id;
      const hasSettingsChanged = JSON.stringify(current.settings) !== JSON.stringify(project.settings);
      const hasStatusChanged = current.status !== project.status;

      if (hasIdChanged || hasSettingsChanged || hasStatusChanged) {
        return project;
      }

      return current;
    });
  }, []);

  const value = React.useMemo(() => ({
    selectedProject,
    setSelectedProject: handleSetProject,
    projectId: selectedProject?.id || null,
    isProjectSelected: !!selectedProject,
  }), [selectedProject, handleSetProject]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
