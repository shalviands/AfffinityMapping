import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useBoardStore } from '../../store/useBoardStore';
import { Network, Grid, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHydrateProject } from '../../hooks/useHydrateProject';

export default function LongitudinalTimeline() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  useHydrateProject(projectId);
  
  const getProject = useProjectStore(s => s.getProject);
  const project = getProject(projectId);
  const clusters = useBoardStore(s => s.clusters);
  
  const themes = clusters.filter(c => !c.isUnc);

  if (themes.length === 0) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-slate-50 p-12 text-center">
            <LayoutGrid className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 uppercase">Interactive Timeline Offline</h2>
            <p className="text-sm text-gray-500 max-w-sm mt-2">The timeline requires at least one thematic cluster on the board to track momentum over time.</p>
            <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-brand-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-600">Back to Board</button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-canvas relative overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 w-full relative">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/project/${projectId}/board`)} 
                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="Back to Board"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase">Longitudinal Timeline</h1>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{project?.name} — Tracking Theme Momentum Organically</p>
              </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => navigate(`../patterns`)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white font-bold text-gray-400 text-[10px] uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2 shadow-sm"><Grid className="w-3.5 h-3.5"/> Heatmap</button>
             <button disabled className="px-4 py-2 rounded-lg bg-gray-100 font-bold text-gray-800 text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm border border-gray-200"><Network className="w-3.5 h-3.5"/> Timeline</button>
          </div>
      </div>

      <div className="flex-1 p-16 flex justify-center w-full">
         <div className="relative w-full max-w-4xl">
             
             {/* Lines */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 0}}>
                 <path d="M 100 150 Q 250 120 400 150 T 700 80" stroke="#f43f5e" strokeWidth="4" fill="none" className="animate-pulse" />
                 <path d="M 100 250 Q 250 180 400 250 T 700 300" stroke="#8b5cf6" strokeWidth="4" fill="none" opacity="0.5" />
             </svg>
             
             {/* Columns */}
             <div className="absolute inset-0 grid grid-cols-3 pl-[100px] pr-[100px] z-10">
                 
                 {/* Round 1 */}
                 <div className="relative border-l border-dashed border-gray-300">
                    <span className="absolute -top-10 left-0 -translate-x-1/2 font-bold text-gray-500 uppercase tracking-widest text-xs">Round 1</span>
                    <div className="absolute top-[130px] left-0 -translate-x-1/2 w-10 h-10 bg-rose-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110">2</div>
                    <div className="absolute top-[230px] left-0 -translate-x-1/2 w-14 h-14 bg-violet-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-md font-bold cursor-pointer hover:scale-110">3</div>
                 </div>

                 {/* Round 2 */}
                 <div className="relative border-l border-dashed border-gray-300">
                    <span className="absolute -top-10 left-0 -translate-x-1/2 font-bold text-gray-500 uppercase tracking-widest text-xs">Round 2</span>
                    <div className="absolute top-[130px] left-0 -translate-x-1/2 w-14 h-14 bg-rose-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-md font-bold cursor-pointer hover:scale-110">2</div>
                    <div className="absolute top-[230px] left-0 -translate-x-1/2 w-8 h-8 bg-violet-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110">0</div>
                 </div>

                 {/* Round 3 */}
                 <div className="relative border-l border-dashed border-gray-300">
                    <span className="absolute -top-10 left-0 -translate-x-1/2 font-bold text-gray-500 uppercase tracking-widest text-xs">Round 3</span>
                    <div className="absolute top-[60px] left-0 -translate-x-1/2 w-20 h-20 bg-rose-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold cursor-pointer hover:scale-110">4</div>
                    <div className="absolute top-[280px] left-0 -translate-x-1/2 w-12 h-12 bg-violet-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110">1</div>
                 </div>

             </div>

             {/* Legend */}
             <div className="absolute bottom-0 right-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                     <span className="w-3 h-3 rounded-full bg-rose-500 block" /> App Trust Issues
                 </div>
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                     <span className="w-3 h-3 rounded-full bg-violet-500 block" /> PIN Creation Confusion
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}
