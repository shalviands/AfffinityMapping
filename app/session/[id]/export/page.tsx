'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/useBoardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileJson, FileText, Layout, ArrowLeft, Download, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ExportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { clusters } = useBoardStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      const response = await fetch('/api/ai/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, type, clusters }),
      });

      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();
      // In a real app, this would trigger a download or show a preview
      toast.success(`${type.toUpperCase()} Export ready!`);
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Board
        </Button>
        <h1 className="text-3xl font-bold">Export Research</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group" onClick={() => handleExport('jtbd')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layout className="w-6 h-6" />
            </div>
            <CardTitle>Jobs-to-be-Done (JTBD)</CardTitle>
            <CardDescription>Convert clusters into functional, emotional, and social jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled={!!loading}>
               {loading === 'jtbd' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
               Download Framework JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:border-teal-200 transition-all cursor-pointer group" onClick={() => handleExport('leancanvas')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <CardTitle>Lean Canvas (Problem Block)</CardTitle>
            <CardDescription>Auto-populate your Lean Canvas problem statements and segments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled={!!loading}>
               {loading === 'leancanvas' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
               Export to Canvas
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:border-rose-200 transition-all cursor-pointer group" onClick={() => handleExport('summary')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <FileJson className="w-6 h-6" />
            </div>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>A 1-page PDF summary of top insights and strategic recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled={!!loading}>
               {loading === 'summary' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
               Generate PDF Summary
            </Button>
          </CardContent>
        </Card>

        <div className="p-8 bg-indigo-900 rounded-3xl text-white space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32" />
           </div>
           <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-bold">Send to INCUBX LMS</h3>
              <p className="text-indigo-100 max-w-md">Push your research directly to your mentor dashboard and team workspace for collective review.</p>
              <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-8">
                Connect LMS Workspace
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
