import React, { useMemo } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { Lightbulb, Info } from 'lucide-react';

export default function GuidedSidebar() {
  const guidedModeOpen = useBoardStore(s => s.guidedModeOpen);
  const clusters = useBoardStore(s => s.clusters);

  const guidance = useMemo(() => {
     const unclustered = clusters.find(c => c.isUnc)?.cards?.length || 0;
     const conflicts = clusters.filter(c => c.conflict).length;
     const unnamed = clusters.filter(c => !c.isUnc && !c.name).length;

     if (unclustered > 0) return `You have ${unclustered} unsorted cards. Drag them into clusters or create a new one.`;
     if (unnamed > 0) return `Name your clusters — 3-5 words describing the common theme.`;
     if (conflicts > 0) return `You have ${conflicts} conflicts. Click the yellow badge to understand what's contradicting.`;
     return "Board is complete — prioritise your clusters now.";
  }, [clusters]);

  if (!guidedModeOpen) return null;

  return (
    <div className="w-[220px] bg-white border-l border-gray-200 h-full flex flex-col p-4 z-20 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] animate-fadeSlideIn">
       <div className="flex items-center gap-2 mb-6 p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
           <Lightbulb className="w-4 h-4 flex-shrink-0" />
           <span className="text-[10px] uppercase font-bold tracking-widest">Guided Mode</span>
       </div>

       <h3 className="text-sm font-bold text-gray-900 mb-2">What to do now:</h3>
       <p className="text-sm leading-relaxed text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{guidance}</p>

       <div className="mt-8">
           <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
               <Info className="w-3.5 h-3.5 text-brand-500" /> What is Affinity Mapping?
           </h4>
           <div className="text-[11px] text-gray-500 leading-relaxed border-l-2 border-brand-200 pl-3">
               Affinity mapping is a synthesis technique. It forces you to group raw, chaotic user quotes into structured thematic buckets. By doing this, you identify which problems are universally true versus isolated complaints.
           </div>
       </div>
    </div>
  );
}
