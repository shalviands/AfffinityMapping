export const BHASHINI_CONFIG = {
  apiKey:     process.env.BHASHINI_API_KEY     || '',
  userId:     process.env.BHASHINI_USER_ID     || '',
  pipelineId: process.env.BHASHINI_PIPELINE_ID || '',
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
    apiKey:  process.env.OPENAI_API_KEY || '',
    model:   'whisper-1',
    baseUrl: 'https://api.openai.com/v1/audio/transcriptions',
  },
};
