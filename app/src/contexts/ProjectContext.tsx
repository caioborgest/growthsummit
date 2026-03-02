import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
    const saved = localStorage.getItem('selectedProject');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    } else {
      localStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);

  const handleSetProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
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
