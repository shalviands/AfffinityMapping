'use client';

import { useBoardStore, Cluster, Card } from '@/store/useBoardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, Trash2, MoveRight, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';

export function BoardContent() {
  const { clusters, setClusters, renameCluster, addCluster, deleteCluster, moveCard } = useBoardStore();
  const [editingCard, setEditingCard] = useState<{clusterId: string, cardId: string} | null>(null);

  const handleAddCard = (clusterId: string) => {
    const insight = prompt('Enter insight:');
    if (!insight) return;

    const newCard: Card = {
      id: `manual-${Date.now()}`,
      insight,
      quote: 'Manual entry',
      speaker: 'User',
      timestamp: new Date().toLocaleTimeString(),
      sentiment: 'neutral',
      confidence: '1.0',
      assertive: false
    };

    const newClusters = clusters.map(c => 
      c.id === clusterId ? { ...c, cards: [...c.cards, newCard], cardIds: [...c.cardIds, newCard.id] } : c
    );
    setClusters(newClusters);
    toast.success('Card added');
  };

  const handleDeleteCard = (clusterId: string, cardId: string) => {
    const newClusters = clusters.map(c => 
      c.id === clusterId ? { 
        ...c, 
        cards: c.cards.filter(card => card.id !== cardId),
        cardIds: c.cardIds.filter(id => id !== cardId)
      } : c
    );
    setClusters(newClusters);
    toast.success('Card deleted');
  };

  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 items-start h-full bg-slate-50">
      <AnimatePresence>
        {clusters.map((cluster) => (
          <motion.div 
            layout
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
               <div className="flex items-center gap-1">
                 <Badge variant="secondary" className="bg-slate-100">{cluster.cards.length}</Badge>
                 {!cluster.isUnc && (
                   <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-red-500" onClick={() => deleteCluster(cluster.id)}>
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 )}
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {cluster.cards.map((card) => (
                <motion.div 
                  layoutId={card.id}
                  key={card.id}
                  className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={card.sentiment === 'positive' ? 'success' : card.sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-[10px] scale-90 origin-left">
                      {card.sentiment}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteCard(cluster.id, card.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Move to:</div>
                        {clusters.filter(c => c.id !== cluster.id).map(target => (
                          <DropdownMenuItem key={target.id} onClick={() => moveCard(card.id, cluster.id, target.id)}>
                            <MoveRight className="w-4 h-4 mr-2" /> {target.name || 'Untitled'}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {card.insight}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{card.speaker}</span>
                    <span>{card.timestamp}</span>
                  </div>
                </motion.div>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full border border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 h-10 rounded-xl transition-all"
                onClick={() => handleAddCard(cluster.id)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Insight
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

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
