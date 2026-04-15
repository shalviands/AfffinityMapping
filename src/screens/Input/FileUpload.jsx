import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useSessionStore } from '../../store/useSessionStore';
import { AI_CONFIG } from '../../config/ai.config';
import { BHASHINI_CONFIG } from '../../config/bhashini.config';
import { transcribeWithBhashini } from '../../services/bhashini/transcribe.service';
import { AlertCircle, UploadCloud, FileAudio, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

export default function FileUpload() {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const setTranscript = useSessionStore(s => s.setTranscript);
  const setStep = useSessionStore(s => s.setStep);
  const [file, setFile] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Check for any key that can handle transcription (Bhashini or Groq)
  const hasTranscriptionKey = BHASHINI_CONFIG.apiKey || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

  const handleDrop = (e) => {
    e.preventDefault();
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
          setFile(e.target.files[0]);
          setError(null);
      }
  };

  const handleBack = () => {
    setStep(4);
    navigate(`/project/${projectId}/add-feedback`);
  };

  const processFile = async () => {
    if (!file || !hasTranscriptionKey) return;
    
    setIsTranscribing(true);
    setError(null);

    try {
      // Use the 3-tier transcription service
      const result = await transcribeWithBhashini(file);
      
      if (result && result.transcript) {
        setTranscript(result.transcript);
        // Track the engine used for the ProviderBadge
        useSessionStore.getState().setSession({ transcriptionEngine: result.engine });
        navigate(`/project/${projectId}/session/${id}/processing`);
      } else {
        throw new Error("Transcription returned empty result. Try a different file format.");
      }
    } catch (err) {
      console.error('File transcription failed:', err);
      setError(err.message || "Failed to transcribe audio. Verify your API keys in Settings.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 px-4 bg-canvas relative">
       <button 
          onClick={handleBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-600 transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Mode
        </button>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-[560px] w-full p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Upload Recording</h2>
            <p className="text-gray-500 text-sm mb-6">Upload an audio or video file to be transcribed.</p>

            {!hasTranscriptionKey && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Transcription Keys Missing</h4>
                        <p className="text-xs text-amber-700 leading-relaxed mt-1">
                            Local transcription requires a **Bhashini** or **Groq/OpenAI** API key. Please configure them in the Board Settings or your `.env` file.
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-red-900 uppercase tracking-tight">Processing Error</h4>
                        <p className="text-xs text-red-700 leading-relaxed mt-1">{error}</p>
                    </div>
                </div>
            )}

            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="audio/*,video/*" 
                onChange={handleFileChange} 
                disabled={isTranscribing || !hasTranscriptionKey}
            />

            <div 
              onClick={() => !isTranscribing && hasTranscriptionKey && fileInputRef.current?.click()}
              onDragOver={(e) => !isTranscribing && hasTranscriptionKey && e.preventDefault()}
              onDrop={(e) => !isTranscribing && hasTranscriptionKey && handleDrop(e)}
              className={clsx(
                "w-full border-2 border-dashed rounded-2xl p-12 transition flex flex-col items-center justify-center",
                (!hasTranscriptionKey || isTranscribing) ? "bg-gray-50 border-gray-200 cursor-not-allowed" : "border-violet-200 bg-violet-50/30 hover:bg-violet-50 cursor-pointer"
              )}
            >
                {isTranscribing ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                        <span className="font-semibold text-gray-900">Transcribing audio...</span>
                        <p className="text-xs text-gray-500">This may take a minute depending on file size.</p>
                    </div>
                ) : file ? (
                   <div className="flex flex-col items-center gap-2">
                       <CheckCircle2 className="w-10 h-10 text-green-500" />
                       <span className="font-medium text-gray-900">{file.name}</span>
                       <span className="text-xs text-gray-500">{(file.size / (1024*1024)).toFixed(2)} MB</span>
                       <button 
                         className="text-[10px] text-brand-600 font-bold uppercase mt-2 hover:underline"
                         onClick={(e) => { e.stopPropagation(); setFile(null); }}
                       >
                         Change File
                       </button>
                   </div>
                ) : (
                    <>
                       <UploadCloud className={clsx("w-10 h-10 mb-4", !hasTranscriptionKey ? "text-gray-300" : "text-violet-400")} />
                       <p className="text-sm font-medium text-gray-700">Click to browse or drag & drop</p>
                       <p className="text-xs text-gray-400 mt-1">Supports MP3, WAV, M4A, MP4</p>
                    </>
                )}
            </div>

            <button 
               disabled={!file || !hasTranscriptionKey || isTranscribing}
               onClick={processFile}
               className="w-full bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 mt-8 font-medium hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
               {isTranscribing ? 'Processing...' : 'Process Recording'}
            </button>
       </div>
    </div>
  );
}

