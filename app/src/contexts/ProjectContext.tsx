import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import type { Project } from '@/types';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { ensureProject } from '@/lib/ensureProject';

const DEFAULT_PROJECT_ID = import.meta.env.VITE_GX_TRIUNFO_PROJECT_ID;

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projectId: string | null;
  isProjectSelected: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = safeStorage.getItem('selectedProject');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation: must have id and name
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      logger.error('ProjectContext: Error restoring from storage:', e);
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

    // 2. Persistência de Longo Prazo
    if (selectedProject && typeof selectedProject === 'object' && selectedProject.id) {
      // Salva qualquer projeto válido (UUID ou Slug) para evitar perda de contexto
      safeStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    }

    // 3. Fallback: Se nada selecionado, forçar o projeto padrão do GX Triunfo
    if (!selectedProject && !urlProjectId && DEFAULT_PROJECT_ID) {
      (async () => {
        try {
          // Check if we already have it in localStorage specifically for Triunfo
          const saved = safeStorage.getItem('selectedProject');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.id === DEFAULT_PROJECT_ID) return;
          }

          logger.info('ProjectContext: Forçando carregamento do projeto padrão:', DEFAULT_PROJECT_ID);
          const proj = await ensureProject({ 
            id: DEFAULT_PROJECT_ID,
            name: 'Growth Experience Triunfo',
            slug: 'ge-triunfo-2026',
            type: 'growth_experience',
            status: 'active'
          });
          if (proj) {
            setSelectedProject(proj);
            // Instant persistence
            safeStorage.setItem('selectedProject', JSON.stringify(proj));
          }
        } catch (err) {
          logger.error('ProjectContext: Erro ao garantir projeto padrão:', err);
        }
      })();
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
