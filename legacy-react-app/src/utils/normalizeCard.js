/**
 * Normalizes raw insight objects from AI extraction service 
 * to the internal system schema used across UI and stores.
 */
export function normalizeCard(raw, index, stakeholderName = '', sessionId = null) {
  // Ensure we have a unique ID that survives re-normalization
  const id = raw.id || `c-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
  
  return {
    id,
    // Map 'insight' (AI schema) or 'text' (fallback) to 'text' (UI schema)
    text: (raw.insight || raw.text || '').trim(),
    
    // Verbatim quote
    quote: (raw.quote || '').trim(),
    
    // Metadata & Attribution
    speaker: raw.speaker || stakeholderName || 'unknown',
    timestamp: raw.timestamp || 'unknown',
    originalStakeholder: stakeholderName,
    sessionId: sessionId,
    
    // Qualitative attributes
    sentiment: raw.sentiment || 'neutral',
    confidence: raw.confidence || 'high',
    assertive: !!raw.assertive,
    theme: raw.theme || '',
    
    // Aggregate data
    frequency: raw.frequency || 1,
    
    // Status
    createdAt: new Date().toISOString()
  };
}
