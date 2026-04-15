import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      addProject: (metadata) => {
        const newProject = {
          id: `proj-${Date.now()}`,
          name: metadata.name,
          description: metadata.description,
          researchQuestion: metadata.researchQuestion,
          stakeholders: [],
          board: {
            clusters: []
          },
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id
        }));
        return newProject.id;
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId
        }));
      },

      addStakeholder: (projectId, stakeholder) => {
        const sid = `sh-${Date.now()}`;
        console.log(`[Data Integrity] Adding stakeholder ${sid} to project ${projectId}`);
        
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { 
                  ...p, 
                  stakeholders: [
                    ...p.stakeholders, 
                    { 
                        ...stakeholder, 
                        id: sid, 
                        transcript: '',
                        sector: stakeholder.sector || '',
                        stage: stakeholder.stage || '',
                        method: stakeholder.method || ''
                    }
                  ] 
                }
              : p
          )
        }));
      },

      deleteStakeholder: (projectId, stakeholderId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { 
                  ...p, 
                  stakeholders: p.stakeholders.filter(s => s.id !== stakeholderId) 
                }
              : p
          )
        }));
      },

      updateStakeholder: (projectId, stakeholderId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  stakeholders: p.stakeholders.map(s => 
                    s.id === stakeholderId ? { ...s, ...updates } : s
                  )
                }
              : p
          )
        }));
      },

      updateProjectBoard: (projectId, clusters) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, board: { ...p.board, clusters } } : p
          )
        }));
      },

      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p
          )
        }));
      },

      setActiveProject: (projectId) => set({ activeProjectId: projectId }),

      getProject: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
      }
    }),
    {
      name: 'incubx-projects'
    }
  )
);
