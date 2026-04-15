import React from 'react';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';

const SentimentDot = ({ sentiment }) => {
  const colorMap = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-gray-400'
  };
  return <div className={clsx("w-2 h-2 rounded-full", colorMap[sentiment] || colorMap.neutral)} />
};

export default function InsightCard({ card, clusterAccent, isDragging }) {
  if (!card) return null;

  return (
    <div
      className={clsx(
        "group relative w-full bg-white rounded-xl shadow-sm border p-3 mb-3 transition-all",
        card.confidence === 'low' ? "border-dashed border-gray-300" : "border-gray-100"
      )}
    >
      <div className="flex justify-between items-start mb-2">
         <div className="absolute top-3 right-3">
           <SentimentDot sentiment={card.sentiment} />
         </div>
      </div>
      
      <p className="text-xs leading-relaxed text-gray-800 pr-4 mt-1">
        {card.text}
      </p>

      <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
             {card.frequency > 1 && (
                <span className="bg-violet-100 text-violet-700 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  ×{card.frequency}
                </span>
             )}
          </div>
          {card.speaker && (
             <span className="text-[10px] text-gray-400 ml-auto">{card.speaker}</span>
          )}
      </div>
    </div>
  );
}
