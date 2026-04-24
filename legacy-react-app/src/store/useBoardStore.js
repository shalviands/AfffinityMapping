import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { callAI } from '../services/ai';
import { ANALYSIS_SYSTEM_PROMPT, buildClusteringPrompt } from '../services/ai/prompts';
import { AI_CONFIG } from '../config/ai.config';

// 1. Module-level handle to project store to avoid import cycles in render
const getProjectState = () => {
    try {
        const raw = localStorage.getItem('incubx-projects');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        // Handle Zustand persistence wrapper
        return parsed.state?.projects || parsed.projects || [];
    } catch (e) {
        return [];
    }
};

export const useBoardStore = create(
  persist(
    (set, get) => ({
      projectId: null,
      clusters: [],
      history: [],
      conflictOpen: null,
      showAttribution: false,
      guidedModeOpen: false,
      isClustering: false,
      clusteringError: null,
      
      // Internal helper to sync changes back to local storage (Project's Source of Truth)
      syncToProject: (clusters) => {
          const pid = get().projectId;
          if (!pid) return;
          
          const projects = getProjectState();
          const idx = projects.findIndex(p => p.id === pid);
          if (idx !== -1) {
              projects[idx].board = { ...(projects[idx].board || {}), clusters: clusters || get().clusters };
              localStorage.setItem('incubx-projects', JSON.stringify(projects));
          }
      },

      setProjectId: (pid) => set({ projectId: pid }),

      setClusters: (clusters) => {
          set(state => ({ 
              history: [...state.history, { clusters: state.clusters, label: 'Board Update' }].slice(-5),
              clusters 
          }));
          get().syncToProject(clusters);
      },

      clusterBoard: async (pid, researchQuestion) => {
          const { clusters } = get();
          const allCards = clusters.flatMap(c => c.cards);
          if (allCards.length === 0) return;

          set({ isClustering: true, clusteringError: null });
          try {
              const projects = getProjectState();
              const project = projects.find(p => p.id === pid);
              const sector = project?.sector || 'General';
              const stage = project?.stage || 'Idea';
              
              const prompt = buildClusteringPrompt(allCards, researchQuestion, sector, stage);
              const res = await callAI({
                systemPrompt: ANALYSIS_SYSTEM_PROMPT,
                userPrompt: prompt,
                model: AI_CONFIG.models.clustering,
                jsonMode: true
              });

              if (!res || !res.data || !res.data.clusters) {
                  throw new Error("AI returned an invalid format. Please try again.");
              }

              const parsed = res.data;

              const newClusters = parsed.clusters.map(cluster => ({
                  ...cluster,
                  id: cluster.id || `ai-${Math.random().toString(36).substr(2, 5)}`,
                  accentColor: ['violet', 'teal', 'coral', 'rose', 'amber', 'sky', 'lime', 'pink'][Math.floor(Math.random() * 8)],
                  cards: allCards.filter(card => cluster.cardIds && cluster.cardIds.includes(card.id))
              }));

              const unclusteredCards = allCards.filter(card => !parsed.clusters.some(c => c.cardIds && c.cardIds.includes(card.id)));
              if (unclusteredCards.length > 0) {
                  newClusters.push({
                      id: 'unclustered',
                      name: 'Unclustered',
                      isUnc: true,
                      cards: unclusteredCards
                  });
              }

              set(state => ({
                  clusters: newClusters,
                  history: [...state.history, { clusters: state.clusters, label: 'Auto-Clustered Board' }].slice(-10),
              }));

              get().syncToProject(newClusters);
          } catch (e) {
              console.error("Clustering failed:", e);
              set({ clusteringError: e.message || "Clustering failed. Check your API key or connection." });
          } finally {
              set({ isClustering: false });
          }
      },

      addCluster: () => {
          set(state => {
             const newCluster = {
                 id: `cluster-${Date.now()}`,
                 name: '',
                 accentColor: ['violet', 'teal', 'coral', 'rose', 'amber', 'sky', 'lime', 'pink'][Math.floor(Math.random() * 8)],
                 cards: []
             };
             const nextClusters = [...state.clusters, newCluster];
             setTimeout(() => get().syncToProject(nextClusters), 0);
             return {
                 history: [...state.history, { clusters: state.clusters, label: 'Added Cluster' }].slice(-5),
                 clusters: nextClusters 
             };
          });
      },

      deleteCluster: (clusterId) => {
          set(state => {
             const clusterToDelete = state.clusters.find(c => c.id === clusterId);
             if (!clusterToDelete) return state;

             const newClusters = state.clusters.map(c => {
                 if (c.id === 'unclustered' || c.isUnc) {
                     return { ...c, cards: [...c.cards, ...clusterToDelete.cards] };
                 }
                 return c;
             }).filter(c => c.id !== clusterId);

             setTimeout(() => get().syncToProject(newClusters), 0);
             return {
                 history: [...state.history, { clusters: state.clusters, label: 'Deleted cluster' }].slice(-10),
                 clusters: newClusters
             };
          });
      },

      resolveConflict: (clusterId, resolution) => {
          set(state => {
              const newClusters = state.clusters.map(c => {
                  if (c.id !== clusterId) return c;
                  let updatedCluster = { ...c, conflict: false };
                  if (resolution === 'both') updatedCluster.synthesis += " (Note: Internal tension identified between signals)";
                  if (resolution === 'flag') updatedCluster.flaggedForMentor = true;
                  return updatedCluster;
              });
              setTimeout(() => get().syncToProject(newClusters), 0);
              return {
                  clusters: newClusters,
                  conflictOpen: null
              };
          });
      }, 

      undo: () => {
          set(state => {
              if (state.history.length === 0) return state;
              const last = state.history[state.history.length - 1];
              const nextClusters = last.clusters;
              setTimeout(() => get().syncToProject(nextClusters), 0);
              return {
                  clusters: nextClusters,
                  history: state.history.slice(0, -1)
              };
          });
      },
      
      renameCluster: (id, name) => {
          set(state => {
              const newClusters = state.clusters.map(c => c.id === id ? { ...c, name } : c);
              setTimeout(() => get().syncToProject(newClusters), 0);
              return { clusters: newClusters };
          });
      },
      
      addCardToCluster: (clusterId, text) => {
          set(state => {
              const newCard = {
                  id: `card-${Date.now()}`,
                  text,
                  sentiment: 'neutral',
                  frequency: 1
              };
              const newClusters = state.clusters.map(c => {
                  if (c.id === clusterId) return { ...c, cards: [...c.cards, newCard] };
                  return c;
              });
              setTimeout(() => get().syncToProject(newClusters), 0);
              return { clusters: newClusters };
          });
      },
      
      deleteCard: (cardId) => {
          set(state => {
              const newClusters = state.clusters.map(c => ({
                  ...c,
                  cards: c.cards.filter(card => card.id !== cardId)
              }));
              setTimeout(() => get().syncToProject(newClusters), 0);
              return { clusters: newClusters };
          });
      },

      mergeSessionCards: (sessionCards, stakeholderName, sessionId) => {
          set(state => {
              // Attribute cards to the stakeholder for cross-board traceability
              const attributedCards = sessionCards.map(c => ({
                  ...c,
                  stakeholder: stakeholderName,
                  sessionId: sessionId
              }));

              let nextClusters = [...state.clusters];
              const unclusteredIdx = nextClusters.findIndex(c => c.isUnc || c.id === 'unclustered');

              if (unclusteredIdx === -1) {
                  // Create unclustered group if board is empty
                  nextClusters.push({
                      id: 'unclustered',
                      name: 'Unclustered',
                      isUnc: true,
                      cards: attributedCards,
                      accentColor: 'slate'
                  });
              } else {
                  // Append to existing unclustered group
                  nextClusters[unclusteredIdx] = {
                      ...nextClusters[unclusteredIdx],
                      cards: [...nextClusters[unclusteredIdx].cards, ...attributedCards]
                  };
              }

              // De-duplicate cards just in case (by ID)
              const seen = new Set();
              nextClusters = nextClusters.map(cluster => ({
                  ...cluster,
                  cards: cluster.cards.filter(card => {
                      if (seen.has(card.id)) return false;
                      seen.add(card.id);
                      return true;
                  })
              }));

              setTimeout(() => get().syncToProject(nextClusters), 0);
              return { clusters: nextClusters };
          });
      }
    }),
    {
      name: 'incubx-board-state',
      partialize: (state) => ({ 
          projectId: state.projectId,
          clusters: state.clusters, 
          history: state.history, 
          showAttribution: state.showAttribution 
      }),
    }
  )
);
