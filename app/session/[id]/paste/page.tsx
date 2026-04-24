'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PastePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const supabase = createClient();
  
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!text || text.length < 50) {
      toast.error('Please paste a meaningful transcript (min 50 chars)');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transcripts')
        .insert({
          session_id: sessionId,
          transcript_text: text,
          source: 'text_paste',
          processing_engine: 'manual'
        } as any);

      if (error) throw error;

      toast.success('Transcript saved!');
      router.push(`/session/${sessionId}/processing`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Paste Transcript</h1>
        <p className="text-slate-600">Already have a transcript? Paste it here to extract insights.</p>
      </div>
      
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <Textarea 
            placeholder="Paste your interview transcript here..." 
            className="min-h-[400px] font-sans leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </CardContent>
      </Card>

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
