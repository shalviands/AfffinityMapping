import { useState } from 'react';
import { diarizeAudio } from '../services/bhashini/diarize.service.js';
import { transcribeAudio } from '../services/bhashini/transcribe.service.js';

export const useBhashini = () => {
  const [processingLog, setProcessingLog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processAudioFile = async (blob) => {
    setIsProcessing(true);
    setProcessingLog([]);

    try {
      // 1. Diarize into segments
      const segments = await diarizeAudio(blob);
      const builtSegments = [];
      let finalTranscript = "";

      // 2. Loop over and transcribe
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const { transcript, confidence, engine } = await transcribeAudio(blob, seg.languageHint);
        
        const logItem = { segmentIndex: i, language: seg.languageHint, engine, confidence };
        setProcessingLog(prev => [...prev, logItem]);
        
        builtSegments.push({
            ...seg,
            text: transcript
        });
        
        finalTranscript += `${seg.speaker}: ${transcript}\n`;
      }

      setIsProcessing(false);
      return {
        transcript: finalTranscript.trim(),
        segments: builtSegments,
        processingLog
      };

    } catch (e) {
      setIsProcessing(false);
      console.error(e);
      throw e;
    }
  };

  return { processAudioFile, isProcessing, processingLog };
};
