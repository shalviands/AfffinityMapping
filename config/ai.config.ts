export const AI_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: process.env.OPENROUTER_API_KEY || '',

  appTitle: 'INCUBX Affinity Mapping Tool',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  models: {
    extraction: process.env.AI_MODEL_EXTRACTION || 'google/gemma-3-27b-it:free',
    clustering: process.env.AI_MODEL_CLUSTERING || 'meta-llama/llama-3.3-70b-instruct:free',
    synthesis: process.env.AI_MODEL_SYNTHESIS || 'google/gemma-3-27b-it:free',
    export: process.env.AI_MODEL_EXPORT || 'openrouter/free',
    fallback: process.env.AI_MODEL_FALLBACK || 'google/gemini-2.0-flash-lite-001',
    premium: process.env.AI_MODEL_PREMIUM || 'anthropic/claude-haiku-4.5',
  },

  rateLimits: {
    requestsPerMinute: 18,
    maxRetries: 3,
    retryAfterMs: 3000,
  },
};
