'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSessionStore } from '@/store/useSessionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Edit3, Save, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const supabase = createClient();
  const { cards, setCards } = useSessionStore();
  
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('extracted_cards')
        .select('*')
        .eq('session_id', sessionId);
      
      if (data && data.length > 0) {
        setCards(data);
      }
    };
    if (cards.length === 0) fetchCards();
  }, [sessionId, cards.length, setCards, supabase]);

  const handleConfirmAll = async () => {
    setLoading(true);
    try {
      const confirmedCards = cards.map(c => ({
        session_id: sessionId,
        card_id: c.card_id || c.id,
        insight: c.insight,
        quote: c.quote,
        speaker: c.speaker,
        timestamp: c.timestamp,
        sentiment: c.sentiment,
        confidence: c.confidence,
        assertive: c.assertive,
        theme: c.theme,
        reviewed: true
      }));

      const { error } = await supabase.from('confirmed_cards').insert(confirmedCards);
      if (error) throw error;

      await supabase.from('sessions').update({ status: 'board' }).eq('id', sessionId);
      
      toast.success('Cards confirmed! Triggering clustering...');
      
      // Trigger clustering via API
      const clusterRes = await fetch('/api/ai/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!clusterRes.ok) throw new Error('Clustering failed');

      router.push(`/session/${sessionId}/board`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm cards');
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(c => (c.card_id || c.id) !== id));
    toast.success('Card removed');
  };

  const startEdit = (card: any) => {
    setEditingId(card.card_id || card.id);
    setEditValue(card.insight);
  };

  const saveEdit = (id: string) => {
    setCards(cards.map(c => (c.card_id || c.id) === id ? { ...c, insight: editValue } : c));
    setEditingId(null);
    toast.success('Card updated');
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Card Review</h1>
          <p className="text-slate-500">{cards.length} insights extracted from this session.</p>
        </div>
        <Button 
          size="lg" 
          className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-xl font-bold shadow-lg shadow-indigo-100"
          onClick={handleConfirmAll}
          disabled={loading || cards.length === 0}
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
          Confirm All & Go to Board
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <div className="grid gap-4">
        {cards.map((card) => {
          const id = card.card_id || card.id;
          const isEditing = editingId === id;
          
          return (
            <Card key={id} className="border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                       <Badge variant={card.sentiment === 'positive' ? 'success' : card.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                         {card.sentiment}
                       </Badge>
                       <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-400">
                         {card.confidence} confidence
                       </Badge>
                       <span className="text-xs text-slate-400 ml-auto">
                         {card.speaker} • {card.timestamp}
                       </span>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <textarea 
                          className="flex-1 p-3 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                        <div className="flex flex-col gap-2">
                          <Button size="icon" className="bg-teal-600" onClick={() => saveEdit(id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-lg font-medium text-slate-800 leading-snug">
                          {card.insight}
                        </p>
                        <blockquote className="text-sm text-slate-500 border-l-2 border-slate-200 pl-4 italic">
                          "{card.quote}"
                        </blockquote>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isEditing && (
                      <>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-indigo-600" onClick={() => startEdit(card)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-600" onClick={() => deleteCard(id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
