'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useBoardStore, Cluster } from '@/store/useBoardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Loader2, Download, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { BoardContent } from '@/components/board/BoardContent';

export default function ProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();
  const { hydrate, setProjectId } = useBoardStore();

  const [loading, setLoading] = useState(true);
  const [clustering, setClustering] = useState(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      setProjectId(projectId);
      setLoading(true);
      try {
        // Fetch project
        const { data: pData } = await supabase.from('projects').select('*').eq('id', projectId).single();
        setProject(pData);

        // Fetch project board
        const { data, error } = await supabase
          .from('boards')
          .select('clusters')
          .eq('project_id', projectId)
          .single();
        
        if (data) {
          hydrate((data as any).clusters as Cluster[]);
        } else {
          // If no board exists, initialize empty
          hydrate([]);
          // Create the board record in background
          await (supabase.from('boards') as any).upsert({ project_id: projectId, clusters: [] }, { onConflict: 'project_id' });
        }
      } catch (err) {
        console.error('Fetch board error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBoard();
  }, [projectId, hydrate, supabase, setProjectId]);

  const handleClustering = async () => {
    setClustering(true);
    try {
      const res = await fetch('/api/ai/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Clustering failed');
      }

      const { clusters } = await res.json();
      hydrate(clusters);
      toast.success('Project-wide clustering complete!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setClustering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading project board...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Tool Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{project?.name}</h1>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100">Project Board</Badge>
            </div>
            <p className="text-xs text-slate-500">Cross-stakeholder affinity mapping</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            onClick={handleClustering}
            disabled={clustering}
          >
            {clustering ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Refresh AI Clusters
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </header>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <BoardContent />
      </div>
    </div>
  );
}
