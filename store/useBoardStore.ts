import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

export interface Card {
  id: string;
  insight: string;
  quote: string;
  speaker: string;
  timestamp: string;
  sentiment: string;
  confidence: string;
  assertive: boolean;
  theme?: string;
  freq?: number;
}

export interface Cluster {
  id: string;
  name: string;
  synthesis: string;
  cardIds: string[];
  cards: Card[];
  accentColor?: string;
  conflict?: boolean;
  isUnc?: boolean;
}

interface BoardState {
  sessionId: string | null;
  projectId: string | null;
  clusters: Cluster[];
  isClustering: boolean;
  clusteringError: string | null;
  isGuided: boolean;
  history: Cluster[][];
  
  setSessionId: (id: string | null) => void;
  setProjectId: (id: string | null) => void;
  setClusters: (clusters: Cluster[]) => void;
  hydrate: (clusters: Cluster[]) => void;
  toggleGuided: () => void;
  undo: () => void;
  
  moveCard: (cardId: string, fromClusterId: string, toClusterId: string) => void;
  renameCluster: (clusterId: string, name: string) => void;
  addCluster: () => void;
  deleteCluster: (clusterId: string) => void;
  
  clusterBoard: (id: string, type: 'session' | 'project') => Promise<void>;
  syncBoard: () => Promise<void>;
}

let writeTimeout: NodeJS.Timeout;

const pushToHistory = (set: any, get: any) => {
  const { clusters, history } = get();
  const newHistory = [JSON.parse(JSON.stringify(clusters)), ...history].slice(0, 20);
  set({ history: newHistory });
};

const persistToSupabase = (id: string, type: 'session' | 'project', clusters: Cluster[]) => {
  clearTimeout(writeTimeout);
  writeTimeout = setTimeout(async () => {
    const supabase = createClient();
    const query = (supabase.from('boards') as any)
      .update({ clusters, last_edited_at: new Date().toISOString() });
    
    const { error } = type === 'session' 
      ? await query.eq('session_id', id)
      : await query.eq('project_id', id);
    
    if (error) console.error('Supabase Board Sync Error:', error);
  }, 500);
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      projectId: null,
      clusters: [],
      isClustering: false,
      clusteringError: null,
      isGuided: true,
      history: [],

      setSessionId: (id) => set({ sessionId: id, projectId: null }),
      setProjectId: (id) => set({ projectId: id, sessionId: null }),

      setClusters: (clusters) => {
        pushToHistory(set, get);
        set({ clusters });
        const { sessionId, projectId } = get();
        if (sessionId) persistToSupabase(sessionId, 'session', clusters);
        else if (projectId) persistToSupabase(projectId, 'project', clusters);
      },

      hydrate: (clusters) => set({ clusters }),

      toggleGuided: () => set({ isGuided: !get().isGuided }),

      undo: () => {
        const { history, sessionId, projectId } = get();
        if (history.length === 0) return;
        
        const [previous, ...remaining] = history;
        set({ clusters: previous, history: remaining });
        
        if (sessionId) persistToSupabase(sessionId, 'session', previous);
        else if (projectId) persistToSupabase(projectId, 'project', previous);
      },

      syncBoard: async () => {
        const { sessionId, projectId, clusters } = get();
        if (sessionId) persistToSupabase(sessionId, 'session', clusters);
        else if (projectId) persistToSupabase(projectId, 'project', clusters);
      },

      moveCard: (cardId, fromClusterId, toClusterId) => {
        pushToHistory(set, get);
        const clusters = [...get().clusters];
        const fromCluster = clusters.find(c => c.id === fromClusterId);
        const toCluster = clusters.find(c => c.id === toClusterId);

        if (fromCluster && toCluster) {
          const cardIndex = fromCluster.cards.findIndex(c => c.id === cardId);
          if (cardIndex !== -1) {
            const [card] = fromCluster.cards.splice(cardIndex, 1);
            fromCluster.cardIds = fromCluster.cardIds.filter(id => id !== cardId);
            
            toCluster.cards.push(card);
            toCluster.cardIds.push(cardId);
            
            set({ clusters });
            const { sessionId, projectId } = get();
            if (sessionId) persistToSupabase(sessionId, 'session', clusters);
            else if (projectId) persistToSupabase(projectId, 'project', clusters);
          }
        }
      },

      renameCluster: (clusterId, name) => {
        pushToHistory(set, get);
        const clusters = get().clusters.map(c => 
          c.id === clusterId ? { ...c, name } : c
        );
        set({ clusters });
        const { sessionId, projectId } = get();
        if (sessionId) persistToSupabase(sessionId, 'session', clusters);
        else if (projectId) persistToSupabase(projectId, 'project', clusters);
      },

      addCluster: () => {
        pushToHistory(set, get);
        const newCluster: Cluster = {
          id: `cluster-${Date.now()}`,
          name: 'New Cluster',
          synthesis: '',
          cardIds: [],
          cards: [],
          accentColor: 'indigo'
        };
        const clusters = [...get().clusters, newCluster];
        set({ clusters });
        const { sessionId, projectId } = get();
        if (sessionId) persistToSupabase(sessionId, 'session', clusters);
        else if (projectId) persistToSupabase(projectId, 'project', clusters);
      },

      deleteCluster: (clusterId) => {
        pushToHistory(set, get);
        const currentClusters = get().clusters;
        const clusterToDelete = currentClusters.find(c => c.id === clusterId);
        if (!clusterToDelete) return;

        const clusters = currentClusters.filter(c => c.id !== clusterId);
        const unclustered = clusters.find(c => c.isUnc || c.id === 'unclustered');
        
        if (unclustered) {
          unclustered.cards.push(...clusterToDelete.cards);
          unclustered.cardIds.push(...clusterToDelete.cardIds);
        } else {
          clusters.push({
            id: 'unclustered',
            name: 'Unclustered',
            synthesis: '',
            cardIds: clusterToDelete.cardIds,
            cards: clusterToDelete.cards,
            isUnc: true,
            accentColor: 'slate'
          });
        }

        set({ clusters });
        const { sessionId, projectId } = get();
        if (sessionId) persistToSupabase(sessionId, 'session', clusters);
        else if (projectId) persistToSupabase(projectId, 'project', clusters);
      },

      clusterBoard: async (id, type) => {
        pushToHistory(set, get);
        set({ isClustering: true, clusteringError: null });
        try {
          const body = type === 'session' ? { sessionId: id } : { projectId: id };
          const response = await fetch('/api/ai/cluster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Clustering failed');
          }

          const { clusters } = await response.json();
          set({ clusters });
        } catch (error: any) {
          set({ clusteringError: error.message });
        } finally {
          set({ isClustering: false });
        }
      }
    }),
    {
      name: 'incubx-board-state',
      partialize: (state) => ({
        sessionId: state.sessionId,
        projectId: state.projectId,
        clusters: state.clusters,
      }),
    }
  )
);
