import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
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
    if (selectedProject) {
      safeStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    } else {
      safeStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);

  const handleSetProject = useCallback((project: Project | null) => {
    setSelectedProject(current => {
      // Evitar atualizações se for o mesmo projeto (mesmo ID ou mesmo objeto)
      if (current?.id === project?.id) return current;
      return project;
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
