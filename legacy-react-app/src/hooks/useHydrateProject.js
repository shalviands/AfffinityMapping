import { useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useBoardStore } from '../store/useBoardStore';

export function useHydrateProject(projectId) {
  const getProject = useProjectStore(s => s.getProject);
  const setClusters = useBoardStore(s => s.setClusters);
  const clusters = useBoardStore(s => s.clusters);

  useEffect(() => {
    if (!projectId) return;

    const currentBoardId = useBoardStore.getState().projectId;
    
    // Force hydration if ID mismatch to ensure project-isolation
    if (currentBoardId !== projectId) {
      const project = getProject(projectId);
      if (project) {
        useBoardStore.getState().setProjectId(projectId);
        setClusters(project.board?.clusters || []);
        console.log(`[Hydration] Switch detected. Loaded clusters for project: ${projectId}`);
      }
    }
  }, [projectId, getProject, setClusters]);
}
