export const BHASHINI_CONFIG = {
  apiKey:     import.meta.env.VITE_BHASHINI_API_KEY     || '',
  userId:     import.meta.env.VITE_BHASHINI_USER_ID     || '',
  pipelineId: import.meta.env.VITE_BHASHINI_PIPELINE_ID || '',
  baseUrl:    'https://dhruva-api.bhashini.gov.in',
  
  languages: {
    hindi:   'hi',
    telugu:  'te',
    tamil:   'ta',
    kannada: 'kn',
    marathi: 'mr',
    english: 'en',
  },

  confidenceThreshold: 0.70,

  whisper: {
    apiKey:  import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_KEY',
    model:   'whisper-1',
    baseUrl: 'https://api.openai.com/v1/audio/transcriptions',
  },
};
