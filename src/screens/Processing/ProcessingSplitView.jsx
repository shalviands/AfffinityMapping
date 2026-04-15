import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/useSessionStore';
import { callAI } from '../../services/ai';
import { AI_CONFIG } from '../../config/ai.config';

import { buildExtractionPrompt, EXTRACTION_SYSTEM_PROMPT } from '../../services/ai/prompts';
import { normalizeCard } from '../../utils/normalizeCard';
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export default function ProcessingSplitView() {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const setStep = useSessionStore(s => s.setStep);
  const transcript = useSessionStore(s => s.transcript);
  const session = useSessionStore(s => s.session) || { researchQuestion: 'Example Question', sector: 'Fintech', stage: 'MVP' };
  const setCards = useSessionStore(s => s.setCards);
  
  const [extractedCards, setExtractedCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingError, setProcessingError] = useState(null);
  const [aiMetadata, setAiMetadata] = useState({ model: '', engine: '' });


  useEffect(() => {
    let mounted = true;
    
    // Split transcript into chunks for higher reliability
    function chunkTranscript(text, size = 2000) {
        if (!text) return ["Speaker 1: Testing..."];
        const chunks = [];
        let index = 0;
        while (index < text.length) {
            chunks.push(text.slice(index, index + size));
            index += size;
        }
        return chunks;
    }

    async function processTranscript() {
        if (!transcript) {
            await new Promise(r => setTimeout(r, 1000));
        }

        try {
           setIsProcessing(true);
           
           if (transcript && transcript.includes("No Bhashini or OpenAI API key")) {
               throw new Error("Local transcription requires an API key or external service. Please use 'Text Paste' to analyze manual notes.");
           }

           const transcriptChunks = chunkTranscript(transcript);
           console.log(`[Processing] Transcript split into ${transcriptChunks.length} chunks.`);
           
           let allExtracted = [];
           let lastModel = '';

           for (const [i, chunk] of transcriptChunks.entries()) {
               console.log(`[Processing] Processing chunk ${i + 1}/${transcriptChunks.length}...`);
               
               const prompt = buildExtractionPrompt(
                   chunk, 
                   session.researchQuestion, 
                   session.sector, 
                   session.stage
               );
               
               const res = await callAI({
                 systemPrompt: EXTRACTION_SYSTEM_PROMPT,
                 userPrompt: prompt,
                 model: AI_CONFIG.models.extraction,
                 jsonMode: true
               });

               if (!res || !res.data) {
                   console.warn(`[Processing] AI returned empty or invalid data for chunk ${i+1}`);
                   continue; // Skip this chunk but keep going
               }

               const parsed = res.data;
               const populated = (parsed || []).map((c, idx) => normalizeCard(c, `${i}-${idx}`, session.stakeholderName, id));
               
               allExtracted = [...allExtracted, ...populated];
               lastModel = res.modelUsed;

               // Update UI partially if multiple chunks
               if (mounted && transcriptChunks.length > 1) {
                   setExtractedCards([...allExtracted]);
               }
           }
           
           if (mounted) {
               setAiMetadata({
                   model: lastModel,
                   engine: session.transcriptionEngine || 'webspeech'
               });

               setExtractedCards(allExtracted);
               setCards(allExtracted);
               setIsProcessing(false);
               setProcessingError(null);
           }
        } catch (e) {
           console.error("[Processing Error]", e);
           if (mounted) {
               setProcessingError(e.message || "An unknown error occurred during AI extraction.");
               setIsProcessing(false);
           }
        }
    }

    processTranscript();
    return () => { mounted = false; };
  }, [transcript]);

  // Guard against accidental refresh/close during processing (Issue #16)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
        if (isProcessing) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessing]);

  return (
    <div className="flex flex-col lg:flex-row h-full bg-canvas">
      {/* Left panel - Transcript */}
      <div className="lg:w-[45%] bg-white border-r border-gray-200 p-6 flex flex-col relative">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title="Back to Input"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Transcript
                    <span className="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">English Mode</span>
                </h2>
            </div>
             <div className="flex flex-col items-end gap-1">
                <div className="px-2 py-0.5 bg-brand-50 border border-brand-200 text-[9px] uppercase font-bold text-brand-600 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                    Engine: {aiMetadata.engine || 'WebSpeech'}
                </div>
                <div className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-[9px] uppercase font-bold text-teal-600 rounded">
                    {aiMetadata.model.split('/')[1]?.split(':')[0] || 'Gemma'}
                </div>
             </div>

         </div>
         
         <div className="flex-1 overflow-y-auto pr-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
             {transcript || (
                 <span className="italic text-gray-400">Waiting for live transcript generation from the AI server...</span>
             )}
         </div>

         {/* Animated Separator effect */}
         {isProcessing && (
             <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 via-teal-400 to-brand-400 animate-pulse" />
         )}
      </div>

      {/* Right panel - Cards forming */}
      <div className="flex-1 p-6 flex flex-col bg-slate-50 relative overflow-hidden">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Insight Cards</h2>
            <span className="text-sm font-semibold text-brand-600">
               {extractedCards.length} cards extracted
            </span>
         </div>

         {isProcessing ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50/80 backdrop-blur-sm z-10">
                 <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                 <p className="text-sm font-medium text-gray-700 mb-2">Analyzing transcript patterns...</p>
                 <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-500 w-1/2 animate-pulse" />
                 </div>
             </div>
         ) : extractedCards.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Extraction Failed</h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 max-w-sm">
                    <p className="text-xs font-mono text-red-700 break-all">
                        {processingError || "The AI couldn't find structured insights in this transcript."}
                    </p>
                </div>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                    This usually happens due to API quota limits, invalid keys, or short transcripts.
                </p>
                <button 
                  onClick={() => navigate(-1)}
                  className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition"
                >
                    Try Another Method
                </button>
            </div>
         ) : (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fadeSlideIn">
                 <div className="flex items-center gap-3">
                     <CheckCircle2 className="w-6 h-6 text-green-500" />
                     <span className="text-sm font-semibold text-green-800">Processing complete — {extractedCards.length} cards extracted</span>
                 </div>
                 <button 
                   onClick={() => navigate(`/project/${projectId}/session/${id}/review`)}
                   className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                 >
                    Review Cards <ChevronRight className="w-4 h-4" />
                 </button>
            </div>
         )}
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-8 pr-2">
             {extractedCards.map((c, i) => (
                 <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fadeSlideIn h-min" style={{ animationDelay: (i * 100) + 'ms' }}>
                     <div className="flex justify-between items-start mb-2">
                        <span className={clsx("w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 mt-1", c.sentiment === 'positive' ? 'bg-green-500' : c.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400')} />
                     </div>
                     <p className="text-sm text-gray-800">{c.text}</p>
                     
                     <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] uppercase font-bold tracking-wide">
                        <span className="text-gray-400">{c.speaker || 'Unknown'}</span>
                        {c.confidence === 'low' && <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Low Confidence</span>}
                     </div>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
}
