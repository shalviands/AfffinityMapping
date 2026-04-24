'use client';

import { useBoardStore } from '@/store/useBoardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function BoardContent() {
  const { clusters, renameCluster, addCluster } = useBoardStore();

  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 items-start h-full">
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
  );
}
