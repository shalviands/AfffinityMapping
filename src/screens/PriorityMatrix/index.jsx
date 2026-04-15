import React, { useMemo, useState } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useHydrateProject } from '../../hooks/useHydrateProject';
import { ArrowLeft, ArrowRight, X, Info, Flame, Target, Eye, Activity } from 'lucide-react';
import clsx from 'clsx';
import PriorityCard from '../../components/shared/PriorityCard';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  rectIntersection,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';


export default function PriorityMatrix() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  useHydrateProject(projectId);

  const clusters = useBoardStore(s => s.clusters);
  const [activeCluster, setActiveCluster] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [overrides, setOverrides] = useState({}); // { clusterId: quadrantId }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Categorize clusters into quadrants with manual overrides
  const quadrants = useMemo(() => {

    const validClusters = clusters.filter(c => !c.isUnc && c.cards.length > 0);
    const totalCards = validClusters.reduce((sum, c) => sum + c.cards.length, 0);
    const meanFrequency = validClusters.length > 0 ? totalCards / validClusters.length : 0;

    const groups = {
      actFirst: [],    // High Intensity, High Frequency
      highUrgency: [], // High Intensity, Low Frequency
      monitor: [],     // Low Intensity, High Frequency
      lowPriority: []  // Low Intensity, Low Frequency
    };

    validClusters.forEach(c => {
      const negCount = c.cards.filter(card => card.sentiment === 'negative').length;
      const intensity = (negCount / c.cards.length) * 100;
      const frequency = c.cards.length;

      const isHighIntensity = intensity > 50;
      const isHighFrequency = frequency > meanFrequency || frequency > 3;

      // Apply override if present
      const override = overrides[c.id];
      if (override) {
          groups[override].push(c);
          return;
      }

      if (isHighIntensity && isHighFrequency) groups.actFirst.push(c);
      else if (isHighIntensity && !isHighFrequency) groups.highUrgency.push(c);
      else if (!isHighIntensity && isHighFrequency) groups.monitor.push(c);
      else groups.lowPriority.push(c);
    });


    return groups;
  }, [clusters, overrides]);

  const handleDragStart = (event) => {
    const { active } = event;
    const item = clusters.find(c => c.id === active.id);
    setDraggedItem(item);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (over && active.id !== over.id) {
       // Check if dropped over a quadrant
       const overId = over.id;
       if (['actFirst', 'highUrgency', 'monitor', 'lowPriority'].includes(overId)) {
          setOverrides(prev => ({ ...prev, [active.id]: overId }));
       }
    }
  };

  if (clusters.filter(c => !c.isUnc).length === 0) {

      return (
        <div className="flex flex-col h-full bg-slate-50 relative">
             <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                 <button onClick={() => navigate(`/project/${projectId}/board`)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 pr-5 border-r border-gray-100">
                     <ArrowLeft className="w-4 h-4" /> Back to Board
                 </button>
                 <h1 className="text-lg font-bold tracking-tight text-gray-900 uppercase">Priority Matrix</h1>
                 <div className="w-40" />
             </div>
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-6 transform -rotate-12 border border-brand-100">
                     <ArrowRight className="w-10 h-10 text-brand-300 shadow-sm" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Matrix Logic Offline</h2>
                 <p className="text-sm text-gray-500 max-w-sm mt-3 leading-relaxed">Run Auto-Cluster on your board or group cards manually to see findings here.</p>
                 <button onClick={() => navigate(`/project/${projectId}/board`)} className="mt-8 px-8 py-3 bg-brand-500 text-white rounded-2xl font-bold tracking-widest text-xs uppercase hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-all">Return to Board</button>
             </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
       {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 z-30 bg-white/80 backdrop-blur-md">
           <button onClick={() => navigate(`/project/${projectId}/board`)} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 border-r border-gray-100 pr-5 uppercase tracking-widest">
               <ArrowLeft className="w-4 h-4" /> Board
           </button>
           <h1 className="text-lg font-extrabold tracking-tighter text-gray-900 uppercase italic">INCUB<span className="text-brand-600">X</span> Priority Matrix</h1>
           <button onClick={() => navigate(`/project/${projectId}/export`)} className="flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-800 border-l border-gray-100 pl-5 uppercase tracking-widest">
               Export Findings <ArrowRight className="w-4 h-4" />
           </button>
       </div>

       <div className="flex-1 flex overflow-hidden bg-slate-50">
           {/* Main Grid Area */}
           <div className="flex-1 p-4 lg:p-6 overflow-auto max-h-full">
              <DndContext 
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToFirstScrollableAncestor]}
              >
                  <div 
                    className="grid gap-4 h-full"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(2, minmax(300px, 1fr))'
                    }}
                  >
                      {/* Q1: Act First */}
                      <Quadrant 
                        id="actFirst"
                        title="Act First" 
                        subtitle="High Intensity • High Frequency"
                        icon={<Flame className="w-4 h-4 text-red-500" />}
                        color="bg-red-50/50"
                        items={quadrants.actFirst}
                        onCardClick={setActiveCluster}
                      />

                      {/* Q2: High Urgency */}
                      <Quadrant 
                        id="highUrgency"
                        title="Urgent - Low Signal" 
                        subtitle="High Intensity • Low Frequency"
                        icon={<Target className="w-4 h-4 text-amber-500" />}
                        color="bg-amber-50/50"
                        items={quadrants.highUrgency}
                        onCardClick={setActiveCluster}
                      />

                      {/* Q3: Monitor */}
                      <Quadrant 
                        id="monitor"
                        title="Monitor Intent" 
                        subtitle="Low Intensity • High Frequency"
                        icon={<Eye className="w-4 h-4 text-blue-500" />}
                        color="bg-blue-50/50"
                        items={quadrants.monitor}
                        onCardClick={setActiveCluster}
                      />

                      {/* Q4: Low Priority */}
                      <Quadrant 
                        id="lowPriority"
                        title="Low Priority" 
                        subtitle="Low Intensity • Low Frequency"
                        icon={<Activity className="w-4 h-4 text-gray-400" />}
                        color="bg-gray-50/50"
                        items={quadrants.lowPriority}
                        onCardClick={setActiveCluster}
                      />
                  </div>
                  
                  <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: {
                        active: {
                          opacity: '0.4',
                        },
                      },
                    }),
                  }}>
                    {draggedItem ? (
                      <div className="w-[280px] rotate-2 shadow-2xl">
                        <PriorityCard cluster={draggedItem} onClick={() => {}} />
                      </div>
                    ) : null}
                  </DragOverlay>
              </DndContext>
           </div>


           {/* Detail Sidebar */}
           {activeCluster && (
               <div className="w-[360px] bg-white border-l border-gray-200 h-full p-6 overflow-y-auto animate-fadeSlideIn shadow-2xl relative z-40">
                   <div className="flex justify-between items-start mb-6">
                       <div>
                          <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">{activeCluster.name || 'Unnamed Cluster'}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] bg-brand-50 text-brand-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">{activeCluster.cards.length} Core Signals</span>
                          </div>
                       </div>
                       <button onClick={() => setActiveCluster(null)} className="p-1 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full"><X className="w-4 h-4" /></button>
                   </div>
                   
                   {activeCluster.synthesis && (
                       <div className="mb-6 bg-slate-900 p-4 rounded-xl shadow-inner border border-white/10">
                           <h4 className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
                              <Info className="w-3 h-3" /> Strategic Context
                           </h4>
                           <p className="text-xs text-white leading-relaxed italic pr-2">"{activeCluster.synthesis}"</p>
                       </div>
                   )}

                   <div className="space-y-4">
                       <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100 pb-2">Full Signal Log</h4>
                       <div className="space-y-3">
                           {activeCluster.cards.map((card, i) => (
                               <div key={i} className="bg-white border border-gray-100 shadow-sm p-3 rounded-lg flex flex-col gap-2 group hover:border-brand-200 transition-colors">
                                   <div className="flex justify-between items-center">
                                       <div className={clsx("w-1.5 h-1.5 rounded-full", card.sentiment === 'positive' ? 'bg-green-500' : card.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400')} />
                                       <span className="text-[8px] font-bold text-gray-400 group-hover:text-brand-500 uppercase tracking-tighter">{card.speaker || 'Stakeholder'}</span>
                                   </div>
                                   <p className="text-xs text-gray-700 leading-relaxed break-words">"{card.text}"</p>
                                   {card.quote && (
                                       <div className="mt-1 pl-3 border-l-2 border-gray-100">
                                            <p className="text-[10px] text-gray-400 italic leading-snug">"{card.quote}"</p>
                                       </div>
                                   )}
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
}

function Quadrant({ id, title, subtitle, icon, color, items, onCardClick }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div 
            ref={setNodeRef}
            className={clsx(
                "flex flex-col border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white transition-colors", 
                color,
                isOver ? "ring-2 ring-brand-500 ring-inset border-transparent bg-brand-50/50" : ""
            )}
        >
            <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10">
                <div>
                   <h3 className="text-xs font-black uppercase text-gray-900 tracking-widest flex items-center gap-2">
                       {icon} {title}
                   </h3>
                   <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 opacity-60 tracking-tight">{subtitle}</p>
                </div>
                <span className="text-[10px] font-extrabold text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">{items.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[100px]">
                 <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-[150px]">
                        {items.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl m-2 opacity-50 min-h-[100px]">
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Signals</span>
                            </div>
                        ) : (
                            items.map(cluster => (
                                <PriorityCard 
                                    key={cluster.id} 
                                    cluster={cluster} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onCardClick(cluster);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}


