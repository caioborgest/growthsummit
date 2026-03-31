import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import type { Project } from '@/types';

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

  useEffect(() => {
    // 1. Prioridade: Parâmetro da URL (projeto externo ou embed)
    const urlParams = new URLSearchParams(window.location.search);
    const urlProjectId = urlParams.get('project');

    if (urlProjectId && (!selectedProject || selectedProject.id !== urlProjectId)) {
      // Tentar buscar do Supabase se o ID for diferente do atual
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.from('projects' as any)
          .select('*')
          .eq('id', urlProjectId)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              // Simple mapping to avoid importing complex useData logic here
              const mapped = Object.entries(data).reduce((acc, [key, val]) => {
                const camelKey = key.replace(/(_[a-z])/g, group => group.toUpperCase().replace('_', ''));
                acc[camelKey] = val;
                return acc;
              }, {} as any);
              setSelectedProject(mapped);
            }
          });
      });
    }

    // 2. Persistência
    if (selectedProject) {
      safeStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    } else if (!urlProjectId) {
      safeStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);

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
