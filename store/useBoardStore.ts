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
  clusters: Cluster[];
  isClustering: boolean;
  clusteringError: string | null;
  
  setSessionId: (id: string) => void;
  setClusters: (clusters: Cluster[]) => void;
  hydrate: (clusters: Cluster[]) => void;
  
  moveCard: (cardId: string, fromClusterId: string, toClusterId: string) => void;
  renameCluster: (clusterId: string, name: string) => void;
  addCluster: () => void;
  deleteCluster: (clusterId: string) => void;
  
  clusterBoard: (sessionId: string) => Promise<void>;
}

let writeTimeout: NodeJS.Timeout;

const persistToSupabase = (sessionId: string, clusters: Cluster[]) => {
  clearTimeout(writeTimeout);
  writeTimeout = setTimeout(async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('boards')
      .update({ clusters, last_edited_at: new Date().toISOString() })
      .eq('session_id', sessionId);
    
    if (error) console.error('Supabase Board Sync Error:', error);
  }, 500);
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      clusters: [],
      isClustering: false,
      clusteringError: null,

      setSessionId: (id) => set({ sessionId: id }),

      setClusters: (clusters) => {
        set({ clusters });
        const sessionId = get().sessionId;
        if (sessionId) persistToSupabase(sessionId, clusters);
      },

      hydrate: (clusters) => set({ clusters }),

      moveCard: (cardId, fromClusterId, toClusterId) => {
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
            const sessionId = get().sessionId;
            if (sessionId) persistToSupabase(sessionId, clusters);
          }
        }
      },

      renameCluster: (clusterId, name) => {
        const clusters = get().clusters.map(c => 
          c.id === clusterId ? { ...c, name } : c
        );
        set({ clusters });
        const sessionId = get().sessionId;
        if (sessionId) persistToSupabase(sessionId, clusters);
      },

      addCluster: () => {
        const newCluster: Cluster = {
          id: `cluster-${Date.now()}`,
          name: 'New Cluster',
          synthesis: '',
          cardIds: [],
          cards: [],
          accentColor: 'violet'
        };
        const clusters = [...get().clusters, newCluster];
        set({ clusters });
        const sessionId = get().sessionId;
        if (sessionId) persistToSupabase(sessionId, clusters);
      },

      deleteCluster: (clusterId) => {
        const currentClusters = get().clusters;
        const clusterToDelete = currentClusters.find(c => c.id === clusterId);
        if (!clusterToDelete) return;

        let clusters = currentClusters.filter(c => c.id !== clusterId);
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
        const sessionId = get().sessionId;
        if (sessionId) persistToSupabase(sessionId, clusters);
      },

      clusterBoard: async (sessionId) => {
        set({ isClustering: true, clusteringError: null });
        try {
          const response = await fetch('/api/ai/cluster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Clustering failed');
          }

          const { clusters: aiClusters } = await response.json();
          // The board API already updates Supabase, so we just need to hydrate local state
          // But usually we want to fetch the latest state from Supabase to be sure
          const supabase = createClient();
          const { data } = await supabase
            .from('boards')
            .select('clusters')
            .eq('session_id', sessionId)
            .single();

          if (data) {
            set({ clusters: data.clusters as Cluster[] });
          }
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
        clusters: state.clusters,
      }),
    }
  )
);
