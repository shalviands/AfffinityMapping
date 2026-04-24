import { AI_CONFIG } from '@/config/ai.config';

export class AIError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CallAIProps {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  jsonMode?: boolean;
  maxTokens?: number;
  retryCount?: number;
}

export async function callAI({
  systemPrompt,
  userPrompt,
  model,
  jsonMode = true,
  maxTokens = 3000,
  retryCount = 0
}: CallAIProps): Promise<{ data: any; modelUsed: string; raw?: string }> {
  if (!AI_CONFIG.apiKey) {
    throw new AIError('OpenRouter API Key is missing.', 401);
  }

  const selectedModel = model || AI_CONFIG.models.extraction;

  const finalUserPrompt = retryCount > 0 
    ? `Your previous response was invalid JSON. RETURN ONLY VALID JSON. No explanation.\n\nORIGINAL PROMPT: ${userPrompt}`
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

  const maxRetries = AI_CONFIG.rateLimits.maxRetries;
  const retryAfter = AI_CONFIG.rateLimits.retryAfterMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for server-side

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
          const backoff = retryAfter * Math.pow(2, attempt);
          await sleep(backoff);
          continue;
        }
        throw new AIError('Rate limit exceeded on all retries', 429);
      }

      if (!response.ok) {
        const err = await response.json();
        throw new AIError(err?.error?.message || 'OpenRouter API error', response.status);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '';
      const modelUsed = data.model || modelToUse;

      if (jsonMode) {
        try {
          const parsed = safeParseJSON(rawText);
          
          if (Array.isArray(parsed) || (parsed && typeof parsed === 'object' && ('cards' in parsed || 'insights' in parsed))) {
            const validated = validateInsights(parsed);
            return { data: validated, modelUsed, raw: rawText };
          }
          
          return { data: parsed, modelUsed, raw: rawText };
        } catch (e) {
          if (retryCount < 2) {
            return callAI({ systemPrompt, userPrompt, model, jsonMode, maxTokens, retryCount: retryCount + 1 });
          }
          throw e;
        }
      }

      return { data: rawText, modelUsed };

    } catch (error: unknown) {
      const err = error as any;
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        if (attempt < maxRetries) continue;
        throw new AIError('Request timed out after multiple attempts.', 408);
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
  
  throw new AIError('Failed to call AI after multiple attempts.', 500);
}

function validateInsights(input: any) {
  const insights = Array.isArray(input) 
    ? input 
    : (input?.cards || input?.insights || []);

  if (!Array.isArray(insights)) return [];
  
  return insights.map((i: any, index: number) => ({
    id: i.id || `v-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    insight: i.insight || i.text || 'Missing insight text',
    quote: i.quote || '',
    speaker: i.stakeholder || i.speaker || 'unknown',
    sentiment: i.sentiment || 'neutral',
    confidence: i.confidence || 'high',
    timestamp: i.timestamp || 'unknown',
    theme: i.theme || '',
    assertive: i.assertive || false
  }));
}

function safeParseJSON(text: string) {
  if (!text) throw new AIError('Empty AI response', 422);

  const clean = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    const objectMatch = clean.match(/\{[\s\S]*\}/);
    const arrayMatch = clean.match(/\[[\s\S]*\]/);

    if (objectMatch || arrayMatch) {
      try {
        const firstCharIndex = clean.search(/[\[\{]/);
        if (firstCharIndex !== -1) {
          if (clean[firstCharIndex] === '{' && objectMatch) return JSON.parse(objectMatch[0]);
          if (clean[firstCharIndex] === '[' && arrayMatch) return JSON.parse(arrayMatch[0]);
        }
        if (objectMatch) return JSON.parse(objectMatch[0]);
        if (arrayMatch) return JSON.parse(arrayMatch[0]);
        throw new Error('No match');
      } catch (innerE) {}
    }

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

    throw new AIError('AI response contained no parseable JSON', 422);
  }
}
