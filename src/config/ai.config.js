// OpenRouter unified config
// One key, one endpoint, 300+ models
// Get your key at: openrouter.ai

export const AI_CONFIG = {
  // Single OpenRouter endpoint — OpenAI-compatible
  baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: (import.meta.env.VITE_OPENROUTER_API_KEY && import.meta.env.VITE_OPENROUTER_API_KEY.startsWith('sk-or-v1-')) 
    ? import.meta.env.VITE_OPENROUTER_API_KEY 
    : localStorage.getItem('incubx_openrouter_key') || '',

  // App identification headers (required by OpenRouter)
  appTitle: 'INCUBX Affinity Mapping Tool',
  appUrl: import.meta.env.VITE_APP_URL || 'https://incubx.in',

  // Model tiers — user can override via env or localStorage
  models: {
    extraction: import.meta.env.VITE_MODEL_EXTRACTION || localStorage.getItem('incubx_model_extraction') || 'google/gemma-3-27b-it:free',
    clustering: import.meta.env.VITE_MODEL_CLUSTERING || localStorage.getItem('incubx_model_clustering') || 'meta-llama/llama-3.3-70b-instruct:free',
    synthesis: import.meta.env.VITE_MODEL_SYNTHESIS || localStorage.getItem('incubx_model_synthesis') || 'google/gemma-3-27b-it:free',
    export: import.meta.env.VITE_MODEL_EXPORT || localStorage.getItem('incubx_model_export') || 'openrouter/free',
    fallback: import.meta.env.VITE_MODEL_FALLBACK || localStorage.getItem('incubx_model_fallback') || 'google/gemini-2.0-flash-lite-001',
    premium: import.meta.env.VITE_MODEL_PREMIUM || localStorage.getItem('incubx_model_premium') || 'anthropic/claude-haiku-4.5',
  },

  // Rate limit handling
  rateLimits: {
    requestsPerMinute: 18, 
  },
};

if (!AI_CONFIG.apiKey) {
  console.warn("[AI Config] Critical: VITE_OPENROUTER_API_KEY is missing from environment and local storage.");
}

