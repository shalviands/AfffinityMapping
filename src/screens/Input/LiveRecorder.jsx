import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Pause, ArrowLeft, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useSessionStore } from '../../store/useSessionStore';

export default function LiveRecorder() {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const setGlobalTranscript = useSessionStore(s => s.setTranscript);
  const setStep = useSessionStore(s => s.setStep);
  
  const [isRecording, setIsRecording] = useState(true);
  const [time, setTime] = useState(0);
  const [liveText, setLiveText] = useState("");
  const [interimText, setInterimText] = useState("");

  const handleBack = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    setStep(4);
    navigate(`/project/${projectId}/add-feedback`);
  };
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // MediaRecorder setup
  useEffect(() => {
     async function startAudioRecording() {
         try {
             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
             mediaRecorderRef.current = new MediaRecorder(stream);
             audioChunksRef.current = [];
             
             mediaRecorderRef.current.ondataavailable = (e) => {
                 if (e.data.size > 0) audioChunksRef.current.push(e.data);
             };
             
             mediaRecorderRef.current.onstop = () => {
                 const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                 const url = URL.createObjectURL(blob);
                 useSessionStore.setState({ audioBlob: blob, audioUrl: url });
             };

             if (isRecording) mediaRecorderRef.current.start();
         } catch (e) {
             console.error("Audio recording failed:", e);
         }
     }
     startAudioRecording();

     return () => {
         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
             mediaRecorderRef.current.stop();
         }
     };
  }, []);

  // Sync Pause/Resume for MediaRecorder
  useEffect(() => {
      if (!mediaRecorderRef.current) return;
      if (isRecording && mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
      } else if (!isRecording && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause();
      }
  }, [isRecording]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
       setLiveText("Your browser doesn't support the web speech API. Please use Chrome.");
       return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let finalStr = "";
      let interimStr = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + " ";
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }
      if (finalStr) setLiveText(prev => prev + finalStr);
      setInterimText(interimStr);
    };

    recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
    };

    recognitionRef.current.onend = () => {
        // Automatically restart if still recording
        if (isRecording && recognitionRef.current) {
            try {
               recognitionRef.current.start();
            } catch (e) {}
        }
    };

    if (isRecording) {
        try {
            recognitionRef.current.start();
        } catch (e) {}
    } else {
        recognitionRef.current.stop();
    }

    return () => {
       if (recognitionRef.current) {
           recognitionRef.current.onend = null;
           recognitionRef.current.stop();
       }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    const confirmRetry = window.confirm("This will clear all recorded text and restart the session. Proceed?");
    if (!confirmRetry) return;
    
    setLiveText("");
    setInterimText("");
    setTime(0);
    
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setTimeout(() => {
            if (isRecording) recognitionRef.current.start();
        }, 100);
    }
  };

  const handleStop = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    
    // Pass the actual recorded text, or a generic placeholder showing the failure.
    const finalData = liveText.trim() ? liveText : "[Microphone Error / No Speech Detected] Try using the Text Paste option if your browser doesn't support WebSpeech API.";
    
    setGlobalTranscript(finalData);
    navigate(`/project/${projectId}/session/${id}/processing`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] text-white overflow-hidden p-6 relative">
      <button 
          onClick={handleBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Mode
      </button>

      <div className="text-2xl font-mono mb-12 tracking-widest flex items-center gap-4">
        <span className={isRecording ? "text-red-500 animate-pulse" : "text-slate-500"}>●</span>
        {formatTime(time)}
      </div>
      
      <div className="relative flex items-center justify-center mb-16">
        {isRecording && <div className="absolute w-32 h-32 bg-red-500 rounded-full opacity-20 animate-ping" />}
        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
          <Mic className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setIsRecording(!isRecording)} 
          className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition"
          title={isRecording ? "Pause" : "Resume"}
        >
          {isRecording ? <Pause className="w-5 h-5" /> : <Mic className="w-5 h-5 text-red-400" />}
        </button>
        
        <button 
          onClick={handleRetry} 
          className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition text-amber-500"
          title="Reset & Retry"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button 
          onClick={handleStop} 
          className="w-14 h-14 rounded-full bg-red-600 border border-red-500 flex items-center justify-center hover:bg-red-500 transition"
          title="Finish & Save"
        >
          <Square className="w-5 h-5 fill-current" />
        </button>
      </div>

      <div className="w-full max-w-2xl mt-16 p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-48">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                  <span className={isRecording ? "w-2 h-2 rounded-full bg-teal-400 animate-pulse" : "w-2 h-2 rounded-full bg-slate-500"} />
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Live Transcript (Browser Native)</span>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-slate-300">
              {liveText}
              <span className="italic text-slate-500">{interimText}</span>
              {!liveText && !interimText && <span className="italic text-slate-600">Start speaking into your microphone...</span>}
          </div>
      </div>
    </div>
  );
}
