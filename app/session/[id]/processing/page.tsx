'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSessionStore } from '@/store/useSessionStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { setCards } = useSessionStore();
  
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'success' | 'error' }[]>([
    { msg: 'Connecting to research engine...', type: 'info' }
  ]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const processTranscript = async () => {
      const supabase = createClient();
      
      try {
        // 1. Fetch transcript
        addLog('Fetching transcript from database...');
        const { data: transcriptData, error: tError } = await supabase
          .from('transcripts')
          .select('transcript_text')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (tError || !transcriptData) throw new Error('Transcript not found');

        // 2. Call extraction API
        addLog('Analyzing stakeholder voice (this may take a minute)...', 'info');
        const response = await fetch('/api/ai/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId, 
            transcript: transcriptData.transcript_text 
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'AI Extraction failed');
        }

        const { cards, modelUsed } = await response.json();
        
        addLog(`Successfully extracted ${cards.length} atomic cards using ${modelUsed.split('/').pop()}`, 'success');
        setCards(cards);
        
        // 3. Update session status
        await supabase.from('sessions').update({ status: 'review' }).eq('id', sessionId);
        
        setIsProcessing(false);
        toast.success('Extraction complete!');

      } catch (err: any) {
        console.error('Processing error:', err);
        addLog(err.message, 'error');
        setError(err.message);
        setIsProcessing(false);
      }
    };

    processTranscript();
  }, [sessionId, setCards]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  return (
    <div className="max-w-2xl mx-auto py-24 px-6">
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 mb-4">
          {isProcessing ? (
            <Sparkles className="w-10 h-10 animate-pulse" />
          ) : error ? (
            <AlertCircle className="w-10 h-10 text-red-500" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-teal-500" />
          )}
        </div>
        <h1 className="text-3xl font-bold">
          {isProcessing ? 'Processing Research Data' : error ? 'Extraction Failed' : 'Extraction Complete'}
        </h1>
        <p className="text-slate-600">
          Our AI is breaking down your transcript into atomic insight cards.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-slate-900 text-slate-300 font-mono text-sm overflow-hidden">
        <CardContent className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-3 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-teal-400' : 'text-slate-400'
            }`}>
              <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
              <span>{log.msg}</span>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-3 text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-12 flex justify-center">
        {!isProcessing && !error && (
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-12 h-14 font-bold shadow-xl shadow-indigo-100"
            onClick={() => router.push(`/session/${sessionId}/review`)}
          >
            Review Extracted Cards
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}
        {error && (
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
