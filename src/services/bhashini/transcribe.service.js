// Transcription service — three-tier fallback
// Tier 1: Web Speech API (free, browser-native, zero setup)
// Tier 2: Bhashini ASR (free, best for Indian languages)
// Tier 3: OpenAI Whisper (paid, $0.006/min, best accuracy fallback) / Groq Whisper (free tier)

import { BHASHINI_CONFIG } from '../../config/bhashini.config.js';

// Tier 1 — Web Speech API
export function transcribeWithWebSpeech(onResult, onEnd) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null; // not supported — caller falls back to Bhashini
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'hi-IN'; // works for Hindi-English code-switching
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(r => r[0].transcript)
      .join(' ');
    onResult(transcript, event.results[event.results.length - 1].isFinal);
  };

  recognition.onend = onEnd;
  recognition.onerror = (event) => {
    console.error('Web Speech Error:', event.error);
    onEnd();
  };
  
  recognition.start();

  return {
    stop: () => recognition.stop(),
    engine: 'webspeech',
  };
}

// Tier 2 — Bhashini ASR (for file upload and when Web Speech insufficient)
export async function transcribeWithBhashini(audioBlob, languageCode = 'hi') {
  const base64Audio = await blobToBase64(audioBlob);

  const payload = {
    pipelineTasks: [{
      taskType: 'asr',
      config: {
        language: { sourceLanguage: languageCode },
        serviceId: BHASHINI_CONFIG.pipelineId,
        audioFormat: 'wav',
        samplingRate: 16000,
      },
    }],
    inputData: {
      audio: [{ audioContent: base64Audio }],
    },
  };

  try {
    const response = await fetch(`${BHASHINI_CONFIG.baseUrl}/services/inference/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': BHASHINI_CONFIG.apiKey,
        'userID': BHASHINI_CONFIG.userId,
        'ulcaApiKey': BHASHINI_CONFIG.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Fall through to Groq/Whisper
        return transcribeWithGroqWhisper(audioBlob);
    }

    const data = await response.json();
    const transcript = data?.pipelineResponse?.[0]?.output?.[0]?.source || '';
    const confidence = data?.pipelineResponse?.[0]?.output?.[0]?.confidence || 0;

    if (confidence < BHASHINI_CONFIG.confidenceThreshold) {
      // Low confidence — try Groq
      return transcribeWithGroqWhisper(audioBlob);
    }

    return { transcript, engine: 'bhashini', confidence };
  } catch (err) {
    console.error('Bhashini error:', err);
    return transcribeWithGroqWhisper(audioBlob);
  }
}

// Groq Whisper (Best free alternative to OpenAI Whisper)
export async function transcribeWithGroqWhisper(audioBlob, language = 'hi') {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    // Last fallback to OpenAI if available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) return transcribeWithWhisper(audioBlob);
    return { transcript: '', engine: 'none', error: 'No transcription keys configured' };
  }

  const formData = new FormData();
  formData.append('file', new File([audioBlob], 'audio.wav', { type: 'audio/wav' }));
  formData.append('model', 'whisper-large-v3-turbo'); 
  formData.append('language', language);
  formData.append('response_format', 'verbose_json');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}` },
      body: formData,
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      transcript: data.text || '',
      engine: 'groq-whisper',
      segments: data.segments || [], 
      confidence: 0.95,
    };
  } catch (err) {
    console.error('Groq Whisper error:', err);
    return null;
  }
}

// Tier 3 — OpenAI Whisper fallback
async function transcribeWithWhisper(audioBlob) {
  const whisperKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!whisperKey) throw new Error('Whisper fallback requires VITE_OPENAI_API_KEY');

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('language', 'hi'); 

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${whisperKey}` },
      body: formData,
    });

    const data = await response.json();
    return { transcript: data.text || '', engine: 'whisper', confidence: 1.0 };
  } catch (err) {
      console.error('Whisper error:', err);
      return { transcript: '', engine: 'error' };
  }
}

// Helper
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

