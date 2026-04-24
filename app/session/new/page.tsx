'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSessionStore } from '@/store/useSessionStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, Info, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function NewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const supabase = createClient();
  const { formData, updateFormData, setSession } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
      updateFormData({ project_id: projectId });
      // Fetch project to get sector
      const fetchProject = async () => {
        const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
        if (data) {
          setProject(data);
          updateFormData({ sector: (data as any).sector });
        }
      };
      fetchProject();
    }
  }, [projectId, updateFormData, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await (supabase.from('sessions') as any)
        .insert({
          project_id: projectId || null,
          name: formData.name || `${formData.stakeholder_name} - ${new Date().toLocaleDateString()}`,
          stakeholder_name: formData.stakeholder_name,
          stakeholder_role: formData.stakeholder_role,
          interview_date: formData.interview_date,
          interview_method: formData.interview_method,
          sector: formData.sector,
          stage: formData.stage,
          round_number: formData.round_number,
          research_question: formData.research_question,
          sorting_mode: formData.sorting_mode,
          guided_mode: formData.guided_mode,
          status: 'created'
        } as any)
        .select()
        .single();

      if (error) throw error;

      setSession(data as any);
      toast.success('Session created successfully!');
      router.push(`/session/${data.id}/record`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {project && (
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Project Context</p>
            <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Stakeholder Details</CardTitle>
          <CardDescription>Who are you talking to and why?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder_name">Stakeholder Name</Label>
              <Input 
                id="stakeholder_name" 
                placeholder="e.g. Rahul Sharma" 
                required 
                value={formData.stakeholder_name}
                onChange={(e) => updateFormData({ stakeholder_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholder_role">Role / Title</Label>
              <Input 
                id="stakeholder_role" 
                placeholder="e.g. Small Business Owner" 
                value={formData.stakeholder_role}
                onChange={(e) => updateFormData({ stakeholder_role: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="research_question">Primary Research Question</Label>
            <Textarea 
              id="research_question" 
              placeholder="What is the main thing you want to learn from this interview?" 
              required
              className="min-h-[100px]"
              value={formData.research_question}
              onChange={(e) => updateFormData({ research_question: e.target.value })}
            />
            <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>The AI uses this question to filter insights. Be specific to get higher quality extraction.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Project Context</CardTitle>
          <CardDescription>This helps the AI understand the sector and stage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select 
                value={formData.sector} 
                onValueChange={(v) => updateFormData({ sector: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="Healthtech">Healthtech</SelectItem>
                  <SelectItem value="Edtech">Edtech</SelectItem>
                  <SelectItem value="Agritech">Agritech</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Ecommerce">Ecommerce</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select 
                value={formData.stage} 
                onValueChange={(v) => updateFormData({ stage: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Idea">Idea / Discovery</SelectItem>
                  <SelectItem value="MVP">MVP / Prototyping</SelectItem>
                  <SelectItem value="Beta">Beta Testing</SelectItem>
                  <SelectItem value="Scale">Scaling / Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-xl font-bold shadow-lg shadow-indigo-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Continue to Recording
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function NewSessionPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">New Stakeholder Interview</h1>
        <p className="text-slate-600">Enter the details of your interview to start capturing insights.</p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>Loading session form...</p>
        </div>
      }>
        <NewSessionContent />
      </Suspense>
    </div>
  );
}
