import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Info, ArrowLeft } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

export default function TextPaste() {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const setTranscript = useSessionStore(s => s.setTranscript);
  const setStep = useSessionStore(s => s.setStep);
  const [text, setText] = useState('');

  const processText = () => {
    setTranscript(text);
    navigate(`/project/${projectId}/session/${id}/processing`);
  };

  const handleBack = () => {
     setStep(4);
     navigate(`/project/${projectId}/add-feedback`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="lg:w-1/3 bg-white border-r border-gray-200 p-8 flex flex-col">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-600 transition-colors mb-8 group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Mode
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Paste Transcript</h2>
        <p className="text-sm text-gray-600 mb-6">Paste your meeting notes or raw transcript directly here. The AI will extract insights automatically.</p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-auto">
            <div className="flex gap-2 items-start text-amber-800 font-medium text-sm mb-2">
                <Info className="w-5 h-5 flex-shrink-0" /> Format Guide
            </div>
            <p className="text-xs text-amber-800/80 mb-2">Label speakers for attribution:</p>
            <pre className="text-[10px] bg-white p-2 rounded border border-amber-100 text-gray-700 whitespace-pre-wrap">
Speaker 1: The UI is very confusing to navigate.{'\n'}
Speaker 2: Yes, I couldn't find the export button.
            </pre>
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col bg-canvas">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your transcript here..."
            className="flex-1 w-full rounded-2xl border-none shadow-sm p-6 text-sm outline-none resize-none"
          />
          <div className="mt-4 flex justify-end">
              <button 
                  disabled={text.length < 10}
                  onClick={processText}
                  className="bg-brand-500 disabled:opacity-50 text-white rounded-xl px-8 py-3 font-medium hover:bg-brand-600 active:scale-95 transition-all"
              >
                  Process Text
              </button>
          </div>
      </div>
    </div>
  );
}
