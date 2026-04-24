import { AI_CONFIG } from '../../config/ai.config';

// Single function for ALL AI calls in the app
// Handles: rate limiting, retries, JSON repair, fallback

export async function callAI({
  systemPrompt,
  userPrompt,
  model,           // uses AI_CONFIG.models.extraction by default
  jsonMode = true, // most calls need JSON output
  maxTokens = 3000,
  retryCount = 0   // Internal use for self-correction
}) {
  if (!AI_CONFIG.apiKey) {
    throw new AIError('OpenRouter API Key is missing. Please check your .env file (VITE_OPENROUTER_API_KEY) or go to AI Model Settings to set it manually.', 401);
  }

  const selectedModel = model || AI_CONFIG.models.extraction;

  // For the second attempt, specifically tell AI to fix its formatting
  const finalUserPrompt = retryCount > 0 
    ? `Your previous response was invalid JSON. RETURN ONLY VALID JSON. Start with [ and end with ]. No explanation.\n\nORIGINAL PROMPT: ${userPrompt}`
    : userPrompt;

  const requestBody = {
    model: selectedModel,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: finalUserPrompt   },
    ],
    ...(jsonMode && {
      response_format: { type: 'json_object' },
    }),
  };

  const headers = {
    'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': AI_CONFIG.appUrl,
    'X-Title': AI_CONFIG.appTitle,
  };

  if (import.meta.env.DEV) {
      console.log(`[AI Request] ${selectedModel} via OpenRouter`);
      console.log(`[AI Auth] Header: Bearer ${AI_CONFIG.apiKey.substring(0, 10)}...${AI_CONFIG.apiKey.slice(-4)}`);
  }

  const maxRetries = AI_CONFIG.rateLimits?.maxRetries ?? 2;
  const retryAfter = AI_CONFIG.rateLimits?.retryAfterMs ?? 2000;

  // Retry loop with fallback
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const modelToUse = attempt >= 2 ? AI_CONFIG.models.fallback : selectedModel;

      const response = await fetch(AI_CONFIG.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...requestBody, model: modelToUse }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        if (attempt < maxRetries) {
          // Exponential backoff: base * 2^attempt (3.5s, 7s, 14s...)
          const backoff = retryAfter * Math.pow(2, attempt);
          await sleep(backoff);
          continue;
        }
        throw new AIError('Rate limit exceeded on all retries', 429);
      }

      if (response.status === 402) {
          throw new AIError('Insufficient OpenRouter credits. Please add credits at openrouter.ai or switch to a free model in settings.', 402);
      }

      if (response.status === 404) {
          throw new AIError(`Model "${modelToUse}" not found on OpenRouter. It may have been delisted.`, 404);
      }

      if (!response.ok) {
        const err = await response.json();
        throw new AIError(err?.error?.message || 'OpenRouter API error', response.status);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '';
      const modelUsed = data.model || modelToUse;

      if (import.meta.env.DEV) console.log(`[AI Response] Raw output:`, rawText);

      if (jsonMode) {
        try {
            const parsed = safeParseJSON(rawText);
            
            // Validation step
            if (Array.isArray(parsed)) {
                const validated = validateInsights(parsed);
                return { data: validated, modelUsed, raw: rawText };
            }
            
            return { data: parsed, modelUsed, raw: rawText };
        } catch (e) {
            if (import.meta.env.DEV) console.error(`[AI Parser Error] Failed to parse: "${rawText.slice(0, 100)}..."`, e);
            // Self-correction logic: retry once with stricter instruction
            if (retryCount < 2) {
                console.warn(`[AI Repair] JSON parsing failed. Retrying with self-correction... Attempt ${retryCount + 1}`);
                return callAI({ systemPrompt, userPrompt, model, jsonMode, maxTokens, retryCount: retryCount + 1 });
            }
            throw e;
        }
      }

      return { data: rawText, modelUsed };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
              console.warn(`[AI Timeout] Request timed out (30s). Retrying... Attempt ${attempt + 1}`);
              continue;
          }
          throw new AIError('Request timed out after multiple attempts. OpenRouter may be overloaded.', 408);
      }

      if (error instanceof AIError) {
          if (error.code === 422 && retryCount < 2) {
              return callAI({ systemPrompt, userPrompt, model, jsonMode, maxTokens, retryCount: retryCount + 1 });
          }
          throw error;
      }
      if (attempt === maxRetries) throw error;
      await sleep(retryAfter * Math.pow(2, attempt));
    }
  }
}

/**
 * Validates each insight card to ensure it matches the required schema.
 * Replaces missing or invalid fields with safe defaults.
 */
function validateInsights(input) {
    // Handle both direct array and object-wrapped array {"cards": [...] or "insights": [...]}
    const insights = Array.isArray(input) 
        ? input 
        : (input?.cards || input?.insights || []);

    if (!Array.isArray(insights)) return [];
    
    return insights.map((i, index) => ({
        id: i.id || `v-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        insight: i.insight || i.text || 'Missing insight text',
        quote: i.quote || '',
        speaker: i.stakeholder || i.speaker || 'unknown',
        sentiment: i.sentiment || 'neutral',
        confidence: i.confidence || 'high',
        timestamp: i.timestamp || 'unknown',
        theme: i.theme || ''
    }));
}

// Safe JSON parser with regex extraction and basic repair
function safeParseJSON(text) {
  if (!text) throw new AIError('Empty AI response', 422);

  // Remove potential markdown code block artifacts
  let clean = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Try parsing directly first
  try {
    return JSON.parse(clean);
  } catch (e) {
    // Primary: Regex to extract the first valid array [ ... ] or object { ... }
    const objectMatch = clean.match(/\{[\s\S]*\}/);
    const arrayMatch = clean.match(/\[[\s\S]*\]/);

    if (objectMatch || arrayMatch) {
        try {
            // Prioritize the OUTERMOST structure
            const firstChar = clean.search(/[\[\{]/);
            if (firstChar !== -1) {
                if (clean[firstChar] === '{' && objectMatch) return JSON.parse(objectMatch[0]);
                if (clean[firstChar] === '[' && arrayMatch) return JSON.parse(arrayMatch[0]);
            }
            return JSON.parse(objectMatch ? objectMatch[0] : arrayMatch[0]);
        } catch (innerE) {
            console.warn("[AI Repair] Regex-extracted JSON failed parse.", innerE);
        }
    }

    // Tertiary repair: find bounds manually
    const startObj = clean.indexOf('{');
    const endObj = clean.lastIndexOf('}');
    const startArr = clean.indexOf('[');
    const endArr = clean.lastIndexOf(']');
    
    if (startObj !== -1 && endObj !== -1) {
        try { return JSON.parse(clean.slice(startObj, endObj + 1)); } catch (err) {}
    }
    if (startArr !== -1 && endArr !== -1) {
        try { return JSON.parse(clean.slice(startArr, endArr + 1)); } catch (err) {}
    }

    throw new AIError('AI response contained no parseable JSON or was severely truncated', 422);
  }
}

class AIError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

