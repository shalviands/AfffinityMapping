import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useBoardStore } from '../../store/useBoardStore';
import { useSessionStore } from '../../store/useSessionStore';
import { Database, ShieldAlert, Download, X, RefreshCw, Trash2 } from 'lucide-react';

export default function SystemIntegrityTool() {
  const [isOpen, setIsOpen] = useState(false);
  const projects = useProjectStore(s => s.projects);
  const board = useBoardStore(s => ({ clusters: s.clusters, projectId: s.projectId }));
  const session = useSessionStore(s => s.session);

  const [integrityStatus, setIntegrityStatus] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    
    const diagnostics = [];
    
    // 1. Check for Project/Board mismatch
    if (board.projectId && !projects.find(p => p.id === board.projectId)) {
        diagnostics.push({ level: 'error', message: `ORPHANED BOARD: Board is tied to project ${board.projectId} which does not exist.` });
    }

    // 2. Check for missing stakeholder links
    projects.forEach(p => {
        const boardClusters = p.board?.clusters || [];
        const sessionIdsOnBoard = new Set(boardClusters.flatMap(c => c.cards).map(card => card.sessionId).filter(Boolean));
        const registeredSessionIds = new Set(p.stakeholders?.map(s => s.sessionId).filter(Boolean));

        sessionIdsOnBoard.forEach(id => {
            if (!registeredSessionIds.has(id)) {
                diagnostics.push({ level: 'warning', message: `UNLINKED DATA: Project ${p.name} has board cards for session ${id} but no matching stakeholder record.` });
            }
        });
    });

    // 3. Check for empty projects
    projects.forEach(p => {
        if (!p.stakeholders || p.stakeholders.length === 0) {
            diagnostics.push({ level: 'info', message: `EMPTY PROJECT: ${p.name} has 0 stakeholders.` });
        }
    });

    setIntegrityStatus(diagnostics);
  }, [isOpen, projects, board]);

  const downloadDump = () => {
    const data = {
        timestamp: new Date().toISOString(),
        stores: {
            projects: useProjectStore.getState().projects,
            board: useBoardStore.getState().clusters,
            session: useSessionStore.getState().session
        },
        localStorage: { ...localStorage }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incubx-integrity-dump-${Date.now()}.json`;
    a.click();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] p-2 bg-gray-800 text-white rounded-full opacity-20 hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-bold uppercase"
      >
        <Database className="w-4 h-4" /> Integrity
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                 <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Integrity & Recovery</h2>
                 <p className="text-xs text-gray-500 font-medium">Internal Data State Audit</p>
              </div>
           </div>
           <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Diagnostics Column */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-brand-500" /> Live Audit Log
                </h3>
                <div className="space-y-3">
                    {integrityStatus.length === 0 ? (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-medium">
                            No critical data integrity issues detected. All board cards are correctly linked to project stakeholders.
                        </div>
                    ) : (
                        integrityStatus.map((stat, i) => (
                            <div key={i} className={`p-4 rounded-2xl border flex items-start gap-3 ${
                                stat.level === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                                stat.level === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                'bg-blue-50 border-blue-100 text-blue-700'
                            }`}>
                                <ShieldAlert className="w-4 h-4 mt-0.5" />
                                <span className="text-xs font-semibold leading-relaxed">{stat.message}</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                    <h4 className="text-sm font-bold mb-2">Emergency Recovery</h4>
                    <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                        If data is missing from the UI but exists in your underlying database, you can download a full state dump to avoid permanent loss.
                    </p>
                    <button 
                        onClick={downloadDump}
                        className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export Store Dump (JSON)
                    </button>
                </div>
            </div>

            {/* Raw Store Previews */}
            <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-2">Registry: Projects ({projects.length})</h3>
                   <div className="bg-gray-50 rounded-2xl p-4 max-h-40 overflow-y-auto border border-gray-100">
                       {projects.map(p => (
                           <div key={p.id} className="text-[10px] font-mono mb-2 p-2 bg-white border border-gray-200 rounded flex justify-between">
                               <span>{p.name} ({p.id})</span>
                               <span className="text-brand-500 font-bold">{p.stakeholders?.length || 0} SH</span>
                           </div>
                       ))}
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-2">Registry: Board State</h3>
                   <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-[10px] font-mono">
                       <div>Active Project ID: <span className="font-bold text-brand-600">{board.projectId || 'None'}</span></div>
                       <div className="mt-2">Total Clusters: {board.clusters?.length || 0}</div>
                       <div>Total Cards: {board.clusters?.flatMap(c => c.cards).length || 0}</div>
                   </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-orange-800 font-bold text-xs mb-2">
                        <Trash2 className="w-4 h-4" /> Extreme: Force Wipe
                    </div>
                    <p className="text-[10px] text-orange-700 mb-4">
                        Clears ALL projects and sessions. Use only if database is corrupted beyond repair.
                    </p>
                    <button 
                        onClick={() => {
                            if (confirm('DANGER: This will delete ALL your research data permanently. Proceed?')) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}
                        className="w-full border-2 border-orange-500 text-orange-600 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-orange-500 hover:text-white transition-all"
                    >
                        Factory Reset System
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
