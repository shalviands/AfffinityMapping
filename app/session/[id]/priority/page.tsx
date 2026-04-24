'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/useBoardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, AlertTriangle, Zap, Search } from 'lucide-react';

export default function PriorityMatrixPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { clusters } = useBoardStore();

  const sortedClusters = [...clusters].sort((a, b) => b.cards.length - a.cards.length);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Board
          </Button>
          <h1 className="text-3xl font-bold">Priority Matrix</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* High Frequency + High Sentiment (Delighters) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-teal-600 font-bold p-3 bg-teal-50 rounded-xl border border-teal-100">
            <Zap className="w-5 h-5" />
            Strategic Delighters
          </div>
          <div className="space-y-3">
             {sortedClusters.filter(c => c.cards.length > 5 && c.cards.some(card => card.sentiment === 'positive')).map(c => (
               <PriorityItem key={c.id} cluster={c} />
             ))}
          </div>
        </div>

        {/* High Frequency + Negative (Critical Pain Points) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-5 h-5" />
            Critical Pain Points
          </div>
          <div className="space-y-3">
             {sortedClusters.filter(c => c.cards.length > 5 && c.cards.some(card => card.sentiment === 'negative')).map(c => (
               <PriorityItem key={c.id} cluster={c} />
             ))}
          </div>
        </div>

        {/* Low Frequency + High Sentiment (Emerging Wins) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <Target className="w-5 h-5" />
            Emerging Wins
          </div>
          <div className="space-y-3">
             {sortedClusters.filter(c => c.cards.length <= 5 && c.cards.some(card => card.sentiment === 'positive')).map(c => (
               <PriorityItem key={c.id} cluster={c} />
             ))}
          </div>
        </div>

        {/* Low Frequency + Negative (Niche Friction) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600 font-bold p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-5 h-5" />
            Niche Friction
          </div>
          <div className="space-y-3">
             {sortedClusters.filter(c => c.cards.length <= 5 && c.cards.some(card => card.sentiment === 'negative')).map(c => (
               <PriorityItem key={c.id} cluster={c} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityItem({ cluster }: { cluster: any }) {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-2">
      <h4 className="font-bold text-sm text-slate-800 leading-tight">{cluster.name}</h4>
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <Badge variant="secondary" className="text-[10px]">{cluster.cards.length} cards</Badge>
        <span className="text-[10px] text-slate-400">
          {Math.round((cluster.cards.filter((card: any) => card.sentiment === 'negative').length / cluster.cards.length) * 100)}% friction
        </span>
      </div>
    </div>
  );
}
