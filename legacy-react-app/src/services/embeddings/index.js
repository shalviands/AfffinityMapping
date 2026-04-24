// Free semantic embeddings for longitudinal cluster matching
// Uses Gemini Embedding API — free tier: 1500 requests/day

export async function getEmbedding(text) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (geminiKey) {
    try {
      return await getGeminiEmbedding(text, geminiKey);
    } catch (err) {
      console.warn('Gemini Embedding failed, falling back to browser:', err);
    }
  }

  // Fallback: run embeddings in-browser using transformers.js (completely free, no API)
  return getBrowserEmbedding(text);
}

async function getGeminiEmbedding(text, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Gemini Embedding API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.embedding.values; // 768-dimension vector
}

// Browser-side embeddings using transformers.js — zero cost, runs locally
let pipeline = null;
async function getBrowserEmbedding(text) {
  if (!pipeline) {
    try {
      const { pipeline: createPipeline } = await import(
        'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
      );
      pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (err) {
      console.error('Failed to load transformers.js:', err);
      // Return a dummy embedding if everything fails so the app doesn't crash
      return new Array(384).fill(0);
    }
  }
  const output = await pipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Cosine similarity — used for cluster matching across sessions
export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}
