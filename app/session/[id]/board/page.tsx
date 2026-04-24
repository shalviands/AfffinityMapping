'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useBoardStore, Cluster } from '@/store/useBoardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutGrid, List, Sparkles, Share2, Download, Settings } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const supabase = createClient();
  const { 
    clusters, setClusters, hydrate, setSessionId, 
    moveCard, renameCluster, addCluster, clusterBoard,
    isClustering, clusteringError 
  } = useBoardStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setSessionId(sessionId);
    
    // Initial fetch
    const fetchBoard = async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (data) {
        hydrate(data.clusters as Cluster[]);
      } else if (error && error.code !== 'PGRST116') {
         console.error('Fetch board error:', error);
      }
    };
    fetchBoard();

    // Real-time subscription
    const channel = supabase
      .channel(`board:${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'boards',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        // Only hydrate if the version is newer or the edit timestamp is later
        // Simplified for now: always hydrate on update from others
        hydrate(payload.new.clusters as Cluster[]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, setSessionId, hydrate, supabase]);

  const handleManualCluster = async () => {
    toast.promise(clusterBoard(sessionId), {
      loading: 'Analyzing board patterns...',
      success: 'Board re-clustered!',
      error: (err) => `Clustering failed: ${err.message}`
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">I</div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none mb-1">Affinity Board</h1>
            <p className="text-xs text-slate-400 font-mono">{sessionId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-lg flex mr-4">
             <Button 
               variant="ghost" 
               size="sm" 
               className={viewMode === 'grid' ? "bg-white shadow-sm" : ""} 
               onClick={() => setViewMode('grid')}
             >
               <LayoutGrid className="w-4 h-4" />
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className={viewMode === 'list' ? "bg-white shadow-sm" : ""} 
               onClick={() => setViewMode('list')}
             >
               <List className="w-4 h-4" />
             </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleManualCluster} disabled={isClustering}>
             <Sparkles className={`w-4 h-4 mr-2 text-indigo-600 ${isClustering ? 'animate-spin' : ''}`} />
             AI Re-cluster
          </Button>
          <Button variant="outline" size="sm">
             <Share2 className="w-4 h-4 mr-2" />
             Share
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
             <Download className="w-4 h-4 mr-2" />
             Export
          </Button>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 items-start">
        {clusters.map((cluster) => (
          <div 
            key={cluster.id} 
            className={`flex-shrink-0 w-80 bg-white border-2 border-slate-100 rounded-2xl flex flex-col max-h-full shadow-sm hover:border-indigo-100 transition-colors ${
              cluster.isUnc ? 'bg-slate-50/50 border-dashed' : ''
            }`}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-50">
               <input 
                 className="font-bold text-slate-800 bg-transparent border-none focus:ring-0 w-full"
                 value={cluster.name}
                 onChange={(e) => renameCluster(cluster.id, e.target.value)}
                 placeholder={cluster.isUnc ? "Unclustered" : "Name this pattern..."}
               />
               <Badge variant="secondary" className="ml-2">{cluster.cards.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {cluster.cards.map((card) => (
                <motion.div 
                  layoutId={card.id}
                  key={card.id}
                  className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all group"
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  onDragEnd={() => {}} // Handle manual move across clusters if needed
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={card.sentiment === 'positive' ? 'success' : card.sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-[10px] scale-90 origin-left">
                      {card.sentiment}
                    </Badge>
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {card.speaker}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {card.insight}
                  </p>
                </motion.div>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full border border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 h-10"
                onClick={() => {}}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Card
              </Button>
            </div>
          </div>
        ))}

        <Button 
          variant="outline" 
          className="flex-shrink-0 w-80 h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 transition-all group"
          onClick={addCluster}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-sm">New Cluster</span>
          </div>
        </Button>
      </main>
    </div>
  );
}
