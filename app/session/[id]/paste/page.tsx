'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PastePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const supabase = createClient();
  
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const { data, error } = await supabase
          .from('transcripts')
          .select('transcript_text')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (data && (data as any[]).length > 0) {
          setText((data as any[])[0].transcript_text);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchTranscript();
  }, [sessionId, supabase]);

  const handleSave = async () => {
    if (!text || text.length < 50) {
      toast.error('Please paste a meaningful transcript (min 50 chars)');
      return;
    }

    setLoading(true);
    try {
      // First check if a transcript exists
      const { data: existing } = await supabase
        .from('transcripts')
        .select('id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      let error;
      if (existing && existing.length > 0) {
        // Update existing
        const { error: updateError } = await (supabase
          .from('transcripts') as any)
          .update({
            transcript_text: text,
            source: 'text_paste',
            processing_engine: 'manual'
          })
          .eq('id', (existing[0] as any).id);
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('transcripts')
          .insert({
            session_id: sessionId,
            transcript_text: text,
            source: 'text_paste',
            processing_engine: 'manual'
          } as any);
        error = insertError;
      }

      if (error) throw error;

      toast.success('Transcript updated!');
      router.push(`/session/${sessionId}/processing`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Edit Transcript</h1>
        <p className="text-slate-600">Review or replace the transcript for this session. Saving will trigger a new insight extraction.</p>
      </div>
      
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
           <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
           <p className="text-slate-400">Loading current transcript...</p>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Textarea 
              placeholder="Paste your interview transcript here..." 
              className="min-h-[500px] font-sans leading-relaxed border-0 focus-visible:ring-0 resize-none p-6 text-slate-700"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8"
          onClick={handleSave}
          disabled={loading || !text}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Extract Insights
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
