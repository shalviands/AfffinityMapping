'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSessionStore } from '@/store/useSessionStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2, Save, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecordPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const supabase = createClient();
  const { setTranscript } = useSessionStore();

  const [isRecording, setIsRecording] = useState(false);
  const [transcriptLocal, setTranscriptLocal] = useState('');
  const [loading, setLoading] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'hi-IN';

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscriptLocal(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          toast.error(`Speech error: ${event.error}`);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
      toast.success('Recording started...');
    }
  };

  const handleSave = async () => {
    if (!transcriptLocal) {
      toast.error('No transcript to save');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transcripts')
        .insert({
          session_id: sessionId,
          transcript_text: transcriptLocal,
          source: 'live_recording',
          processing_engine: 'webspeech'
        } as any);

      if (error) throw error;

      setTranscript(transcriptLocal);
      toast.success('Transcript saved!');
      router.push(`/session/${sessionId}/processing`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transcript');
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

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Live Recording</h1>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => router.push(`/session/${sessionId}/upload`)}>
             Upload File instead
           </Button>
           <Button variant="outline" onClick={() => router.push(`/session/${sessionId}/paste`)}>
             Paste Text
           </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Real-time Transcript</CardTitle>
            <p className="text-sm text-slate-500">Audio is processed locally in your browser.</p>
          </div>
          <div className="flex items-center gap-4">
             {isRecording && (
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                 <span className="text-sm font-medium text-red-600">Recording</span>
               </div>
             )}
             <Button 
               onClick={toggleRecording} 
               variant={isRecording ? "destructive" : "default"}
               className="rounded-full px-6"
             >
               {isRecording ? (
                 <><Square className="w-4 h-4 mr-2 fill-current" /> Stop</>
               ) : (
                 <><Mic className="w-4 h-4 mr-2" /> Start Recording</>
               )}
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="min-h-[300px] max-h-[500px] overflow-y-auto bg-slate-50 rounded-xl p-6 border border-slate-100 italic text-slate-700 leading-relaxed">
            {transcriptLocal || "Click 'Start Recording' to begin speaking..."}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <Button variant="ghost" className="text-slate-500 hover:text-red-600" onClick={() => setTranscriptLocal('')}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Transcript
        </Button>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!transcriptLocal || loading}
            onClick={handleSave}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save and Extract Cards
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
