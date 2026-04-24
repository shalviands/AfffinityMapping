import React, { useState } from 'react';
import { Scissors, X, Save } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

export default function SplitCardModal({ card, onClose, onSplit }) {
  const [part1, setPart1] = useState(card.text.substring(0, Math.floor(card.text.length / 2)) + '...');
  const [part2, setPart2] = useState('...' + card.text.substring(Math.floor(card.text.length / 2)));

  const handleSave = () => {
      const uniqueId = () => `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const c1 = { ...card, id: uniqueId(), text: part1 };
      const c2 = { ...card, id: uniqueId(), text: part2 };
      
      if (onSplit) onSplit(card.id, [c1, c2]);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeSlideIn">
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
          <div className="bg-teal-50 border-b border-teal-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center"><Scissors className="w-4 h-4"/></div>
                  <h3 className="font-bold text-gray-900">Split Card into Two</h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-teal-100 rounded text-teal-600"><X className="w-5 h-5"/></button>
          </div>

          <div className="p-6">
              <div className="mb-6">
                  <p className="text-xs uppercase font-bold text-gray-400 mb-2">Original Card</p>
                  <p className="text-sm bg-gray-50 border border-gray-100 p-3 rounded-lg text-gray-600 italic">"{card.text}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">New Card A</label>
                      <textarea 
                        value={part1} 
                        onChange={(e) => setPart1(e.target.value)} 
                        className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-400 resize-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">New Card B</label>
                      <textarea 
                        value={part2} 
                        onChange={(e) => setPart2(e.target.value)} 
                        className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-400 resize-none"
                      />
                  </div>
              </div>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={!part1 || !part2} className="px-5 py-2 rounded-lg font-medium text-sm text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50">
                 <Save className="w-4 h-4" /> Save Split
              </button>
          </div>
       </div>
    </div>
  );
}
