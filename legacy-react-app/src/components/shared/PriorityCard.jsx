import React from 'react';
import { clsx } from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function PriorityCard({ cluster, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cluster.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  const intensity = Math.round((cluster.cards.filter(c => c.sentiment === 'negative').length / cluster.cards.length) * 100);
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "bg-white border p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden",
        cluster.accentColor === 'violet' ? "border-violet-100 hover:border-violet-300" :
        cluster.accentColor === 'teal' ? "border-teal-100 hover:border-teal-300" :
        cluster.accentColor === 'rose' ? "border-rose-100 hover:border-rose-300" :
        "border-brand-100 hover:border-brand-300"
      )}
    >
      <div className={clsx(
        "absolute top-0 left-0 w-1 h-full",
        cluster.accentColor === 'violet' ? "bg-violet-400" :
        cluster.accentColor === 'teal' ? "bg-teal-400" :
        cluster.accentColor === 'rose' ? "bg-rose-400" :
        "bg-brand-400"
      )} />
      
      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight line-clamp-2 leading-tight pr-4">
          {cluster.name || 'Unnamed Theme'}
        </h4>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[9px] font-bold text-gray-400">{cluster.cards.length} Signals</span>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-500 italic line-clamp-2 mb-2 leading-relaxed pointer-events-none">
        {cluster.synthesis || "No synthesis available."}
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Intensity: {intensity}%</span>
        </div>
        <span className="text-[8px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100">ID: {cluster.id.slice(0, 4)}</span>
      </div>
    </div>
  );
}

