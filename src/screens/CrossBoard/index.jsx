import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useBoardStore } from '../../store/useBoardStore';
import { Network, Grid, LayoutGrid, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useHydrateProject } from '../../hooks/useHydrateProject';

export default function CrossBoardPatterns() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  useHydrateProject(projectId);
  
  const getProject = useProjectStore(s => s.getProject);
  const project = getProject(projectId);
  const clusters = useBoardStore(s => s.clusters);
  
  // Real data extraction for heatmap
  const themes = clusters.filter(c => !c.isUnc).map(c => c.name);
  const stakeholders = project?.stakeholders || [];
  
  // Calculate hits per theme per stakeholder
  const intensityData = themes.map(themeName => {
      const cluster = clusters.find(c => c.name === themeName);
      return stakeholders.map(sh => {
          return cluster?.cards?.filter(card => card.originalStakeholder === sh.name).length || 0;
      });
  });

  const getColor = (val) => {
      if(val === 0) return 'bg-white border-gray-100';
      if(val === 1) return 'bg-brand-100 border-brand-200';
      if(val === 2) return 'bg-brand-300 border-brand-400 text-brand-900';
      if(val >= 3) return 'bg-brand-500 border-brand-600 text-white';
  };

  if (themes.length === 0) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-slate-50 p-12 text-center">
            <LayoutGrid className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 uppercase">No Patterns Identified</h2>
            <p className="text-sm text-gray-500 max-w-sm mt-2">Patterns are generated automatically once you cluster insights on the board. Start by grouping signals into thematic clusters.</p>
            <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-brand-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-600">Back to Board</button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/project/${projectId}/board`)} 
                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="Back to Board"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase">Pattern Heatmap</h1>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{project?.name} — {stakeholders.length} Stakeholders Visited</p>
              </div>
          </div>
          <div className="flex gap-2">
             <button disabled className="px-4 py-2 rounded-lg bg-gray-100 font-bold text-gray-800 text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm border border-gray-200"><Grid className="w-3.5 h-3.5"/> Heatmap</button>
             <button onClick={() => navigate(`../timeline`)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white font-bold text-gray-400 text-[10px] uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2"><Network className="w-3.5 h-3.5"/> Timeline</button>
          </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm inline-block min-w-full font-mono">
              <table className="w-full text-sm text-left">
                  <thead>
                      <tr>
                          <th className="pb-4 font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Identified Themes</th>
                          {stakeholders.map(sh => (
                              <th key={sh.id} className="pb-4 px-2 font-semibold text-gray-600 truncate text-xs text-center min-w-[80px]">{sh.name}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                      {themes.map((t, i) => {
                          const total = intensityData[i].reduce((a,b)=>a+b,0);
                          const validated = total >= 5;
                          
                          return (
                          <tr key={t} className="border-t border-gray-100 group">
                              <td className="py-4 pr-4">
                                  <div className="flex items-center gap-2">
                                      <div className={clsx("w-1 h-8 rounded-full", validated ? 'bg-green-500' : 'bg-gray-200')} />
                                      <span className={clsx("font-medium", validated ? 'text-gray-900' : 'text-gray-600')}>{t}</span>
                                      {validated && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase ml-2">Validated</span>}
                                  </div>
                              </td>
                              
                              {intensityData[i].map((val, colIdx) => (
                                  <td key={colIdx} className="p-2 text-center">
                                      <div className={clsx("w-12 h-12 mx-auto rounded-lg border flex items-center justify-center font-bold text-lg cursor-pointer hover:scale-110 hover:shadow-md transition-all", getColor(val))}>
                                          {val > 0 ? val : ''}
                                      </div>
                                  </td>
                              ))}
                          </tr>
                          )
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
