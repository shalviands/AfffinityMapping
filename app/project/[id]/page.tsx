'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, ArrowLeft, ArrowRight, MessageSquare, Layout, Loader2, Edit2, Trash2, MoreVertical, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch project
      const { data: pData, error: pError } = await supabase.from('projects').select('*').eq('id', projectId).single();
      
      if (pError || !pData) {
        setError('Project not found or you don’t have access.');
        setLoading(false);
        return;
      }
      
      setProject(pData);

      // Fetch sessions
      const { data: sData } = await supabase.from('sessions').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      setSessions(sData || []);
      setError(null);
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, supabase]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this stakeholder session? All transcripts and board data for this person will be lost.')) return;

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) {
      toast.error('Failed to delete session');
    } else {
      toast.success('Session deleted');
      setSessions(sessions.filter(s => s.id !== sessionId));
    }
  };

  const handleEditSession = async (session: any) => {
    const newName = prompt('Enter new stakeholder name:', session.stakeholder_name);
    if (!newName) return;
    const newRole = prompt('Enter new stakeholder role:', session.stakeholder_role);
    
    const { error } = await (supabase
      .from('sessions') as any)
      .update({ stakeholder_name: newName, stakeholder_role: newRole })
      .eq('id', session.id);

    if (error) {
      toast.error('Failed to update session');
    } else {
      toast.success('Session updated');
      fetchData();
    }
  };

  const handleRenameProject = async () => {
    const newName = prompt('Enter new project name:', project.name);
    if (!newName) return;
    
    const { error } = await (supabase
      .from('projects') as any)
      .update({ name: newName })
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to rename project');
    } else {
      toast.success('Project renamed');
      fetchData();
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('EXTREME CAUTION: Are you sure you want to delete this ENTIRE project? All stakeholders, transcripts, and synthesis data will be permanently deleted.')) return;
    
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      toast.error('Failed to delete project');
    } else {
      toast.success('Project deleted');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-600">
          <ArrowLeft className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{error || 'Project not found'}</h1>
        <Button onClick={() => router.push('/')}>Back to Hub</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Hub
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase tracking-widest px-3 py-1">
            {project.sector}
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-500 max-w-2xl">
            Created on {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-slate-600">
                 <Settings className="w-5 h-5" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={handleRenameProject}>
                 <Edit2 className="w-4 h-4 mr-2" /> Rename Project
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600 font-bold">
                 <Trash2 className="w-4 h-4 mr-2" /> Delete Project
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>

           <Button variant="outline" className="h-12 px-6" onClick={() => router.push(`/project/${projectId}/board`)}>
             <Layout className="w-4 h-4 mr-2" />
             Project Board
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 shadow-lg shadow-indigo-100" onClick={() => router.push(`/session/new?projectId=${projectId}`)}>
             <Plus className="w-4 h-4 mr-2" />
             Add Stakeholder
           </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-widest">
          <Users className="w-4 h-4" />
          Stakeholders ({sessions.length})
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500">No stakeholders added yet.</p>
            <Button variant="link" className="text-indigo-600 font-bold" onClick={() => router.push(`/session/new?projectId=${projectId}`)}>
              Add your first interview
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:border-indigo-200 transition-all group overflow-hidden">
                <CardContent className="p-0 flex items-stretch">
                  <div className="w-2 bg-indigo-500 group-hover:w-3 transition-all" />
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {session.stakeholder_name}
                        </h3>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-indigo-600" onClick={() => handleEditSession(session)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => router.push(`/session/${session.id}/paste`)}>
                                <FileText className="w-4 h-4 mr-2" /> Edit/Paste Transcript
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/session/${session.id}/record`)}>
                                <MessageSquare className="w-4 h-4 mr-2" /> Re-record Audio
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/session/${session.id}/upload`)}>
                                <Plus className="w-4 h-4 mr-2" /> Re-upload Audio
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteSession(session.id)} className="text-red-600 font-bold">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Stakeholder
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">{session.stakeholder_role} • {session.interview_method}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <Badge variant={session.status === 'board' ? 'success' : 'secondary'} className="mb-1">
                          {session.status}
                        </Badge>
                        <p className="text-[10px] text-slate-400 uppercase">{new Date(session.created_at).toLocaleDateString()}</p>
                      </div>
                      <Link href={`/session/${session.id}/board`}>
                        <Button variant="ghost" size="icon" className="group-hover:bg-indigo-50 group-hover:text-indigo-600">
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
