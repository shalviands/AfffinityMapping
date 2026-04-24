import Link from 'next/link';
import { MoveRight, Zap, Target, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100 mb-4">
          <Zap className="w-4 h-4 mr-2" />
          v2.0 — Next.js + Supabase
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-slate-900">
          Turn stakeholder voice into <br />
          <span className="text-indigo-600">atomic product insights.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          INCUBX uses research-grade AI to extract, cluster, and synthesize patterns from your interviews. 
          Stop guessing. Start building what they actually need.
        </p>
        <div className="flex justify-center gap-4 pt-8">
          <Link 
            href="/session/new" 
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center group"
          >
            Start New Session
            <MoveRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="https://incubx.in/guide" 
            className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            Read Methodology
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Atomic Extraction</h3>
          <p className="text-slate-600">Every meaningful signal is captured as a separate card. Repetition is signal, not noise.</p>
        </div>
        <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Affinity Mapping</h3>
          <p className="text-slate-600">AI-powered clustering that finds patterns you might miss. Bottom-up synthesis at scale.</p>
        </div>
        <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Founder Synthesis</h3>
          <p className="text-slate-600">Actionable advice instead of academic summaries. Know exactly what to build next.</p>
        </div>
      </div>
    </main>
  );
}
