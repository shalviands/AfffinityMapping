'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap, Target, BarChart3, Plus, Loader2, ArrowRight, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const { projects, loading, fetchProjects, addProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSector) return;
    
    const project = await addProject(newName, newSector);
    if (project) {
      toast.success('Project created!');
      setNewName('');
      setNewSector('');
      setIsCreating(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Research Hub</h1>
          <p className="text-slate-500">Manage your discovery projects and stakeholder interviews.</p>
        </div>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl font-semibold shadow-lg shadow-indigo-100"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Project</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-indigo-100 bg-indigo-50/30 animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-6">
            <form onSubmit={handleCreateProject} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Project Name</label>
                <Input 
                  placeholder="e.g. HealthTech Discovery 2024" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white border-indigo-200"
                />
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sector</label>
                <Input 
                  placeholder="e.g. Healthcare, Fintech, Edtech" 
                  value={newSector} 
                  onChange={(e) => setNewSector(e.target.value)}
                  className="bg-white border-indigo-200"
                />
              </div>
              <Button type="submit" disabled={!newName || !newSector} className="bg-indigo-600">
                Create Project
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed border-slate-100 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">No projects yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Create your first research project to start adding stakeholder interviews.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} variant="outline" className="mt-4">
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <Card className="hover:border-indigo-300 transition-all cursor-pointer group hover:shadow-xl hover:shadow-indigo-50/50 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                      {project.sector}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isCreating && projects.length > 0 && (
        <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-100">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Project-Level Logic</h3>
            <p className="text-sm text-slate-600">Aggregate insights across multiple stakeholders to find deep market patterns.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Comparative Analysis</h3>
            <p className="text-sm text-slate-600">Identify unique pain points for different stakeholder roles in the same ecosystem.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Synthesis Ready</h3>
            <p className="text-sm text-slate-600">Once enough stakeholders are interviewed, trigger project-wide affinity mapping.</p>
          </div>
        </div>
      )}
    </main>
  );
}
