import { BHASHINI_CONFIG } from '@/config/bhashini.config';

export async function transcribeWithBhashini(audioBuffer: Buffer, languageCode = 'hi') {
  const base64Audio = audioBuffer.toString('base64');

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

  if (!BHASHINI_CONFIG.apiKey || !BHASHINI_CONFIG.userId) {
    console.log('Bhashini credentials missing, falling back to Groq/Whisper');
    return transcribeWithGroqWhisper(audioBuffer, languageCode);
  }

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
        const errorData = await response.json().catch(() => ({}));
        console.warn('Bhashini API error:', errorData);
        return transcribeWithGroqWhisper(audioBuffer, languageCode);
    }

    const data = await response.json();
    const transcript = data?.pipelineResponse?.[0]?.output?.[0]?.source || '';
    const confidence = data?.pipelineResponse?.[0]?.output?.[0]?.confidence || 0;

    if (confidence < BHASHINI_CONFIG.confidenceThreshold) {
      return transcribeWithGroqWhisper(audioBuffer, languageCode);
    }

    return { transcript, engine: 'bhashini', confidence };
  } catch (err) {
    console.error('Bhashini error:', err);
    return transcribeWithGroqWhisper(audioBuffer, languageCode);
  }
}

export async function transcribeWithGroqWhisper(audioBuffer: Buffer, language = 'hi') {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) return transcribeWithWhisper(audioBuffer, language);
    return { transcript: '', engine: 'none', error: 'No transcription keys configured' };
  }

  const formData = new FormData();
  const file = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' });
  formData.append('file', file, 'audio.wav');
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

async function transcribeWithWhisper(audioBuffer: Buffer, language = 'hi') {
  const whisperKey = process.env.OPENAI_API_KEY;
  if (!whisperKey) throw new Error('Whisper fallback requires OPENAI_API_KEY');

  const formData = new FormData();
  const file = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' });
  formData.append('file', file, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('language', language); 

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
