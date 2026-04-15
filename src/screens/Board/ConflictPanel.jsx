import React from 'react';
import { X, AlertCircle, Check, Flag, MessageSquare } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';

export default function ConflictPanel({ cluster, onClose }) {
  // 1. Properly select actions via hooks
  const resolveConflict = useBoardStore(s => s.resolveConflict);

  if (!cluster) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn border border-amber-200">
        <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Logical Conflict Detected</h2>
              <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">AI Synthesis Engine Audit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Tension in {cluster.name}</h3>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
               "{cluster.synthesis || 'No synthesis text available.'}"
            </p>
          </div>

          <div className="space-y-3">
             <button 
                onClick={() => resolveConflict(cluster.id, 'both')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50 transition-all text-left"
             >
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                   <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-bold text-gray-900 text-sm">Acknowledge Tension</h4>
                   <p className="text-[11px] text-gray-500">Merge both signals and note the contradiction in the theme.</p>
                </div>
             </button>

             <button 
                onClick={() => resolveConflict(cluster.id, 'flag')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
             >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                   <Flag className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-bold text-gray-900 text-sm">Flag for Mentor</h4>
                   <p className="text-[11px] text-gray-500">Escalate conflict for professional review before synthesis.</p>
                </div>
             </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end px-8">
           <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest px-4 py-2">
              Close Audit
           </button>
        </div>
      </div>
    </div>
  );
}
